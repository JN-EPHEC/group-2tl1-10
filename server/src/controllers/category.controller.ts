import type { Request, Response, NextFunction } from 'express';
import { Category } from '../models/category.model';
import { Question } from '../models/question.model';
import { Answer } from '../models/playerAnswer.model'
import { Setting } from '../models/setting.model'

// Créer une catégorie
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, questions } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Le nom de la catégorie est obligatoire." });
        }

        // Sauvegarde du Quiz (Category/Quiz)
        const newCategory = await Category.create({ name, description });

        // On vérifie si le frontend a bien envoyé des questions
        if (questions && Array.isArray(questions) && questions.length > 0) {

            for (const q of questions) {
                // Sauvegarde des questions 
                const newQuestion = await Question.create({
                    text: q.text,
                    timeLimit: q.timeLimit,
                    categoryId: newCategory.id // Clé étrangère permettant la relation
                });

                // Sauvegarde des réponses
                if (q.answers && Array.isArray(q.answers)) {
                    for (const ans of q.answers) {
                        await Answer.create({
                            text: ans.text,
                            isCorrect: ans.isCorrect,
                            questionId : newQuestion.id // Clé étrangère permettant de relier à la question 
                        });
                    }
                }

                // Sauvegarde des paramètres (sons, rage quit...)
                if (q.settings) {
                    await Setting.create({
                        rageQuit: q.settings.rageQuit,
                        secretButton: q.settings.secretButton,
                        scoreMultiplier: q.settings.scoreMultiplier,
                        winSound: q.settings.winSound, 
                        firstWinSound: q.settings.firstWinSound,
                        loseSound: q.settings.loseSound,
                        firstLoseSound: q.settings.firstLoseSound,
                        questionId: newQuestion.id // Clé étrangère avec la question
                    });
                }
            }
        }

        return res.status(201).json({
            message: "Quiz, crée avec succès !",
            category: newCategory
        });
    } catch (error: any) {
        // Gestion des doublons
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: "Ce quiz existe déjà." });
        }
        next(error);
    }
};

// Lister toues les catégories
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await Category.findAll();
        return res.status(200).json(categories);
    } catch(error) {
        next(error);
    }
};