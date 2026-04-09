import { Router } from 'express';
// Importation de tous les fonctions du contrôleur sur l'alias authController
import * as authController from '../controllers/auth.controller';

const router = Router(); 

// Définition des routes d'authentification 
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

export default router;