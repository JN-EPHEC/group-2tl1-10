<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
    
    <div class="w-full max-w-4xl bg-white border-4 border-black p-8 md:p-16 flex flex-col items-center shadow-[12px_12px_0px_rgba(0,0,0,1)]">
      
      <h1 class="text-4xl md:text-5xl font-black mb-12 text-center uppercase tracking-tight">
        All your quizes
      </h1>

      <div class="w-full max-w-2xl flex flex-col items-center gap-6 mb-12">
        
        <p v-if="quizzes.length === 0" class="w-full text-center text-xl font-mono font-bold bg-pink-300 border-4 border-black p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] transform -rotate-1">
          No quizzes found. Go create some chaos!
        </p>

        <div 
          v-for="quiz in quizzes" 
          :key="quiz.id" 
          class="w-full border-4 border-black p-4 flex flex-col md:flex-row justify-between items-center bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all"
        >
          <span class="text-2xl font-bold font-mono mb-4 md:mb-0 text-center md:text-left break-words w-full md:w-auto">
            {{ quiz.name }}
          </span>
          
          <div class="flex gap-4 w-full md:w-auto justify-center">
            <button 
              @click="playQuiz(quiz.id)"
              class="px-6 py-2 text-xl font-bold bg-green-400 border-4 border-black hover:bg-green-500 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
              play
            </button>
            <button 
              @click="editQuiz(quiz.id)"
              class="px-6 py-2 text-xl font-bold bg-yellow-300 border-4 border-black hover:bg-yellow-400 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
              edit
            </button>
            <button 
            @click="deleteQuiz(quiz.id)" 
            class="px-4 py-2 bg-red-500 text-white font-bold border-4 border-black hover:bg-red-600 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            title="Détruire ce quiz"
          >
            Delete
          </button>
          </div>
        </div>

        <div v-if="quizzes.length > 0" class="text-4xl font-black tracking-widest mt-4">...</div>
      </div>

      <button 
        @click="goBack"
        class="px-10 py-4 text-xl font-bold bg-white border-4 border-black hover:bg-gray-200 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[6px_6px_0px_rgba(0,0,0,1)]"
      >
        back
      </button>

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
    } else {
      console.error("Erreur serveur lors de la récupération des quiz.")
    }
  } catch (error) {
    console.error("Impossible de contacter le backend", error)
  }
})

const playQuiz = (quizId: number) => {
  router.push(`/maker/lobby/${quizId}`)
}

const editQuiz = (quizId: number) => {
  console.log("Direction l'éditeur pour le quiz n°", quizId)
  router.push(`/maker/edit/${quizId}`)
}

const deleteQuiz = async (quizId: number) => {
  if (confirm("Es-tu sûr de vouloir détruire ce quiz ? Cette action est irréversible.")) {
    try {
      const response = await fetch(`/api/categories/${quizId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.success) {
        // Rafraîchir la liste locale pour faire disparaître le quiz visuellement
        quizzes.value = quizzes.value.filter((q: any) => q.id !== quizId);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du quiz :", error);
    }
  }
};

const goBack = () => {
  router.push('/maker') // Retour à l'écran du créateur
}
</script>