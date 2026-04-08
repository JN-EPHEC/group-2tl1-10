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

        // 1. Vérification de la présence des champs
        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe requis."});
        }

        // 2. Chercher l'utilisateur en base de données avec Sequelize
        const user: any = await User.findOne({ where: { email } });

        if (!user) {
            // Règle de sécurité : on reste toujours vague sur l'erreur (on ne dit pas si c'est l'email ou le mdp qui est faux)
            return res.status(401).json({ error: "Identifiants incorrects." });
        }

        // 3. Comparer le mot de passe reçu avec celui haché en base de données
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Identifiants incorrects."});
        }

        // 4. Génération du token JWT
        // En conditions réelles, ce secret DOIT être dans un fichier .env (ex: process.env.JWT_SECRET)
        const jwtSecret = process.env.JWT_SECRET || 'clef_secrete_provisoire_pour_le_dev';

        const token = jwt.sign(
            { id: user.id, email: user.email }, // Le payload : les données qu'on embarque dans le token
            jwtSecret,
            { expiresIn: '15m' } // On met une durée courte, on gérera le Refresh Token plus tard ! 
        );

        // 5. la réponse au client
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
export const refreshToken = async (req: Request, res: Response) => {
    // TODO: Vérifier le cookie HttpOnly, générer un nouveau JWT
    res.status(200).json({ message: "Bouchon: Route Refresh Token OK"});
}