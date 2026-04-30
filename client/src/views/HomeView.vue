<template>
  <div class="home-wrapper">
    <div class="home-container">
      
      <!-- Titre aléatoire WTF -->
      <h1 class="main-title">{{ currentTitle }}</h1>

      <div class="roles-container">
        <!-- Côté Créateur -->
        <div class="role-column">
          <button class="big-btn">I'm a quiz maker</button>
        </div>

        <!-- Côté Joueur -->
        <div class="role-column">
          <button class="big-btn">I'm a quiz taker</button>
          <input 
            type="text" 
            v-model="displayName" 
            class="display-name-input" 
            placeholder="display name" 
          />
        </div>
      </div>

      <!-- Section du bas : Connexion ou Profil -->
      <div class="bottom-section">
        <!-- V-IF : Si l'utilisateur n'est PAS connecté -->
        <button v-if="!isLoggedIn" class="login-btn" @click="goToLogin">
          log in
        </button>

        <!-- V-ELSE : Si l'utilisateur EST connecté -->
        <div v-else class="logged-in-box">
          logged in as &lt;{{ currentUser }}&gt;
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- LE TITRE ALÉATOIRE (L'absurdité commence) ---
const absurdTitles = [
  "Super duper memeable quiz maker 9000",
  "Le Quiz qui va te faire rater ton semestre",
  "Avez-vous essayé de l'éteindre et de le rallumer ?",
  "Encore un projet codé à 3h du matin",
  "Error 404 : Brain not found"
]
const currentTitle = ref('')

onMounted(() => {
  // On choisit un titre au hasard au chargement de la page
  const randomIndex = Math.floor(Math.random() * absurdTitles.length)
  currentTitle.value = absurdTitles[randomIndex]
})


// --- VARIABLES D'ÉTAT ---
const displayName = ref('')

// TODO: Plus tard, on lira ça depuis notre Backend/Pinia !
// Pour tester l'affichage de l'encart, il faut passer isLoggedIn à true.
const isLoggedIn = ref(false) 
const currentUser = ref('LeBossDuQuiz')


// --- NAVIGATION ---
const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
/* Pour centrer la grosse boîte de la maquette au milieu de l'écran */
.home-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: sans-serif;
}

/* La grosse boîte */
.home-container {
  border: 2px solid black;
  padding: 4rem 2rem;
  width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
}

.main-title {
  font-size: 2.5rem;
  margin-bottom: 4rem;
  text-align: center;
}

.roles-container {
  display: flex;
  gap: 4rem;
  margin-bottom: 4rem;
}

.role-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.big-btn {
  padding: 1.5rem 2rem;
  font-size: 1.5rem;
  border: 1px solid black;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: transform 0.1s;
}

.big-btn:hover {
  background-color: #f0f0f0;
  transform: scale(1.05); /* Petit effet de zoom absurde */
}

.display-name-input {
  padding: 0.5rem;
  text-align: center;
  border: 1px dashed black;
  outline: none;
  font-size: 1rem;
}

.bottom-section {
  display: flex;
  justify-content: center;
  width: 100%;
}

.login-btn {
  padding: 1rem 3rem;
  font-size: 1.2rem;
  border: 1px solid black;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
}

.login-btn:hover {
  background-color: #e0e0e0;
}

.logged-in-box {
  padding: 1rem 2rem;
  border: 1px solid black;
  font-family: monospace; /* Pour le style <user> un peu hackerman */
  font-size: 1.2rem;
}
</style>