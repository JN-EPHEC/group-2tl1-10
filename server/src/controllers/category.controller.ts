import type { Request, Response, NextFunction } from 'express';
import Category from '../models/category.model';
import Question from '../models/question.model';
import Setting from '../models/setting.model'
import { error } from 'console';

// Créer une catégorie
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, questions } = req.body;

        const userId = (req as any).user.id;

        if (!name) {
            return res.status(400).json({ error: "Le nom de la catégorie est obligatoire." });
        }

        // Sauvegarde du Quiz (Category/Quiz)
        const newCategory = await Category.create({ name, description, userId });

        // On vérifie si le frontend a bien envoyé des questions
        if (questions && Array.isArray(questions) && questions.length > 0) {

            for (const q of questions) {
                const answerTexts = q.answers.map((ans: any) => ans.text);

                // Récupérer TOUTES les réponses correctes, pas juste la première
                const correctAnswers = q.answers
                    .filter((ans: any) => ans.isCorrect)
                    .map((ans: any) => ans.text);

                const newQuestion = await Question.create({
                    title: q.text,
                    possibleAnswers: answerTexts,
                    correctAnswer: correctAnswers.length > 0 ? JSON.stringify(correctAnswers) : null,
                    correctAnswers: correctAnswers.length > 0 ? correctAnswers : [],
                    categoryId: newCategory.id,
                    difficulty: q.timeLimit || 1
                    // TODO : Ajouter time limit pour le temps
                });

                if (q.settings) {
                    await Setting.create({
                        rageQuit: q.settings.rageQuit,
                        secretButton: q.settings.secretButton,
                        jumpingButtons: q.settings.jumpingButtons,
                        enableSounds: q.settings.enableSounds,
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
        const userId = (req as any).user.id;
        const categories = await Category.findAll({
            where: { userId: userId }
        });
        return res.status(200).json(categories);
    } catch(error) {
        next(error);
    }
};

// Obtenir une catégorie par son ID
export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const categoryId = req.params.id;

        // On cherche le quiz, et on INCLUT ses questions et paramètre 
        const category = await Category.findOne({
            where: { id: categoryId, userId: userId },
            include: [
                {
                    model: Question,
                    as: 'questions',
                    include: [{ model: Setting, as: 'settings' }]
                }
            ]
        });

        if (!category) {
            return res.status(404).json({ error: "Quiz introuvable ou vous n'êtes pas le propriétaire." });
        }

        return res.status(200).json(category);
    } catch(error) {
        next(error);
    }
};

// Route pour metre à jour les données d'un quiz
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, description, questions } = req.body;
        const userId = (req as any).user.id;

        // Vérifier que le quiz appartient bien à l'utilisateur
        const category = await Category.findOne({ where: { id, userId } });
        if (!category) {
            return res.status(404).json({ error: "Quiz introuvable ou accès refusé." });
        }

        // Mettre à jour les infos de base (Nom, Desc)
        await category.update({ name, description });

        // MISE À JOUR DES QUESTIONS : La méthode "Clean & Replace"
        await Question.destroy({ where: { categoryId: id } });

        // On ré-insère les questions envoyées
        if (questions && Array.isArray(questions)) {
            for (const q of questions) {
                const answerTexts = q.answers.map((ans: any) => ans.text);

                // Récupérer TOUTES les réponses correctes, pas juste la première
                const correctAnswers = q.answers
                    .filter((ans: any) => ans.isCorrect)
                    .map((ans: any) => ans.text);

                const newQuestion = await Question.create({
                    title: q.text,
                    possibleAnswers: answerTexts,
                    correctAnswer: correctAnswers.length > 0 ? JSON.stringify(correctAnswers) : null,
                    correctAnswers: correctAnswers.length > 0 ? correctAnswers : [],
                    categoryId: id, // L'id du quiz existant
                    difficulty: q.timeLimit || 1
                });

                if (q.settings) {
                    await Setting.create({
                        rageQuit: q.settings.rageQuit,
                        secretButton: q.settings.secretButton,
                        jumpingButtons: q.settings.jumpingButtons,
                        enableSounds: q.settings.enableSounds,
                        scoreMultiplier: q.settings.scoreMultiplier,
                        winSound: q.settings.winSound,
                        firstWinSound: q.settings.firstWinSound,
                        loseSound: q.settings.loseSound,
                        firstLoseSound: q.settings.firstLoseSound,
                        questionId: newQuestion.id
                    });
                }
            }
        }

        return res.status(200).json({ message: "Quiz mis à jour avec succès !" });
    } catch (error) {
        next(error);
    }
};