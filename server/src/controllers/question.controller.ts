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

export const getQuestionById = (req: Request, res: Response) => {
    // TODO : Récupérer la question selon l'ID de la BDD et la tables des questions
    res.status(200).json({message: "Bouchon: Route GetQuestionById OK"});
};

// 2. Méthodes protégés 

export const createQuestion = (req: Request, res: Response) => {
    // TODO : Créer une question de la requête du client et l'ajouter à la table des questions
    res.status(200).json({message: "Bouchon: Route createQuestion OK"});
};

export const updateQuestion = (req: Request, res: Response) => {
    // TODO : Mettre à jour une question existante dans la table des questions
    res.status(200).json({message: "Bouchon: Route updateQuestion OK"});
};

export const deleteQuestion = (req: Request, res: Response) => {
    // TODO : Supprimer une question existant dans la table des questions
    res.status(200).json({message: "Bouchon: Route deleteQuestion OK"});
};
