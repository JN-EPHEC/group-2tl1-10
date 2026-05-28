import rateLimit from 'express-rate-limit';

// Maximum 5 tentatives de connexion toutes les 15 minutes par adresse IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite chaque IP à 5 requêtes par `window` (ici, par 15 minutes)
  message: {
    error: "Too many login attempts from this IP, please try again after 15 minutes"
  },
  standardHeaders: true, // Renvoie les infos de limite dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
});