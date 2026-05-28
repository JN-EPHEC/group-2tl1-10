import { getTopScores, saveScore } from '../controllers/score.controller';
import { GameSession } from '../models';
import type { Request, Response, NextFunction } from 'express';

// On mock le fichier d'index des modèles
jest.mock('../models', () => ({
    GameSession: {
        findAll: jest.fn(),
        create: jest.fn()
    },
    User: {} // Mocké car utilisé dans l'inclusion (include)
}));

describe('Score Controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockReq = { body: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    // --- 1. GET TOP SCORES ---
    describe('getTopScores', () => {
        it('devrait retourner le top 10 des scores (200)', async () => {
            const fauxScores = [
                { totalScore: 5000, user: { pseudo: 'Champion' } },
                { totalScore: 3000, user: { pseudo: 'Challenger' } }
            ];
            
            (GameSession.findAll as jest.Mock).mockResolvedValue(fauxScores);

            await getTopScores(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            // Attention : ton contrôleur renvoie un objet avec la clé "topScores"
            expect(mockRes.json).toHaveBeenCalledWith({ topScores: fauxScores });
        });
    });

    // --- 2. SAVE SCORE ---
    describe('saveScore', () => {
        it('devrait retourner 404 si le score ou userId est manquant', async () => {
            // Test sans userId
            mockReq.body = { totalScore: 1500 }; 
            await saveScore(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "Le score et l'ID de l'utilisateur sont requis."});
        });

        it('devrait enregistrer le score et retourner 201 en cas de succès', async () => {
            mockReq.body = { totalScore: 5000, userId: 1 };
            
            const fausseSession = { id: 10, totalScore: 5000, status: 'FINISHED', userId: 1 };
            (GameSession.create as jest.Mock).mockResolvedValue(fausseSession);

            await saveScore(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Score enregistré avec succès !"
            }));
        });
    });
});