/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'], // Force Jest à lire le .env
  // On indique où se trouvent les tests
  roots: ['<rootDir>/src'], 
  // On active le rapport de couverture
  collectCoverage: true,
  coverageDirectory: 'coverage',
  // On cible les fichiers pour calculer le % (Services et Controllers/Routes)
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/controllers/**/*.ts',
    '!src/server.ts', // On exclut le point d'entrée pour ne pas fausser le score
  ],
  // Le seuil de victoire exigé !
  coverageThreshold: {
    global: {
      lines: 60,
    },
  },
};