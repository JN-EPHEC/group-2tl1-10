FROM node:22-alpine

WORKDIR /app

# On copie uniquement les fichiers de dépendances pour mettre en cache l'installation
COPY package*.json ./
COPY tsconfig*.json ./

RUN npm install

# On copie le reste du code source
COPY . .

EXPOSE 3000

# On lance l'application via le script dev
CMD ["npm", "run", "dev"]