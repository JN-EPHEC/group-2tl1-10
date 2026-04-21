import type { Request, Response, NextFunction } from 'express';
import { Category } from '../models';

export const createCategory = (req: Request, res: Response) => {
    res.status(200).json({ message: "Méthode createCategory"});
};

export const getAllCategories = (req: Request, res: Response) => {
    res.status(200).json({ message: "Méthode getAllCategories"});
};