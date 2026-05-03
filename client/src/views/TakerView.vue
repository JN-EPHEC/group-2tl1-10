<template>
    <div class="taker-wrapper">
        <div class="main-container">
            <!-- Titres absurdes -->
             <h1 class="main-title">Hold up, wait a minute...</h1>
             <p class="subtitle">quiz may or may not start soon</p>

             <!-- SECTION 1 : REJOINDRE -->
              <div v-if="!hasJoined" class="join-section">
                <input
                    type="text"
                    v-model="roomCode"
                    class="room-code-input"
                    placeholder="room code"
                    maxlength="4"
                />
                <button class="join-btn" @click="handleJoinRoom">join</button>
              </div>

              <button v-if="!hasJoined" class="back-home-btn" @click="goToHome">
                👈 nvm, take me home
              </button>

              <!-- SECTION 2 : L'ATTENTE CHAOTIQUE -->
               <div v-else class="waiting-section">
                <!-- Le cadre intérieur "Players" -->
                 <div class="players-container">
                    <h2 class="players-title"><u>Players:</u></h2>

                    <div class="players-list">
                        <!-- * Utilisation de classes CSS différents pour pour l'instant reproduire la maquette, par la suite on affichera les joueurs ayant rejoint -->
                        <span class="player pos-1">-{{ authStore.user?.pseudo || 'Me (Guest)' }}</span> <!-- L'utilisateur actuel -->
                        <span class="player pos-2">-albert</span>
                        <span class="player pos-3">-barney</span>
                        <span class="player pos-4">-coney</span>
                        <span class="player pos-5">-dave</span>
                        <span class="player pos-6">-ethan</span>
                        <span class="palyer pos-7">-fatima</span>
                        <span class="player pos-8">-gerald</span>
                        <span class="player pos-9">-howard</span>
                    </div>
                 </div>

                 <p class="waiting-msg">Waiting for the maker to stop eating chips...</p>
                 <button class="leave-btn" @click="hasJoined = false">nvm, leave</button>
               </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const roomCode = ref('')
const hasJoined = ref(false) 

const handleJoinRoom = () => {
    if (roomCode.value.length < 4) {
        alert("Bruh, il faut 4 caractères pour le code.")
        return
    }
    console.log("Tentative de rejoindre la room:", roomCode.value)
    // TODO: Plus tard, on connectera Socket.io ici !
    hasJoined.value = true // Simulation temporaire d'une connexion réussie
}

const goToHome = () => {
    router.push('/')
}
</script>

<style scoped>
/* --- MISE EN PAGE GLOBALE --- */
.taker-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f0f0;
    font-family: sans-serif;
}

.main-container {
    border: 2px solid black;
    padding: 3rem;
    width: 900px;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* --- TITRES --- */
.main-title {
    font-size: 3.5rem;
    margin: 0 0 1rem 0;
    text-align: center;
}

.subtitle {
    font-size: 1.5rem;
    margin: 0 0 3rem 0;
    color: #555;
}

/* --- SECTION REJOINDRE (Input + Bouton) --- */
.join-section {
    display: flex;
    gap: 2rem;
    align-items: center;
    margin-bottom: 2rem;
}

.room-code-input {
    padding: 1rem;
    font-size: 1.5rem;
    border: 2px dashed black;
    text-align: center;
    width: 200px;
    text-transform: uppercase;
}

.join-btn {
    padding: 1rem 2.5rem;
    font-size: 1.5rem;
    border: 2px solid black;
    border-radius: 10px;
    background-color: white;
    cursor: pointer;
}

.join-btn:hover {
    background-color: #eee;
}

/* --- SECTION ATTENTE (Le chaos des joueurs) --- */
.waiting-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.players-container {
    border: 2px solid black;
    width: 90%;
    padding: 2rem;
    margin-bottom: 2rem;
}

.players-title {
    font-size: 2.5rem;
    text-align: center;
    margin: 0 0 2rem 0;
}

/* LA GRILLE CHAOTIQUE */
.players-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 colonnes de base */
    gap: 1.5rem;
    font-size: 1.8rem;
    position: relative;
}

.player {
    display: inline-block;
}

/* Utilisation de translate() pour décaler manuellement chaque nom et produire le design */
.pos-1 { transform: translate(10px, 5px); font-weight: bold; color: blue; } /* Utilisateur connecté */
.pos-2 { transform: translate(50px, -10px); } /* albert */
.pos-3 { transform: translate(-20px, 20px); } /* barney */
.pos-4 { transform: translate(30px, 40px); }  /* coney */
.pos-5 { transform: translate(0px, 0px); }    /* dave */
.pos-6 { transform: translate(-40px, -15px); }/* ethan */
.pos-7 { transform: translate(60px, 10px); }  /* fatima */
.pos-8 { transform: translate(20px, -30px); } /* gerald */
.pos-9 { transform: translate(15px, 10px); } /* howard */

.waiting-msg {
    font-style: italic;
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 1rem;
}

.leave-btn {
    padding: 0.5rem 1rem;
    background: none;
    border: 1px solid #999;
    cursor: pointer;
    color: #666;
}

.back-home-btn {
    background: none;
    border: none;
    text-decoration: underline;
    color: #666;
    font-size: 1rem;
    cursor: pointer;
    transition: color 0.2s;
    margin-top: 1rem;
}

.back-home-btn:hover {
    color: black;
}
</style>