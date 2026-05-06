import type { Request, Response, NextFunction } from 'express';
import { Category } from '../models/category.model';
import { Question } from '../models/question.model';
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
                const answerTexts = q.answers.map((ans: any) => ans.text);

                const correctAns = q.answers.find((ans: any) => ans.isCorrect);
                const correctAnswerText = correctAns ? correctAns.text : null;

                const newQuestion = await Question.create({
                    title: q.text,
                    possibleAnswers: answerTexts,
                    correctAnswer: correctAnswerText,
                    categoryId: newCategory.id,
                    difficulty: 1
                    // TODO : Ajouter time limit pour le temps
                });

                if (q.settings) {
                    await Setting.create({
                        rageQuit: q.settings.rageQuit,
                        secretButton: q.settings.secretButton,
                        scoreMultiplier: q.settings.scoreMultiplier,
                        winSound: q.settings.winSound,
                        firstWinSound: q.settings.firstWinSound,
                        loseSound: q.settings.loseSound,
                        firstLoseSound: q.settings.firstLoseSound,
                        questionId: newQuestion.id // Clé étrangère de la question
                    })
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