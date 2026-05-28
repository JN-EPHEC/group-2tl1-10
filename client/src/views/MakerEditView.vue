<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
    <div class="w-full max-w-4xl bg-white border-4 border-black p-6 md:p-12 relative flex flex-col items-center shadow-[12px_12px_0px_rgba(0,0,0,1)]">

      <div v-if="currentScreen === 'quiz'" class="w-full flex flex-col items-center">
        
        <div class="w-full flex justify-start mb-8">
          <button 
            @click="goBack"
            class="px-4 py-2 font-bold bg-white border-4 border-black hover:bg-gray-200 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
          >
            👈 Back to Dashboard
          </button>
        </div>

        <input 
          type="text" 
          v-model="quizDraft.name" 
          class="w-full max-w-lg p-4 mb-10 text-2xl md:text-3xl font-black font-mono text-center border-4 border-dashed border-black outline-none bg-transparent focus:bg-yellow-200 transition-colors placeholder-gray-300" 
          placeholder="[ ENTER QUIZ NAME ]" 
        />

        <div class="w-full flex flex-col gap-4 mb-10">
          <div 
            v-for="(q, index) in quizDraft.questions" :key="q.id" 
            class="w-full border-4 border-black p-4 bg-white flex flex-col md:flex-row justify-between items-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all gap-4"
          >
            <div 
              class="flex-1 font-bold text-xl cursor-pointer hover:text-blue-600 hover:underline break-words w-full"
              @click="openQuestion(index)"
            >
              <span class="bg-black text-white px-2 py-1 mr-2 font-mono">Q{{ index + 1 }}</span> 
              {{ q.text || '...' }}
            </div>
            <button 
              @click="deleteQuestion(index)"
              class="px-4 py-2 font-bold text-white bg-red-500 border-4 border-black hover:bg-red-600 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            >
              delete
            </button>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-6 w-full justify-center">
          <button 
            @click="addQuestion"
            class="px-8 py-4 text-xl font-bold bg-cyan-300 border-4 border-black hover:bg-cyan-400 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
          >
            + Add Question
          </button>
          <button 
            @click="saveQuizToBackend"
            class="px-8 py-4 text-xl font-bold bg-green-400 border-4 border-black hover:bg-green-500 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
          >
            💾 Save Quiz
          </button>
        </div>
      </div>

      <div v-else-if="currentScreen === 'question' && activeQ !== null" class="w-full flex flex-col items-center">
        
        <div class="text-2xl font-black font-mono bg-black text-white px-6 py-2 mb-8 transform -rotate-1">
          QUESTION {{ activeQuestionIndex + 1 }}
        </div>
        
        <input 
          type="text" 
          v-model="activeQ.text" 
          class="w-full p-4 mb-8 text-xl font-bold font-mono border-4 border-black outline-none bg-pink-100 focus:bg-pink-200 transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] placeholder-gray-400" 
          placeholder="Type your question here..." 
        />

        <div class="w-full flex flex-col gap-4 mb-8">
          <div 
            v-for="(ans, aIndex) in activeQ.answers" :key="aIndex" 
            class="w-full flex flex-col md:flex-row items-center gap-4 border-4 border-black p-4 bg-white shadow-[4px_4px_0px_rgba(0,0,0,1)]"
          >
            <div 
              @click="ans.isCorrect = !ans.isCorrect"
              class="w-16 h-8 border-4 border-black relative cursor-pointer transition-colors shrink-0"
              :class="ans.isCorrect ? 'bg-green-400' : 'bg-red-400'"
            >
              <div 
                class="w-6 h-6 bg-white border-4 border-black absolute top-0 left-0 transition-transform"
                :class="ans.isCorrect ? 'translate-x-8' : 'translate-x-0'"
              ></div>
            </div>
            
            <input 
              type="text" 
              v-model="ans.text" 
              class="flex-1 w-full p-2 font-mono border-4 border-dashed border-gray-400 focus:border-black outline-none bg-transparent" 
              placeholder="answer text" 
            />
            
            <button 
              @click="deleteAnswer(aIndex)"
              class="px-3 py-2 font-bold text-white bg-red-500 border-4 border-black hover:bg-red-600 active:translate-y-1 active:translate-x-1 transition-transform"
            >
              X
            </button>
          </div>
        </div>

        <div class="w-full flex flex-col md:flex-row justify-between items-center gap-6 mt-4 pt-8 border-t-4 border-black">
          <button 
            @click="currentScreen = 'settings'"
            class="px-6 py-3 font-bold bg-purple-300 border-4 border-black hover:bg-purple-400 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all w-full md:w-auto"
          >
            ⚙️ Settings
          </button>
          
          <div class="flex gap-4 w-full md:w-auto justify-center">
            <button 
              @click="addAnswer"
              class="px-6 py-3 font-bold bg-cyan-300 border-4 border-black hover:bg-cyan-400 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            >
              + Answer
            </button>
            <button 
              @click="currentScreen = 'quiz'"
              class="px-6 py-3 font-bold bg-yellow-300 border-4 border-black hover:bg-yellow-400 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
            >
              Ok (Back)
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="currentScreen === 'settings' && activeQ !== null" class="w-full flex flex-col items-center">
        
        <div class="text-2xl font-black font-mono bg-purple-300 border-4 border-black px-6 py-2 mb-6">
          SETTINGS Q{{ activeQuestionIndex + 1 }}
        </div>
        
        <div class="w-full text-center text-lg font-bold font-mono border-4 border-dashed border-black p-4 mb-8 bg-gray-50">
          "{{ activeQ.text || '...' }}"
        </div>

        <div class="w-full max-w-lg border-4 border-black p-6 bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col gap-6 mb-12">
          
          <div class="flex justify-between items-center">
            <span class="font-bold text-lg font-mono">Absurd Sound 🔊</span>
            <div 
              @click="activeQ.settings.enableSounds = !activeQ.settings.enableSounds"
              class="w-16 h-8 border-4 border-black relative cursor-pointer transition-colors shrink-0"
              :class="activeQ.settings.enableSounds ? 'bg-green-400' : 'bg-red-400'"
            >
              <div class="w-6 h-6 bg-white border-4 border-black absolute top-0 left-0 transition-transform" :class="activeQ.settings.enableSounds ? 'translate-x-8' : 'translate-x-0'"></div>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <span class="font-bold text-lg font-mono">Jumping Buttons</span>
            <div 
              @click="activeQ.settings.jumpingButtons = !activeQ.settings.jumpingButtons"
              class="w-16 h-8 border-4 border-black relative cursor-pointer transition-colors shrink-0"
              :class="activeQ.settings.jumpingButtons ? 'bg-green-400' : 'bg-red-400'"
            >
              <div class="w-6 h-6 bg-white border-4 border-black absolute top-0 left-0 transition-transform" :class="activeQ.settings.jumpingButtons ? 'translate-x-8' : 'translate-x-0'"></div>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <span class="font-bold text-lg font-mono">Enable Rage Quit</span>
            <div 
              @click="activeQ.settings.rageQuit = !activeQ.settings.rageQuit"
              class="w-16 h-8 border-4 border-black relative cursor-pointer transition-colors shrink-0"
              :class="activeQ.settings.rageQuit ? 'bg-green-400' : 'bg-red-400'"
            >
              <div class="w-6 h-6 bg-white border-4 border-black absolute top-0 left-0 transition-transform" :class="activeQ.settings.rageQuit ? 'translate-x-8' : 'translate-x-0'"></div>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <span class="font-bold text-lg font-mono">Enable Secret Button</span>
            <div 
              @click="activeQ.settings.secretButton = !activeQ.settings.secretButton"
              class="w-16 h-8 border-4 border-black relative cursor-pointer transition-colors shrink-0"
              :class="activeQ.settings.secretButton ? 'bg-green-400' : 'bg-red-400'"
            >
              <div class="w-6 h-6 bg-white border-4 border-black absolute top-0 left-0 transition-transform" :class="activeQ.settings.secretButton ? 'translate-x-8' : 'translate-x-0'"></div>
            </div>
          </div>

          <div class="border-t-4 border-black my-2"></div>

          <div class="flex justify-between items-center">
            <span class="font-bold text-lg font-mono">Score Multiplier</span>
            <input 
              type="number" 
              v-model="activeQ.settings.scoreMultiplier" 
              class="w-20 p-2 font-mono border-4 border-black outline-none text-center bg-yellow-100 focus:bg-yellow-200" 
            />
          </div>

          <div class="flex justify-between items-center">
            <span class="font-bold text-lg font-mono">Time Limit (s)</span>
            <input 
              type="number" 
              v-model="activeQ.timeLimit" 
              class="w-20 p-2 font-mono border-4 border-black outline-none text-center bg-cyan-100 focus:bg-cyan-200" 
            />
          </div>

        </div>

        <button 
          @click="currentScreen = 'question'"
          class="px-10 py-4 text-xl font-bold bg-yellow-300 border-4 border-black hover:bg-yellow-400 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
        >
          Save Settings (Back)
        </button>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const hasUnsavedChanges = ref(true)

const quizDraft = ref ({
  id: null as number | null,
  name: '',
  questions: [] as any[]
})

onMounted(async () => {
  const quizId = route.params.id

  if (quizId) {
    try {
      const response = await fetch(`/api/categories/${quizId}`, {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })

      if (response.ok) {
        const data = await response.json()

        quizDraft.value.id = data.id
        quizDraft.value.name = data.name

        if (data.questions) {
          quizDraft.value.questions = data.questions.map((q: any) => {
            // Gérer les réponses correctes (peuvent être une string, un JSON string, ou un array)
            let correctAnswers: string[] = [];
            if (Array.isArray(q.correctAnswers)) {
              correctAnswers = q.correctAnswers;
            } else if (typeof q.correctAnswer === 'string' && q.correctAnswer) {
              try {
                const parsed = JSON.parse(q.correctAnswer);
                correctAnswers = Array.isArray(parsed) ? parsed : [parsed];
              } catch {
                correctAnswers = [q.correctAnswer];
              }
            }

            return {
              id: q.id,
              text: q.title,
              timeLimit: q.difficulty,
              answers: q.possibleAnswers.map((ansText: string) => ({
                text: ansText,
                isCorrect: correctAnswers.includes(ansText)
              })),
              settings: q.settings || {
                enableSounds: false,
                jumpingButtons: false,
                rageQuit: false,
                secretButton: false,
                scoreMultiplier: 1
              }
            }
          })
        }
        hasUnsavedChanges.value = false
      }
    } catch(error) {
      console.error("Erreur de chargement du quiz", error)
    }
  }
})

const goBack = () => {
  router.push('/maker')
}

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm("Hold up! Tu as des modifications non sauvegardés. Veux-tu vraiment abandonner ?")
    if (!answer) {
      return false;
    }
  }
})

const currentScreen = ref<'quiz' | 'question' | 'settings'>('quiz')
const activeQuestionIndex = ref<number>(0)

const activeQ = computed(() => quizDraft.value.questions[activeQuestionIndex.value])

const addQuestion = () => {
  quizDraft.value.questions.push({
    id: Date.now(),
    text: '',
    timeLimit: 10,
    answers: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    settings: {
      enableSounds: false,
      jumpingButtons: false,
      rageQuit: false,
      secretButton: false,
      scoreMultiplier: 1
    }
  })
}

const deleteQuestion = (index: number) => {
  quizDraft.value.questions.splice(index, 1)
}

const openQuestion = (index: number) => {
  activeQuestionIndex.value = index
  currentScreen.value = 'question'
}

const addAnswer = () => {
  activeQ.value.answers.push({ text: '', isCorrect: false })
}

const deleteAnswer = (index: number) => {
  activeQ.value.answers.splice(index, 1)
}

const saveQuizToBackend = async () => {
  if (quizDraft.value.name === '' || quizDraft.value.questions.length === 0) {
    alert("Bruh... Tu ne peux pas sauvegarder un quiz sans nom et sans questions !")
    return;
  }

  const isEditing = quizDraft.value.id !== null;
  const url = isEditing
    ? `/api/categories/${quizDraft.value.id}`
    : `/api/categories`;
  const method = isEditing ? 'PUT' : 'POST'

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(quizDraft.value)
    })

    if (response.ok) {
      alert(isEditing ? "Quiz mis à jour !" : "Quiz créé !");
      hasUnsavedChanges.value = false;
      router.push('/maker/list');
    } else {
      const errorData = await response.json()
      alert("Erreur : " + errorData.error);
    }
  } catch (error) {
    console.error("Erreur lors de la sauvegarde :", error);
  }
};
</script>