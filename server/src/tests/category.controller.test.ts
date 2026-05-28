import { createCategory, getAllCategories, getCategoryById, updateCategory } from '../controllers/category.controller';
import Category from '../models/category.model';
import Question from '../models/question.model';
import Setting from '../models/setting.model';
import type { Request, Response, NextFunction } from 'express';

// 1. On mock les 3 modèles utilisés par ce contrôleur
jest.mock('../models/category.model');
jest.mock('../models/question.model');
jest.mock('../models/setting.model');

describe('Category Controller', () => {
    // On utilise "any" pour mockReq afin de pouvoir injecter req.user facilement
    let mockReq: any;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        // On simule TOUJOURS un utilisateur connecté (le middleware d'auth est supposé l'avoir fait)
        mockReq = {
            body: {},
            params: {},
            user: { id: 1 } 
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    // --- TESTS POUR CREATE CATEGORY ---
    describe('createCategory', () => {
        it('devrait retourner 400 si le nom est manquant', async () => {
            mockReq.body = { description: 'Super Quiz' }; 
            await createCategory(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "Le nom de la catégorie est obligatoire." });
        });

        it('devrait retourner 409 si le quiz existe déjà (Doublon Sequelize)', async () => {
            mockReq.body = { name: 'Quiz Absurde' };
            
            // On simule une erreur typique de Sequelize pour une contrainte d'unicité
            const mockError = new Error();
            mockError.name = 'SequelizeUniqueConstraintError';
            (Category.create as jest.Mock).mockRejectedValue(mockError);

            await createCategory(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(409);
        });

        it('devrait créer une catégorie simple sans questions (201)', async () => {
            mockReq.body = { name: 'Nouveau Quiz', description: 'Test' };
            (Category.create as jest.Mock).mockResolvedValue({ id: 5, name: 'Nouveau Quiz' });

            await createCategory(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(Category.create).toHaveBeenCalled();
            expect(Question.create).not.toHaveBeenCalled(); // Vérifie qu'on n'entre pas dans la boucle
        });

        it('devrait créer une catégorie AVEC questions et settings (201)', async () => {
            mockReq.body = {
                name: 'Quiz Complet',
                questions: [
                    {
                        text: 'Question 1 ?',
                        answers: [{ text: 'Vrai', isCorrect: true }, { text: 'Faux', isCorrect: false }],
                        settings: { rageQuit: true }
                    }
                ]
            };

            // On simule les retours de la BDD pour chaque étape
            (Category.create as jest.Mock).mockResolvedValue({ id: 10 });
            (Question.create as jest.Mock).mockResolvedValue({ id: 100 });
            (Setting.create as jest.Mock).mockResolvedValue({ id: 1000 });

            await createCategory(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(Category.create).toHaveBeenCalled();
            expect(Question.create).toHaveBeenCalled(); // La boucle a fonctionné
            expect(Setting.create).toHaveBeenCalled(); // Les paramètres ont été créés
        });
    });

    // --- TESTS POUR GET ALL CATEGORIES ---
    describe('getAllCategories', () => {
        it('devrait lister toutes les catégories de l\'utilisateur (200)', async () => {
            const fauxQuiz = [{ id: 1, name: 'Quiz 1' }, { id: 2, name: 'Quiz 2' }];
            (Category.findAll as jest.Mock).mockResolvedValue(fauxQuiz);

            await getAllCategories(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(fauxQuiz);
        });
    });

    // --- TESTS POUR GET CATEGORY BY ID ---
    describe('getCategoryById', () => {
        it('devrait retourner 404 si la catégorie n\'existe pas', async () => {
            mockReq.params = { id: '99' };
            (Category.findOne as jest.Mock).mockResolvedValue(null);

            await getCategoryById(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('devrait retourner la catégorie avec ses inclusions (200)', async () => {
            mockReq.params = { id: '1' };
            const fauxQuiz = { id: 1, name: 'Quiz 1', questions: [] };
            (Category.findOne as jest.Mock).mockResolvedValue(fauxQuiz);

            await getCategoryById(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(fauxQuiz);
        });
    });

    // --- TESTS POUR UPDATE CATEGORY ---
    describe('updateCategory', () => {
        it('devrait retourner 404 si accès refusé ou quiz introuvable', async () => {
            mockReq.params = { id: '1' };
            (Category.findOne as jest.Mock).mockResolvedValue(null);

            await updateCategory(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
        });

        it('devrait mettre à jour et recréer les questions (200)', async () => {
            mockReq.params = { id: '1' };
            mockReq.body = {
                name: 'Quiz Modifié',
                questions: [
                    {
                        text: 'Nouvelle Q ?',
                        answers: [{ text: 'Oui', isCorrect: true }],
                        settings: { rageQuit: false }
                    }
                ]
            };

            // On simule une catégorie existante avec une fonction update intégrée
            const mockCategory = {
                id: 1,
                update: jest.fn().mockResolvedValue(true)
            };
            (Category.findOne as jest.Mock).mockResolvedValue(mockCategory);
            
            // On simule la suppression et recréation
            (Question.destroy as jest.Mock).mockResolvedValue(true);
            (Question.create as jest.Mock).mockResolvedValue({ id: 200 });
            (Setting.create as jest.Mock).mockResolvedValue(true);

            await updateCategory(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockCategory.update).toHaveBeenCalledWith({ name: 'Quiz Modifié', description: undefined });
            expect(Question.destroy).toHaveBeenCalledWith({ where: { categoryId: '1' } });
            expect(Question.create).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});