import { Router } from 'express';
// Mise en commentaire le temps du test de la route d’authentification 
// import * as scoreController from '../controllers/score.controller';

const router = Router();

// Récupérer le Top 10 (public)
// router.get('/', scoreController.getTopScores);

// Enregistrer un score (protégé)
// router.post('/', scoreController.saveScore);

export default router;