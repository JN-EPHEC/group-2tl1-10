import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Lecture (Public)
router.post('/', categoryController.createCategory);

// Création (Protégé)
router.get('/', verifyToken, categoryController.getAllCategories);

export default router;