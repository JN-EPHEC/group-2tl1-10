import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // On cherche le header "Authorization" dans la requête
    const authHeader = req.headers.authorization;

    // Si pas de header ou s'il ne commence pas pas "Bearer" -> Dehors !
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Accès refusé. Token manquant. " });
    }

    // On découpe la chaîne pour récupérer juste le token (on enlève le mot "Bearer")
    const token = authHeader.split(' ')[1];

    try {
        // On extrait le secret de manière sécurisée et on rassure TypeScript avec "as string"
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

        // On attache les infos décodées à la requête pour que le contrôleur puisse s'en servir
        (req as any).user = decoded;
        
        // Tout est bon, le videur ouvre la porte vers le contrôleur
        next();
    } catch(error) {
        // Si le token est faux, modifié, ou expiré -> Dehors !
        return res.status(403).json({ error: "Token invalide ou expiré." });
    }
};