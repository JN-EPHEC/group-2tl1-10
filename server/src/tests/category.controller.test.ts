import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from '../controllers/category.controller';
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

    describe('deleteCategory', () => {
    it('doit supprimer un quiz, ses questions et ses paramètres en cascade', async () => {
        const req = { params: { id: '1' } } as unknown as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
        const next = jest.fn() as NextFunction;

        // Simulation : La BDD trouve 2 questions liées à ce quiz
        (Question.findAll as jest.Mock).mockResolvedValue([{ id: 10 }, { id: 11 }]);
        (Setting.destroy as jest.Mock).mockResolvedValue(2);
        (Question.destroy as jest.Mock).mockResolvedValue(2);
        (Category.destroy as jest.Mock).mockResolvedValue(1); // Le quiz est supprimé

        await deleteCategory(req, res, next);

        // Vérification que la logique en cascade s'est bien déclenchée dans le bon ordre
        expect(Question.findAll).toHaveBeenCalledWith({ where: { categoryId: '1' } });
        expect(Setting.destroy).toHaveBeenCalledWith({ where: { questionId: [10, 11] } });
        expect(Question.destroy).toHaveBeenCalledWith({ where: { categoryId: '1' } });
        expect(Category.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('doit renvoyer 404 si le quiz n\'existe pas', async () => {
        const req = { params: { id: '999' } } as unknown as Request;
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
        const next = jest.fn() as NextFunction;

        // Simulation : Aucun quiz trouvé
        (Question.findAll as jest.Mock).mockResolvedValue([]);
        (Category.destroy as jest.Mock).mockResolvedValue(0);

        await deleteCategory(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    it('doit attraper les erreurs serveur (catch)', async () => {
        const req = { params: { id: '1' } } as unknown as Request;
        const res = {} as unknown as Response;
        const next = jest.fn() as NextFunction;

        // Simulation : Crash brutal de la base de données
        (Question.findAll as jest.Mock).mockRejectedValue(new Error('Erreur fatale DB'));

        await deleteCategory(req, res, next);

        // Vérification que l'erreur est bien transmise au gestionnaire d'erreurs
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});

describe('getAllCategories', () => {
    it('doit gérer les erreurs serveur (catch) lors de la récupération', async () => {
        // On simule une requête avec un utilisateur connecté
        const req = { user: { id: 1 } } as any;
        const res = {} as any;
        const next = jest.fn();

        // On simule un crash lors de la recherche des catégories
        (Category.findAll as jest.Mock).mockRejectedValue(new Error('Crash DB test'));

        await getAllCategories(req, res, next);

        // On vérifie que l'erreur est bien envoyée au middleware d'erreur
        expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
});
});