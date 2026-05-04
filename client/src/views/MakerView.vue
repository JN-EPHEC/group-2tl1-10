<template>
    <div class="maker-wrapper">
        <div class="main-container">
            <!-- Les titres -->
             <h1 class="main-title">You are the creator</h1>
             <p class="subtitle">Abuse your power</p>

             <!-- Les deux boutons d'action principaux -->
              <div class="action-buttons">
                <button class="action-btn" @click="goToNewQuiz">New quiz</button>
                <button class="action-btn" @click="goToMyQuizzes">My quizes</button>
              </div>

              <!-- Bouton de retour honteux -->
              <button class="fraud-btn" @click="goToHome">jk I'm a fraud</button>

        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()

// Pour l'instant, ces boutons ne font rien à part un log,
// on créera les interfaces correspondantes plus tard ! 
const goToNewQuiz = () => {
    console.log("Direction la création d'un nouveau quiz...")
    // router.push('/maker/new')
}

const goToMyQuizzes = () => {
    console.log("Direction la liste des quiz existants...")
    // router.push('/maker/list')
}

// Le bouton de retour vers l'accueil 
const goToHome = () => {
    router.push('/')
}
</script>

<style scoped>
/* --- MISE EN PAGE GLOBALE --- */
.maker-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
    font-family: sans-serif;
}

.main-container {
    border: 2px solid black;
    padding: 4rem 3rem;
    width: 800px;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}

/* --- TITRES --- */
.main-title {
    font-size: 3rem;
    margin: 0 0 0.5rem 0;
    text-align: center;
}

.subtitle {
    font-size: 1.8rem;
    margin: 0 0 4rem 0;
    text-align: center;
}

/* --- BOUTONS PRINCIPAUX --- */
.action-buttons {
    display: flex;
    gap: 3rem;
    margin-bottom: 5rem;
}

.action-btn {
    padding: 1.5rem 3rem;
    font-size: 1.5rem;
    border: 2px solid black;
    border-radius: 12px;
    background-color: white;
    cursor: pointer;
    transition: transform 0.1s, background-color 0.2s;
}

.action-btn:hover {
    background-color: #f0f0f0;
    transform: scale(1.05);
}

/* --- BOUTON DE RETOUR (FRAUD) --- */
.fraud-btn {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    border: 2px solid black;
    border-radius: 8px;
    background-color: white;
    cursor: pointer;
    transition: background-color 0.2s;
}

.fraud-btn:hover {
    background-color: #ffe6e6;
}
</style>