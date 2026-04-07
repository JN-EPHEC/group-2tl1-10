import type { Request, Response} from 'express';

// Inscription 
export const register = async (req: Request, res: Response) => {
    // TODO: Récupérer l'email/password, hasher le MDP, sauver en DB
    res.status(200).json({message: "Bouchon: Route Register OK"});
} ;

// Connexion 
export const login = async (req: Request, res: Response) => {
    // TODO: Vérifier le MDP, générer le JWT et le Refresh Token
    res.status(200).json({ message: "Bouchon: Route Login OK"});
};

// Rafraîchissement du token 
export const refreshToken = async (req: Request, res: Response) => {
    // TODO: Vérifier le cookie HttpOnly, générer un nouveau JWT
    res.status(200).json({ message: "Bouchon: Route Refresh Token OK"});
}