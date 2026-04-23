import { Router } from 'express';
import * as scoreController from '../controllers/score.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// Récupérer le Top 10 (public)
router.get('/', scoreController.getTopScores);

// Enregistrer un score (protégé)
router.post('/', verifyToken, scoreController.saveScore);

export default router;