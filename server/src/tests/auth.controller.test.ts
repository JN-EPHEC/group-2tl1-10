import { register, login, refreshToken, getMe } from '../controllers/auth.controller';
import User from '../models/user.model';
import type { Request, Response, NextFunction } from 'express';

// 1. On mock la base de données
jest.mock('../models/user.model');

// 2. On mock Bcrypt (pour éviter les conflits TS/CommonJS)
jest.mock('bcrypt', () => ({
    __esModule: true,
    default: {
        compare: jest.fn().mockResolvedValue(true),
        hash: jest.fn().mockResolvedValue('faux_hash')
    },
    compare: jest.fn().mockResolvedValue(true),
    hash: jest.fn().mockResolvedValue('faux_hash')
}));

jest.mock('jsonwebtoken', () => ({
    __esModule: true,
    default: {
        sign: jest.fn().mockReturnValue('faux_token_securise'),
        verify: jest.fn().mockImplementation((token, secret, cb) => cb(null, { id: 1, email: 'test@ephec.be' })),
        decode: jest.fn().mockReturnValue({ id: 1, email: 'test@ephec.be' })
    },
    sign: jest.fn().mockReturnValue('faux_token_securise'),
    verify: jest.fn().mockImplementation((token, secret, cb) => cb(null, { id: 1, email: 'test@ephec.be' })),
    decode: jest.fn().mockReturnValue({ id: 1, email: 'test@ephec.be' })
}));

describe('Auth Controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        // On initialise req avec body, cookies et headers pour couvrir toutes tes routes
        mockReq = { body: {}, cookies: {}, headers: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    // --- TESTS POUR REGISTER ---
    describe('Register', () => {
        it('devrait retourner 400 si des champs manquent', async () => {
            mockReq.body = { email: 'test@ephec.be' }; 
            await register(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('devrait retourner 409 si email existe', async () => {
            mockReq.body = { email: 'test@ephec.be', pseudo: 'justin', password: 'mdp' };
            (User.findOne as jest.Mock).mockResolvedValue({ id: 1 });
            await register(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(409);
        });

        it('devrait créer un utilisateur (201)', async () => {
            mockReq.body = { email: 'new@ephec.be', pseudo: 'justin', password: 'mdp' };
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.create as jest.Mock).mockResolvedValue({ id: 99 });
            
            await register(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });

    // --- TESTS POUR LOGIN ---
    describe('Login', () => {
        it('devrait retourner 400 si champs manquent', async () => {
            mockReq.body = { email: 'justin@ephec.be' };
            await login(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });

        it('devrait retourner 401 si utilisateur introuvable', async () => {
            mockReq.body = { email: 'inconnu@ephec.be', password: 'mdp' };
            (User.findOne as jest.Mock).mockResolvedValue(null);
            await login(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('devrait connecter avec succès (200)', async () => {
            mockReq.body = { email: 'justin@ephec.be', password: 'mdp' };
            (User.findOne as jest.Mock).mockResolvedValue({ id: 1, password: 'hash' });
            
            await login(mockReq as Request, mockRes as Response, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.cookie).toHaveBeenCalled(); // Vérifie la création du cookie httpOnly
        });
    });

    // --- TESTS POUR REFRESH TOKEN ---
    describe('Refresh Token', () => {
        it('devrait retourner 401 si aucun cookie de refresh', async () => {
            await refreshToken(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('devrait rafraîchir le token et retourner 200', async () => {
            mockReq.cookies = { refreshToken: 'vieux_token' };
            (User.findByPk as jest.Mock).mockResolvedValue({ id: 1, email: 'justin@ephec.be' });
            
            await refreshToken(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });

    // --- TESTS POUR GET ME (/me) ---
    describe('Get Me', () => {
        it('devrait retourner le profil utilisateur (200)', async () => {
            mockReq.headers = { authorization: 'Bearer token_valide' };
            (User.findByPk as jest.Mock).mockResolvedValue({ id: 1, pseudo: 'Justin', email: 'justin@ephec.be' });
            
            await getMe(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});