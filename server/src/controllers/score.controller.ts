import type { Request, Response, NextFunction } from "express";
// On importe les modèles depuis notre index
import { GameSession, User } from "../models";

// Récupérer le top 10 des scores
export const getTopScores = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const topScores = await GameSession.findAll({
            where: { status: 'FINISHED' }, // On ne classe que les parties terminées
            order: [['totalScore', 'DESC']], // Tri décroissant (du plus grand au plus petit)
            limit: 10, // On ne garde que le Top 10
            include: [{
                model: User,
                as: 'user', // L'alias défini dans nos relations
                attributes: ['pseudo'] // On ne veut PAS renvoyer le mot de passe ou l'email, juste le pseudo !
            }]
        });

        // Express renvoie la réponse au client
        return res.status(200).json({topScores});
    } catch(error) {
        next(error);
    }
};

// Enregistrer un score (Fin de partie)
export const saveScore = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { totalScore, userId } = req.body;

        // Validation basique
        if (totalScore === undefined || !userId) {
            return res.status(404).json({ error: "Le score et l'ID de l'utilisateur sont requis."});
        }  

        // Création de la session en BDD
        const newSession = await GameSession.create({
            totalScore: totalScore,
            status: 'FINISHED',
            userId: userId
        });

        return res.status(201).json({
            message: "Score enregistré avec succès !",
            session : newSession
        });
    } catch(error) {
        next(error);
    }
};
