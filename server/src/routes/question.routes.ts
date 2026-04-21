import { Router } from 'express';
import * as questionController from '../controllers/question.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Routes publiques
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);

// Routes protégées
router.post('/', verifyToken, questionController.createQuestion);
router.put('/:id', verifyToken, questionController.updateQuestion);
router.delete('/:id', verifyToken, questionController.deleteQuestion);

export default router;