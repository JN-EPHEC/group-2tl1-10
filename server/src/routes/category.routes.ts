import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';

const router = Router();

// On écoute sur la racine de ce routeur
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getAllCategories);

export default router;