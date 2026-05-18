import { io } from "socket.io-client";

export const socket = io("/", {
    autoConnect: false // On ne se connecte pas automatiquement au chargement du site, cela sera fait manuellement lorsque quand on rentre dans le jeu
})