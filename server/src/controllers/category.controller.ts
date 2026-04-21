import type { Request, Response, NextFunction } from 'express';
import { Category } from '../models';

// Créer une catégorie
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Le nom de la catégorie est obligatoire." });
        }

        const newCategory = await Category.create({ name, description });

        return res.status(201).json({
            message: "Catégorie créée avec succès !",
            category: newCategory
        });
    } catch (error: any) {
        // Gestion des doublons (si on essaie de créer "Histoire" deux fois)
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: "Cette catégorie existe déjà." });
        }
        next(error);
    }
};

export const getAllCategories = (req: Request, res: Response) => {
    res.status(200).json({ message: "Méthode getAllCategories"});
};