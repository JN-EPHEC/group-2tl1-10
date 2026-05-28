import { getAllQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion } from '../controllers/question.controller';
import { Question } from '../models';
import type { Request, Response, NextFunction } from 'express';

// On mock le fichier d'index des modèles en entier
jest.mock('../models', () => ({
    Question: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn()
    },
    Category: {} // On mock Category juste pour que l'import ne plante pas (il est utilisé dans les "include")
}));

describe('Question Controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockReq = { body: {}, params: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    // --- 1. GET ALL QUESTIONS ---
    describe('getAllQuestions', () => {
        it('devrait retourner toutes les questions (200)', async () => {
            const faussesQuestions = [{ id: 1, title: 'Q1' }, { id: 2, title: 'Q2' }];
            (Question.findAll as jest.Mock).mockResolvedValue(faussesQuestions);

            await getAllQuestions(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(faussesQuestions);
        });
    });

    // --- 2. GET QUESTION BY ID ---
    describe('getQuestionById', () => {
        it('devrait retourner 404 si la question n\'existe pas', async () => {
            mockReq.params = { id: '99' };
            (Question.findByPk as jest.Mock).mockResolvedValue(null);

            await getQuestionById(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('devrait retourner la question si elle est trouvée (200)', async () => {
            mockReq.params = { id: '1' };
            const fausseQuestion = { id: 1, title: 'La super question' };
            (Question.findByPk as jest.Mock).mockResolvedValue(fausseQuestion);

            await getQuestionById(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(fausseQuestion);
        });
    });

    // --- 3. CREATE QUESTION ---
    describe('createQuestion', () => {
        it('devrait retourner 400 si le titre ou le tableau de réponses est manquant', async () => {
            // Test sans possibleAnswers
            mockReq.body = { title: 'Question sans réponses' };
            await createQuestion(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('devrait créer la question et retourner 201 en cas de succès', async () => {
            mockReq.body = { 
                title: 'Quel est le meilleur IDE ?', 
                possibleAnswers: ['VS Code', 'WebStorm', 'Notepad'],
                categoryId: 1
            };
            
            (Question.create as jest.Mock).mockResolvedValue({ id: 10, title: 'Quel est le meilleur IDE ?' });

            await createQuestion(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(Question.create).toHaveBeenCalled();
        });
    });

    // --- 4. UPDATE QUESTION ---
    describe('updateQuestion', () => {
        it('devrait retourner 404 si on essaie de modifier une question inexistante', async () => {
            mockReq.params = { id: '99' };
            (Question.findByPk as jest.Mock).mockResolvedValue(null);

            await updateQuestion(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('devrait mettre à jour la question (200)', async () => {
            mockReq.params = { id: '1' };
            mockReq.body = { title: 'Titre modifié' };

            // On simule une question existante avec sa fonction "update"
            const mockQuestionInstance = {
                id: 1,
                update: jest.fn().mockResolvedValue(true)
            };
            (Question.findByPk as jest.Mock).mockResolvedValue(mockQuestionInstance);

            await updateQuestion(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockQuestionInstance.update).toHaveBeenCalledWith({ title: 'Titre modifié' });
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    // --- 5. DELETE QUESTION ---
    describe('deleteQuestion', () => {
        it('devrait retourner 404 si la question à supprimer n\'existe pas', async () => {
            mockReq.params = { id: '99' };
            (Question.findByPk as jest.Mock).mockResolvedValue(null);

            await deleteQuestion(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('devrait supprimer la question (204)', async () => {
            mockReq.params = { id: '1' };
            
            // On simule une question avec sa fonction "destroy"
            const mockQuestionInstance = {
                id: 1,
                destroy: jest.fn().mockResolvedValue(true)
            };
            (Question.findByPk as jest.Mock).mockResolvedValue(mockQuestionInstance);

            await deleteQuestion(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockQuestionInstance.destroy).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(204);
        });
    });
});