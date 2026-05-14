import { io } from "socket.io-client";

// URL et port du backend Node.js
const URL = "http://localhost:3000";

export const socket = io(URL, {
    autoConnect: false // On ne se connecte pas automatiquement au chargement du site, cela sera fait manuellement lorsque quand on rentre dans le jeu
})