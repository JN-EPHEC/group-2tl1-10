import type { NextFunction, Request, Response} from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// TODO : Importation du modèle sequelize des utilisateurs
// import User from '../models/user.model';

// Inscription 
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, pseudo, password } = req.body;

        if (!email || !pseudo || !password) {
            return res.status(400).json({ error: "Tous les champs sont requis. "});
        }

        // Syntaxe Sequelize pour chercher un utilisateur
        const existingUser = await User.findOne({
            where: {email: email }
        });

        if (existingUser) {
            return res.status(409).json({ error: "Cet email est déjà utilisé."});
        }

        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Syntaxe Sequelize pour créer un utilisateur 
        const newUser = await User.create({
            email: email,
            pseudo: pseudo,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Joueur créé avec succès, prêt pour le quiz !",
            user: {
                id: newUser.id, // Avec Sequelize, id est généralement auto-généré
                email: newUser.email,
                pseudo: newUser.pseudo
            }
        });

    } catch(error) {
        next(error);
    }
} ;

// Connexion 
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Vérification de la présence des champs
        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe requis."});
        }

        // * Simulation d'un utilisateur virtuelle en attendant le modèle user 
        // La requête est mise en commentaire en attendant
        // const user: any = await User.findOne({ where: { email } });

        // Création du faux utilisateur : 
        const user = {
            id: 1, 
            email: "test@quiz.com",
            pseudo: "TesteurFou",
            // Utilisation du hash généré par bcrypt pour le mot de passe : "password123"
            password: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQG8.RMG"
        }

        // Pour le test, si on n'essaie pas de se connecter avec test@quiz.com, on simule une erreur
        if (email !== user.email) {
            return res.status(401).json({ error: "Identifiants incorrects." });
        }

        // Comparer le mot de passe reçu avec celui haché en base de données
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Identifiants incorrects."});
        }

        // Générer l'Access Token (Durée très courte : 15 minutes)
        const token = jwt.sign({ id: user.id, email: user.email }, 'SECRET_JWT', { expiresIn: '15m' });

        // Générer le Refresh Token (Durée longue : 7 jours)
        const refreshToken = jwt.sign({ id: user.id, email: user.email }, 'SECRET_REFRESH', { expiresIn: '7d' }); 

        // Envoyer le Refresh Token dans le cookie HttpOnly
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours en millisecondes
        });

        // Renvois de la réponse au client et sortie de la fonction
        return res.status(200).json({
            message: "Connexion réussie !",
            token: token,
            user: {
                id: user.id,
                pseudo: user.pseudo
            }
        });
    
    } catch(error) {
        next(error);
    }
};

// Rafraîchissement du token 
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Lire le cookie HttpOnly grâce à cookie-parser
        const incomingRefreshToken = req.cookies?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ error: "Non autorisé, aucun token de rafraîchissement fournit." });
        }

        // Vérifier la validité mathématique du Refresh Token
        jwt.verify(incomingRefreshToken, 'SECRET_REFRESH', async (err: any, decoded: any) => {
            if (err) {
                // Si le token est expiré ou falsifié, on refuse l'accès
                return res.status(403).json({ error: "Refresh token invalide ou expiré. Veuillez vous reconnecter." });
            }

            // Vérifier que l'utilisateur existe toujours en base de données
            const user: any = await User.findByPk(decoded.id);

            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé." });
            }

            // Générer un NOUVEAU token d'accès tout frais
            const newAccessToken = jwt.sign(
                { id: user.id, email: user.email },
                'SECRET_JWT',
                { expiresIn: '15m' }
            );

            // Renvoyer le nouveau pass d'entrée
            return res.status(200).json({
                message: "Token rafraîchi avec succès",
                token: newAccessToken
            });
        });

    } catch(error) {
        next(error);
    }
};