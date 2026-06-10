# 🙃Quiz Absurde 

Bienvenue dans le repo du **QUIZ ABSURDE !**, il s'agit d'un quiz mais celui où être bon suffit pas forcément à gagner ! 
Le site permet de créer des quizs avec des mécaniques absurdes et déstabilisantes qui feront perdre la tête des joeurs. Le créateur du quiz peut choisir les mécaniques qu'il souhaite activer, le temps et régler différentes options.
Les joueurs pourront ensuite jouer à ce quiz en le rejoignant via un code généré, et même via un qrcode pour jouer sur mobile. 
C'est ensuite que les joueurs subiront le quiz avec les mécaniques que le créateur à choisir d'implémenter, notamment via des sons, des événements et autres... 

---
## 📎Lien vers le site web
Le quiz absurde est disponible et accessible à l'adresse suivante : 
- [Accès au quiz absurde](https://www.l1-10.ephec-ti.be/) (*https://www.l1-10.ephec-ti.be/*)

### Comptes de Test
Afin de pouvoir tester l'interface de création (*Maker*) sans créer de compte, vous pouvez utiliser les 2 comptes mentionnée ci dessous : 

**1er compte**
Ce 1er compte dispose d'un quiz qu'il a crée
- **Email :** joueur1@quiz.com
- **Mot de passe :** monSuperMotDePasse123

Vous pourrez alors accéder à l'interface de création, et interagir avec un quiz déjà crée.

**2ème compte**
Ce 2ème compte créateur est la représentation de l'état de la page de création, avec un tout nouveau compte
- **Email :** le-bg@gmail.com
- **Mot de passe :** 1234567890

En le testant vous constaterez, que les données de l'autre ne sont pas visibles, montrant que les données des autres utilisateurs ne fuitent pas. 

---
## 📦Contenu du Projet & Architecture

Notre projet est divisé en 3 sous-dossiers principaux : 
- **.github** : Qui contient le fichier pour le déploiement automatique (CI), et pour la vérification automatique des tests unitaires (CD)
- **client** : Le Frontend, qui a été réalisé avec *vue.js*
- **server** : Le backend, qui est réalisé avec l'aide de *express.js*

### Architecture Frontend (`/client`)
Nous avons fait en sorte de concevoir une interface à la fois moderne, réactive (responsive) et optimisé pour tous les appareils (ordinateurs et smartphones). Pour y parvenir nous avons utilisés : 
- **Framework :** Vue 3, pour la composition de l'API, et l'écriture des scripts backend
- **Outil de build :** Vite
- **Langage :** Fichiers en `.vue` avec utilisation de html pour la mise en page, et typescript pour le script 
- **Styles :** Utilisation des classes de Talwind CSS pour concevoir le style des pages
- **Gestion des états :** Pinia (Pour la gestion de l'authentification et des sessions de jeu)
- **Communication :** Socket.io-client (Pour la synchronisation en temps réel des salons de jeu)

### Architecture backend (`/server`)
C'est ici que nous avons conçus notre API REST, et configurer un serveur de Web Socket qui sert à faire fonctionner les rooms pour les parties 
- **Runtime :** Node.js avec TypeScript
- **Framework API** : Express.js
- **Gestion des rooms** : Socket.io, qui sert à gérer les salons, la connexions des joueurs, des minuteurs ainsi que des événements du jeux. 
- **Base de données** : PostgreSQL (Gérée avec l'ORM Sequelize)
- **Tests & Qualité :** Jest & Supertest (Pour vérifier que la couverture du code atteigne un score supérieur à 60% sur les contrôleurs.)
---
## 🛠️Comment lancer le projet en local ? 
### Prérequis 
- **Node .js** (Version 18 ou supérieure recommandée)
- **PostgreSQL** (Pour la base de donnée locale en cours d'exécution)

### 1. Configuration du Backend (`/server`)
1. Naviguez dans le dossier serveur :
``` bash
cd server
```
2. Installez les dépendances : 
``` bash
npm install
```
3. Créez un fichier `.env` à la racine du dossier `/server` en vous basant sur l'exemple suivant : 
```
PORT=3000
DATABASE_URL=postgres://votre_user:votre_password@localhost:5432/nom_de_votre_bdd
JWT_SECRET=votre_cle_secrete_ultra_securisee
```
4. Lancez les migrations de la base de données et démarrez le serveur en mode développement : 
``` bash
npm run dev
```
5. (*Optionnel*) Pour exécuter la suite de tests unitaires et vérifier la couverture de code :
``` bash
npm run test:coverage
```

### 2. Configuration du Frontend (`/client`)
1. Ouvrez un nouveau terminal et naviguez dans le dossier client : 
``` bash
cd client
```
2. Installez les dépendances : 
``` bash
npm install
```
3. Démarrez le serveur de développement local : 
``` bash
npm run dev
```
4. Ouvrez votre navigateur sur l'adresse indiquée (généralement `http://localhost:5173`)

---
## 🌐Infrastructure de Déploiement
En production, l'application est hébergée sur un serveur privé virtuel (VPS)
- **Configuration su serveur Web/Proxy Inverse :** Nginx a été configuré directement sur le VPS (*et non dans un conteneur docker*) afin de gérer le routage du trafic. Il permet de servir les fichiers statiques du frontend (`/dist`) et redirige les requêtes `/api` ainsi que le trafic WebSocket `/socket.io` vers le processus Node.js s'exécutant en arrière-plan sur le port `3000`. 
- **Gestion de la sécurité** : L'ensemble du trafic est chiffré en HTTPS via des certificats SSL/TLS générés et renouvelés automatiquement par **Let's Encrypt (Certbot)**. 
