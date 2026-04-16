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