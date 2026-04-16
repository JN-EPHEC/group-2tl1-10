import { Router } from 'express';
import * as questionController from '../controllers/question.controller';

const router = Router();

// Routes publiques
router.get('/', questionController.getAllQuestions);
router.get('/:id', questionController.getQuestionById);

// Routes protégées (c'est ici qu'il faudra mettre le middleware de vérification JWT)
router.post('/', questionController.createQuestion);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

export default router;