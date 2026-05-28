const request = require('supertest');

// 1. LE CORRECTIF EXPRESS : Force TypeScript à trouver la fonction default d'Express
jest.mock('express', () => {
    const actualExpress = jest.requireActual('express');
    return {
        __esModule: true,
        default: actualExpress,
        ...actualExpress
    };
});

// 1.5. LE CORRECTIF DES MIDDLEWARES : On neutralise cookie-parser et cors
jest.mock('cookie-parser', () => {
    return {
        __esModule: true,
        default: jest.fn(() => (req: any, res: any, next: any) => next())
    };
});

jest.mock('cors', () => {
    return {
        __esModule: true,
        default: jest.fn(() => (req: any, res: any, next: any) => next())
    };
});

// 2. Mock de la base de données (version anti-hoisting)
jest.mock('../config/database', () => {
    const fakeModel = {
        hasMany: jest.fn(), belongsTo: jest.fn(), hasOne: jest.fn(), belongsToMany: jest.fn(),
        findByPk: jest.fn(), findAll: jest.fn(), create: jest.fn(), update: jest.fn(),
        bulkCreate: jest.fn(), destroy: jest.fn(), sync: jest.fn()
    };
    return {
        __esModule: true,
        default: {
            getInstance: jest.fn().mockReturnValue({
                authenticate: jest.fn().mockResolvedValue(true),
                define: jest.fn().mockReturnValue(fakeModel)
            })
        }
    };
});

// 3. Mock du module HTTP (bloque le 3000, mais laisse Supertest tranquille)
jest.mock('http', () => {
    const actualHttp = jest.requireActual('http');
    return {
        __esModule: true,
        ...actualHttp,
        default: actualHttp,
        createServer: jest.fn((app) => {
            const server = actualHttp.createServer(app);
            // On sauvegarde la vraie fonction réseau
            const originalListen = server.listen.bind(server);
            
            // On modifie le comportement
            server.listen = function(...args: any[]) {
                // Si c'est le code qui démarre sur le port 3000, on le neutralise
                if (args[0] === 3000 || args[0] === process.env.PORT) {
                    const cb = args.find(arg => typeof arg === 'function');
                    if (cb) cb();
                    return this;
                }
                // Si c'est Supertest (qui demande un port réseau temporaire), on le laisse faire !
                return originalListen(...args);
            };
            return server;
        })
    };
});

// 4. Mock de Socket.io
let connectionCallback: any;
let mockSocket: any;

jest.mock('socket.io', () => {
    return {
        Server: jest.fn().mockImplementation(() => {
            return {
                on: jest.fn((event, cb) => {
                    if (event === 'connection') connectionCallback = cb;
                }),
                to: jest.fn().mockReturnThis(),
                emit: jest.fn(),
                sockets: { sockets: new Map() }
            };
        })
    };
});

// L'import dU serveur 
import { app } from '../services/server';

describe('Boss Final : Server & Socket.io', () => {

    beforeEach(() => {
        mockSocket = {
            id: 'joueur_123',
            on: jest.fn(),
            join: jest.fn(),
            to: jest.fn().mockReturnThis(),
            emit: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('Routes Express', () => {
        it('devrait répondre à la route racine / (200)', async () => {
            const res = await request(app).get('/');
            expect(res.status).toBe(200);
            expect(res.text).toBe("Bienvenue sur mon serveur API.");
        });

        it('devrait renvoyer les étudiants sur /api/data (200)', async () => {
            const res = await request(app).get('/api/data');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('devrait dire bonjour sur /api/hello/:name (200)', async () => {
            const res = await request(app).get('/api/hello/Justin');
            expect(res.status).toBe(200);
            expect(res.body.message).toBe("Bonjour Justin");
        });
    });

    describe('Mécaniques Socket.io (Parties)', () => {
        it('devrait créer une partie et renvoyer un roomCode', () => {
            connectionCallback(mockSocket);

            const createGameHandler = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'create_game')[1];
            const mockCallback = jest.fn();
            
            createGameHandler(1, mockCallback);

            expect(mockCallback).toHaveBeenCalled();
            expect(mockSocket.join).toHaveBeenCalled(); 
        });

        it('devrait permettre à un joueur de rejoindre une partie existante', () => {
            connectionCallback(mockSocket);

            const createGameHandler = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'create_game')[1];
            let codeRoom = '';
            createGameHandler(1, (res: any) => { codeRoom = res.roomCode; });

            const joinGameHandler = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'join_game')[1];
            const mockJoinCallback = jest.fn();
            
            joinGameHandler({ roomCode: codeRoom, username: 'TestPlayer' }, mockJoinCallback);

            expect(mockJoinCallback).toHaveBeenCalledWith({ success: true });
            expect(mockSocket.join).toHaveBeenCalledWith(codeRoom);
        });
    });
});