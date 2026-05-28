import 'dotenv/config';
import express, { response, type Application, type Request, type Response} from 'express'; 
import userRoutes from "../routes/userRoutes"; // Importation de la route user
import adminRoutes from "../routes/adminRoutes"; // Importation de la route admin
import authentificationRoutes from "../routes/auth.routes"; // NOUVEAU : Importation de la route authentification pour le quiz
import questionRoutes from "../routes/question.routes"; // NOUVEAU : Importation de la route des questions pour le quiz
import scoreRoutes from "../routes/score.routes"; // NOUVEAU : Importation de la route pour le score des quizs
import categoryRoutes from "../routes/category.routes"; // Importation de la route pour les categories 
import { requestLogger } from "../middlewares/logger";
import { errorHandler } from "../middlewares/errorHandler";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from '../config/swagger';
import cors from 'cors';
import Database from '../config/database'; // Import de la classe
import authRoutes from "../routes/authRoutes";
import profileRoutes from "../routes/profileRoutes";
import cookieParser from 'cookie-parser';
import { createServer } from 'http'; // Import création serveur pour le multijoueurs
import { Server } from 'socket.io'; // Import des sockets
import Category from '../models/category.model';
import Question from '../models/question.model';
import Setting from '../models/setting.model';
import GameSession from '../models/gameSession.model';
import PlayerAnswer from '../models/playerAnswer.model';

const app: Application = express(); 
const port = 3000; 

const sequelize = Database.getInstance();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

app.use(cookieParser());

app.use(cors());

app.use(express.static('public')); 

app.use(requestLogger); 

app.get('/', (req: Request, res: Response) => {
    res.send("Bienvenue sur mon serveur API.");
});

const etudiants = [
    { id: 1, lastName: "Dupont", firstName: "Jean" },
    { id: 2, lastName: "Martin", firstName: "Sophie" },
    { id: 3, lastName: "Doe", firstName: "John" },
];

app.get('/api/data', (req: Request, res: Response) => {
    res.json(etudiants); 
}); 

app.get('/api/hello/:name', (req: Request, res: Response) => {
    res.json({"message": `Bonjour ${req.params.name}`, "timestamp": new Date().toISOString()});
});

// Mise en place du routeur, avec toutes les routes de userRoutes qui utilisent '/api/users'
app.use('/api/users', userRoutes);
// Ajoute du routeur, avec toutes les routes de adminRoutes qui utilisent '/api/admin/basic'
app.use(adminRoutes);
// Mise en pause de l'ancienne route
// app.use(authRoutes);
app.use(profileRoutes);
// NOUVEAU : Utilisations des nouvelles routes pour le quiz
app.use('/api/auth', authentificationRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/categories', categoryRoutes);

async function startApp() {
    try {
        await sequelize.authenticate();
        console.log('Connexion à la base de données PostgreSQL établie avec succès.');
        httpServer.listen(PORT, '0.0.0.0', () => {
            console.log(`Serveur prêt sur le port ${PORT}`);
        });
    } catch (error) {
        console.error('Erreur critique de connexion avec la base de données :', error);
    }
};

app.use(errorHandler);

// Création du serveur HTTP à partir de express
const httpServer = createServer(app);
// Attachment de Socket.io au serveur HTTP
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Création d'un dictonnaire "en mémoire" pour stocker les parties en cours
const activeGames: Record<string, any> = {};

// Ecoute des la connexions des joueurs
io.on("connection", (Socket) => {
    console.log(`Nouvelle connexion : ${Socket.id}`);

    // Le créateur lance le lobby
    Socket.on("create_game", (quizId, callback) => {
        // On génère un code 4 chiffres
        const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

        // On enregistre la salle
        activeGames[roomCode] = {
            hostId: Socket.id,
            quizId: quizId,
            players: []
        };

        // Le créateur rejoint virtuellement la "Room" Socket.io
        Socket.join(roomCode);

        console.log(`Partie créée : Code ${roomCode} pour le Quiz ${quizId}`);

        // On renvoie le code au frontend du créateur
        callback({ roomCode });
    });

    // Un joueur rejoint le lobby

    Socket.on("join_game", (data, callback) => {
        const { roomCode, username } = data;

        // On vérifie si la salle existe
        if (activeGames[roomCode]) {
            Socket.join(roomCode); // Le joueur rejoint la Room

            // Ajout du joueur à la liste des joueurs
            activeGames[roomCode].players.push({ id: Socket.id, username });

            // On prévient le créateur : on envoie l'événemnt au hostId (le créateur)
            Socket.to(activeGames[roomCode].hostId).emit("player_joined", username);

            callback(({ success: true }));
        } else {
            callback({ success: false, message: "Code introuvable. Bruh." });
        }
    });

    Socket.on("start_game", async (roomCode) => {
        const game = activeGames[roomCode];
        if (!game || game.hostId !== Socket.id) return;

        try {
            // On récupère le quiz complet avec questions et réglages
            const quiz = await Category.findByPk(game.quizId, {
                include: [{
                    model: Question,
                    as: 'questions',
                    include: [{
                        model: Setting,
                        as: 'settings'
                    }]
                }]
            });

            // Si le quiz est vide, on bloque pour éviter le crash
            if (!quiz  || !quiz.questions || quiz.questions.length === 0) {
                console.log("Quiz vide !");
                return;
            }

            // Garder seulement les joueurs actuellement connectés
            const connectedPlayers = game.players.filter((p: any) => {
                const socket = io.sockets.sockets.get(p.id);
                return socket !== undefined;
            });
            game.players = connectedPlayers;

            // On prépare la partie
            game.questions = quiz.questions;
            game.currentQuestionIndex = 0;
            game.confusedCount = 0;
            game.status = 'playing';

            game.scores = {};
            game.responses = {};
            game.sessionIds = {};
            game.questionStartTime = Date.now();

            for (const p of game.players) {
                game.scores[p.id] = 0;
                try {
                    const session = await GameSession.create({
                        status: "IN_PROGRESS",
                        total: 0,
                        playerName: p.username,
                        userId: null
                    });
                    game.sessionIds[p.id] = session.id;
                } catch(err) {
                    console.error("Erreur création session BDD", err);
                }
            }

            // On dit à tout le monde de changer de page (sans envoyer la donnée)
            io.to(roomCode).emit("game_started");
            console.log(`Game ${roomCode} commencée, tout le monde change de page !`);

        } catch (error) {
            console.error("Erreur lancement game:", error);
        }
    });

    Socket.on("get_current_question", (roomCode, callback) => {
        const game = activeGames[roomCode];
        if (!game || !game.questions) return;

        const q = game.questions[game.currentQuestionIndex];

        // Si la question n'existe plus, on arrête tout !
        if (!q) return;

        // Vérifier s'il y a une bonne réponse définie
        let correctAnswers: string[] = [];
        if (Array.isArray(q.correctAnswers)) {
            correctAnswers = q.correctAnswers;
        } else if (typeof q.correctAnswer === 'string') {
            try { correctAnswers = JSON.parse(q.correctAnswer); }
            catch { correctAnswers = q.correctAnswer ? [q.correctAnswer] : []; }
        }

        // On renvoie la donnée pile quand le frontend la réclame
        callback({
            text: q.title,
            answers: q.possibleAnswers,
            index: game.currentQuestionIndex,
            total: game.questions.length,
            settings: q.settings,
            timeLimit: 15,
            hasNoCorrectAnswer: correctAnswers.length === 0
        });
    });

    // Le joueur soumet une réponse
    Socket.on("submit_answer", (data) => {
        const { roomCode, answer } = data;
        const game = activeGames[roomCode];
        if (!game) return;

        if (!game.responses[game.currentQuestionIndex]) {
            game.responses[game.currentQuestionIndex] = {};
        }

        // On calcule le temps passé
        const timeSpent = Math.floor((Date.now() - game.questionStartTime) / 1000);

        game.responses[game.currentQuestionIndex][Socket.id] = {
            providedAnswer: answer,
            timeSpent: timeSpent
        };

        // Vérifier si tous les joueurs ont répondu
        const allAnswered = game.players.every(p =>
            game.responses[game.currentQuestionIndex][p.id] !== undefined
        );

        if (allAnswered) {
            io.to(roomCode).emit("all_players_answered");
        }
    });

    // Le créateur révèle la réponse
    Socket.on("reveal_answer", async (roomCode) => {
        const game = activeGames[roomCode];
        if (!game) return;

        const currentQ = game.questions[game.currentQuestionIndex];

        // On transforme la chaîne en tableau
        let correctAnswers: string[] = [];
        if (Array.isArray(currentQ.correctAnswers)) {
            correctAnswers = currentQ.correctAnswers;
        } else if (typeof currentQ.correctAnswer === 'string') {
            try { correctAnswers = JSON.parse(currentQ.correctAnswer); }
            catch { correctAnswers = currentQ.correctAnswer ? [currentQ.correctAnswer] : []; }
        }

        const questionReponses = game.responses[game.currentQuestionIndex] || {};
        const dbAnswersToInsert: any[] = [];

        // On vérifie les réponses de TOUS les joueurs
        game.players.forEach((p: any) => {
            const responseObj = questionReponses[p.id] || {};
            const playerAnswer = responseObj.providedAnswer;
            let isCorrect = false;

            // Si aucune réponse : on gagne si on a rien répondu
            if (correctAnswers.length === 0) {
                isCorrect = (playerAnswer === undefined || playerAnswer === '');
            } else {
                isCorrect = correctAnswers.includes(playerAnswer);
            }

            if (isCorrect) {
                const multiplier = currentQ.settings?.scoreMultiplier || 1.0;
                game.scores[p.id] += (100 * multiplier);
            }

            // Préparation de l'insertion PlayerAnswer
            if (game.sessionIds[p.id]) {
                dbAnswersToInsert.push({
                    providedAnswer: playerAnswer || null,
                    isCorrect: isCorrect,
                    timeSpent: responseObj.timeSpent || null,
                    gameSessionId: game.sessionIds[p.id],
                    questionId: currentQ.id
                });
            }
        });

        // Insertion en masse pour ne pas surcharger la base
        if (dbAnswersToInsert.length > 0) {
            try {
                await PlayerAnswer.bulkCreate(dbAnswersToInsert);
            } catch(err) {
                console.error("Erreur insertion PlayerAnswers :", err);
            }
        }

        const leaderboard = game.players.map((p:any) => ({
            username: p.username,
            score: game.scores[p.id]
        })).sort((a:any, b:any) => b.score - a.score);

        io.to(roomCode).emit("results_revealed", {
            correctAnswers: correctAnswers,
            leaderboard: leaderboard
        });
    });

    // Passe à la question suivante
    Socket.on("next_question", async (roomCode) => {
        const game = activeGames[roomCode];
        if (!game) return;

        game.confusedCount = 0;

        // Sécurité : On empêche l'index d'aller plus loin que la fin du jeu
        if (game.currentQuestionIndex >= game.questions.length) return;

        // On incrémente l'index de la question
        game.currentQuestionIndex++;

        // S'il rete des questions 
        if (game.currentQuestionIndex < game.questions.length) {
            game.questionStartTime = Date.now(); // Reset du chrono
            // On prévient tout le monde que la suite est prête !
            io.to(roomCode).emit("next_question_ready");
        } else {
            // S'il n'y a plus de questions, c'est la fin du jeu !
            io.to(roomCode).emit("game_over");

            // C'est la fin, on met à jour les scores finaux
            for (const p of game.players) {
                if (game.sessionIds[p.id]) {
                    try {
                        await GameSession.update(
                            { totalScore: game.scores[p.id] || 0, status: 'FINISHED' },
                            { where: { id: game.sessionIds[p.id] } }
                        );
                    } catch (err) {
                        console.error("Erreur mise à jour finale GameSession :", err);
                    }
                }
            }

            // NETTOYAGE : On supprime la partie mémoire vive du serveur
            console.log(`Fermeture de la room ${roomCode} et nettoyage de la mémoire.`);
            delete activeGames[roomCode];
        }
    });

    // -- LES MECANIQUES ABSURDES  (Meilleur partie mdr :) )---

    // Le compteur de confusion 
    Socket.on('im_confused', (roomCode) => {
        const game = activeGames[roomCode];
        if (!game) return;

        // On initialise ou incrémente le compteur
        if (!game.confusedCount) game.confusedCount = 0;
        game.confusedCount ++;

        // On envoie la mise à jour UNIQUEMENT au créateur (hostId)
        io.to(game.hostId).emit("update_confused", game.confusedCount);
    });

    // Le Secret Button (Rickroll)
    Socket.on("trigger_secret", (roomCode) => {
        const game = activeGames[roomCode];
        if (!game) return;

        // On prévient le créateur d'afficher le Rickroll
        io.to(game.hostId).emit("activate_rickroll");
    });

    Socket.on("disconnect", () => {
        console.log(`Déconnexion : ${Socket.id}`);
        
        // Nettoyer les parties où ce joueur était impliqué
        for (const roomCode in activeGames) {
            const game = activeGames[roomCode];
            
            // Vérifier si c'est le créateur qui se déconnecte
            if (game.hostId === Socket.id) {
                console.log(`Créateur déconnecté de la partie ${roomCode}`);
                // Notifier les autres joueurs
                io.to(roomCode).emit("host_disconnected");
                // Supprimer la partie
                delete activeGames[roomCode];
            } else {
                // Vérifier si c'est un joueur normal
                game.players = game.players.filter((p: any) => p.id !== Socket.id);
                if (game.players.length === 0 && game.hostId !== Socket.id) {
                    console.log(`Partie ${roomCode} vide, suppression`);
                    delete activeGames[roomCode];
                }
            }
        }
    })
});

const PORT = process.env.PORT || 3000;

startApp();