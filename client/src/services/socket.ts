import { io } from "socket.io-client";

// Vite détecte automatiquement si on est en "Production" (sur le VPS) ou en local
const URL = import.meta.env.PROD 
  ? "http://www.l1-10.ephec-ti.be:5173" 
  : "http://localhost:5173";

export const socket = io(URL, {
    autoConnect: false // On ne se connecte pas automatiquement au chargement du site, cela sera fait manuellement lorsque quand on rentre dans le jeu
})