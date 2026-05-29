import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Lecture
router.post('/', verifyToken, categoryController.createCategory);

// Création
router.get('/', verifyToken, categoryController.getAllCategories);
// Route pour obtenir un quiz par ID
router.get('/:id', verifyToken, categoryController.getCategoryById);

// Route pour mettre à jour un quiz
router.put('/:id', verifyToken, categoryController.updateCategory);
// Route pour supprimer une category
router.delete('/:id', verifyToken, categoryController.deleteCategory)

export default router;