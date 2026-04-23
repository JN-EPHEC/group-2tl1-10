import { Router } from 'express';
// Importation de tous les fonctions du contrôleur sur l'alias authController
import * as authController from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router(); 

// Définition des routes d'authentification 
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Route protégé 
router.get('/me', verifyToken, authController.getMe);

export default router;