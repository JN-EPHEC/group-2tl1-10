<template>
  <div class="list-wrapper">
    <!-- Le grand cadre habituel -->
    <div class="main-container">
      
      <h1 class="main-title">All your quizes</h1>

      <!-- La zone de la liste -->
      <div class="quizzes-container">
        <!-- Message si aucun quiz -->
        <p v-if="quizzes.length === 0" class="empty-msg">
          No quizzes found. Go create some chaos!
        </p>

        <!-- Boucle sur les quiz -->
        <div v-for="quiz in quizzes" :key="quiz.id" class="quiz-row">
          <span class="quiz-name">{{ quiz.name }}</span>
          <button class="edit-btn" @click="editQuiz(quiz.id)">edit</button>
        </div>

        <!-- Les petits points de la maquette -->
        <div v-if="quizzes.length > 0" class="dots">...</div>
      </div>

      <!-- Bouton de retour -->
      <button class="back-btn" @click="goBack">back</button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Variable qui va contenir nos quiz
const quizzes = ref<any[]>([])

// Dès que la page s'affiche, on interroge le backend
onMounted(async () => {
  try {
    const response = await fetch('/api/categories', {
      headers: {
        // C'est ICI qu'on prouve qui on est au backend grâce au token !
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      quizzes.value = data
      
      // Si la base de données est vide, on met des fausses données pour tester le design
      if (quizzes.value.length === 0) {
        loadMockData()
      }
    } else {
      console.warn("Le backend a renvoyé une erreur, chargement des fausses données.")
      loadMockData()
    }
  } catch (error) {
    console.error("Erreur de connexion au backend, chargement des fausses données.", error)
    loadMockData()
  }
})

// Fonction de secours pour afficher le design de la maquette quoiqu'il arrive
const loadMockData = () => {
  quizzes.value = [
    { id: 1, title: 'Quiz name 1' },
    { id: 2, title: 'Quiz name 2' },
    { id: 3, title: 'Quiz name 3' }
  ]
}

const editQuiz = (quizId: number) => {
  console.log("Direction l'éditeur pour le quiz n°", quizId)
  // TODO: On branchera ça vers la page d'édition plus tard !
  // router.push(`/maker/edit/${quizId}`)
}

const goBack = () => {
  router.push('/maker') // Retour à l'écran du créateur
}
</script>

<style scoped>
/* --- MISE EN PAGE GLOBALE --- */
.list-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  font-family: sans-serif;
}

.main-container {
  border: 2px solid black;
  padding: 3rem;
  width: 800px;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* --- TITRE --- */
.main-title {
  font-size: 3rem;
  margin: 0 0 3rem 0;
}

/* --- LISTE DES QUIZ --- */
.quizzes-container {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem; /* Espace entre chaque ligne */
  margin-bottom: 3rem;
}

.quiz-row {
  width: 100%;
  border: 2px solid black;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
}

.quiz-name {
  font-size: 1.5rem;
}

.edit-btn {
  padding: 0.5rem 1.5rem;
  font-size: 1.1rem;
  border: 2px solid black;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background-color: #eee;
}

.empty-msg {
  font-size: 1.2rem;
  color: #666;
  font-style: italic;
}

.dots {
  font-size: 1.5rem;
  letter-spacing: 0.2rem;
  margin-top: 1rem;
}

/* --- BOUTON RETOUR --- */
.back-btn {
  padding: 1rem 3rem;
  font-size: 1.5rem;
  border: 2px solid black;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background-color: #f0f0f0;
}
</style>