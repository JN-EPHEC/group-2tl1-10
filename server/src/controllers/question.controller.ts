import type {Request, Response, NextFunction} from 'express';
// Import des modèles depuis le fichier d'index (qui contient les relations)
import { Question, Category } from '../models'

// 1. Méthodes publiques 

// Récupérer toutes les questions
export const getAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const questions = await Question.findAll({
            // On inclut directement la catégorie associée 
            include: [{model: Category, as: 'category', attributes: ['id', 'name'] }]
        });

        return res.status(200).json(questions);
    } catch(error) {
        next(error);
    }
};

// Récupérer une question par son ID
export const getQuestionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const question = await Question.findByPk(id , {
            include: [{ model: Category, as: 'category', attributes: ['name'] }]
        });

        if (!question) {
            return res.status(404).json({ error: "Question introuvable."});
        }

        return res.status(200).json(question);
    } catch(error) {
        next(error);
    }
};

// 2. Méthodes protégés 

// Créer une nouvelle question (Réservé aux Admins normalement)
export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, possibleAnswers, correctAnswer, difficulty, categoryId } = req.body;

        // Première validation 
        if (!title || !possibleAnswers || !Array.isArray(possibleAnswers)) {
            return res.status(400).json({ error: "Le titre et un tableau de réponse possibles sont requis."});
        }

        const newQuestion = await Question.create({
            title,
            possibleAnswers,
            correctAnswer, // Peut être null si question piège
            difficulty: difficulty || 1,
            categoryId
        });

        return res.status(201).json({
            message: "Question créée avec succès !",
            question: newQuestion
        });
    } catch(error) {
        next(error);
    }
};

// Modifier une question (Réservé aux Admins normalement)
export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates = req.body; // Récupération de tous les champs modifiés envoyés par le client

        const question = await Question.findByPk(id);
        if (!question) {
            return res.status(404).json({ error: "Question introuvable." });
        }

        // Mise à jour avec les nouvelles données
        await question.update(updates);

        return res.status(200).json({
            message: "Question mise à jour !",
            question
        });
    } catch(error) {
        next(error);
    }
};

export const deleteQuestion = (req: Request, res: Response) => {
    // TODO : Supprimer une question existant dans la table des questions
    res.status(200).json({message: "Bouchon: Route deleteQuestion OK"});
};
