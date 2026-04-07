import type { NextFunction, Request, Response} from 'express';
import bcrypt from 'bcrypt';
import { error } from 'node:console';
import { hash } from 'node:crypto';
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
export const login = async (req: Request, res: Response) => {
    // TODO: Vérifier le MDP, générer le JWT et le Refresh Token
    res.status(200).json({ message: "Bouchon: Route Login OK"});
};

// Rafraîchissement du token 
export const refreshToken = async (req: Request, res: Response) => {
    // TODO: Vérifier le cookie HttpOnly, générer un nouveau JWT
    res.status(200).json({ message: "Bouchon: Route Refresh Token OK"});
}