<template>
  <div class="edit-wrapper">
    <div class="main-container">

      <!-- ÉCRAN 1 : L'ÉDITEUR DU QUIZ -->
      <div v-if="currentScreen === 'quiz'" class="screen-quiz">

        <!-- Bouton de retour -->
        <button class="fraud-btn" @click="goBack" style="margin-bottom: 2rem;">
          👈 Back to Maker Dashboard
        </button>

        <input type="text" v-model="quizDraft.name" class="dashed-input title-input" placeholder="Quiz name" />

        <div class="questions-list">
          <div v-for="(q, index) in quizDraft.questions" :key="q.id" class="item-row">
            <!-- On clique sur le texte pour éditer la question -->
            <div class="clickable-text" @click="openQuestion(index)">
              Question {{ index + 1 }} : {{ q.text || '...' }}
            </div>
            <button class="delete-btn" @click="deleteQuestion(index)">delete</button>
          </div>
        </div>

        <button class="action-btn" @click="addQuestion">add question</button>
        <button class="save-btn" @click="saveQuizToBackend">Save Quiz</button>
      </div>

      <!-- ÉCRAN 2 : L'ÉDITEUR DE QUESTION -->
      <div v-else-if="currentScreen === 'question' && activeQ !== null" class="screen-question">
        <div class="header-box">Question {{ activeQuestionIndex + 1 }}</div>
        
        <input type="text" v-model="activeQ.text" class="dashed-input w-full" placeholder="Question text" />

        <div class="answers-list">
          <div v-for="(ans, aIndex) in activeQ.answers" :key="aIndex" class="answer-row">
            <!-- Toggle Switch Maison (Vert = vrai, Rouge = faux) -->
            <div 
              class="toggle-switch" 
              :class="{ 'is-correct': ans.isCorrect }"
              @click="ans.isCorrect = !ans.isCorrect"
            >
              <div class="toggle-knob"></div>
            </div>
            
            <input type="text" v-model="ans.text" class="dashed-input flex-1" placeholder="answer text" />
            <button class="delete-btn" @click="deleteAnswer(aIndex)">delete</button>
          </div>
        </div>

        <div class="bottom-controls">
          <input type="number" v-model="activeQ.timeLimit" class="dashed-input time-input" placeholder="time limit" />
          <div class="center-buttons">
            <button class="action-btn" @click="addAnswer">add answer</button>
            <button class="save-btn" @click="currentScreen = 'quiz'">Save (back)</button>
          </div>
          <button class="settings-btn" @click="currentScreen = 'settings'">settings</button>
        </div>
      </div>

      <!-- ÉCRAN 3 : LES PARAMÈTRES WTF -->
      <div v-else-if="currentScreen === 'settings' && activeQ !== null" class="screen-settings">
        <div class="header-box">Question {{ activeQuestionIndex + 1 }}</div>
        <div class="question-display">{{ activeQ.text || '...' }}</div>

        <div class="settings-box">
          <!-- Toggles WTF -->
          <div class="setting-row">
            <div class="toggle-switch"
                 :class="{ 'is-correct': activeQ.settings.enableSounds !== false }"
                 @click="activeQ.settings.enableSounds = activeQ.settings.enableSounds === false ? true : false">
              <div class="toggle-knob"></div>
            </div>
            <span>enable absurd sound 🔊</span>
          </div>
          
          <div class="setting-row">
            <div class="toggle-switch" :class="{ 'is-correct': activeQ.settings.rageQuit }" @click="activeQ.settings.rageQuit = !activeQ.settings.rageQuit">
              <div class="toggle-knob"></div>
            </div>
            <span>enable rage quit</span>
          </div>

          <div class="setting-row">
            <div class="toggle-switch" :class="{ 'is-correct': activeQ.settings.secretButton }" @click="activeQ.settings.secretButton = !activeQ.settings.secretButton">
              <div class="toggle-knob"></div>
            </div>
            <span>enable secret button</span>
          </div>

          <!-- Multiplicateur et Sons -->
          <div class="setting-row">
            <input type="number" v-model="activeQ.settings.scoreMultiplier" class="dashed-input tiny-input" />
            <span>score multiplier</span>
          </div>

          <div class="setting-row">
            <input type="number"
                   v-model.number="activeQ.settings.timeLimit"
                   class="dashed-input tiny-input"
                   placeholder="15" />
            <span>time limit (seconds)</span>
          </div>

          <div class="setting-row" v-for="sound in ['win', 'firstWin', 'lose', 'firstLose']" :key="sound">
            <input type="text" v-model="activeQ.settings[`${sound}Sound`]" class="dashed-input small-input" placeholder="sound.mp3" />
            <span>{{ sound }} sound</span>
          </div>
        </div>

        <button class="save-btn" @click="currentScreen = 'question'">Save (back)</button>
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
  id: null as number | null, // Ajout de l'ID au brouillon pour savoir si c'est une édition
  name: '',
  questions: [] as any[]
})

// Chargment des formulaires avec les données du quiz en édition 
onMounted(async () => {
  const quizId = route.params.id

  if (quizId) {
    try {
      const response = await fetch(`/api/categories/${quizId}`, {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })

      if (response.ok) {
        const data = await response.json()

        // On rempli le nom et l'ID
        quizDraft.value.id = data.id
        quizDraft.value.name = data.name

        // On traduit les questions du Backend vers le Frontend
        if (data.questions) {
          quizDraft.value.questions = data.questions.map((q: any) => {
            return {
              id: q.id,
              text: q.title,
              timeLimit: q.difficulty, // En attendant d'avoir un vrai timeLimit en base

              // On reconstruit le tableau de réponse : 
              answers: q.possibleAnswers.map((ansText: string) => ({
                text: ansText,
                isCorrect: ansText === q.correctAnswer // C'est la bonne si le texte correspond
              })),

              // On récupère les paramètres ou on met des valeurs par défaut 
              settings: q.settings || {
                rageQuit: false, secretBouton: false, scoreMultiplier: 1,
                winSound: '', firstWinSound: '', loseSound: '', firstLoseSound: ''
              }
            }
          })
        }

        // Comme on vient de charger les données, il n'y a pas encore de modifs non sauvegardées !
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

// --- GESTION DE L'AFFICHAGE ---
// Permet de naviguer entre les 3 interfaces sans changer d'URL
const currentScreen = ref<'quiz' | 'question' | 'settings'>('quiz')
const activeQuestionIndex = ref<number>(0)

// Raccourci pour accéder facilement à la question en cours d'édition
const activeQ = computed(() => quizDraft.value.questions[activeQuestionIndex.value])

// --- ACTIONS QUIZ ---
const addQuestion = () => {
  quizDraft.value.questions.push({
    id: Date.now(), // ID temporaire
    text: '',
    timeLimit: 10,
    answers: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ],
    settings: {
      rageQuit: false,
      secretButton: false,
      scoreMultiplier: 1,
      winSound: 'default_win.mp3',
      firstWinSound: 'default_win.mp3',
      loseSound: 'default_lose.mp3',
      firstLoseSound: 'default_lose.mp3'
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

// --- ACTIONS QUESTION ---
const addAnswer = () => {
  activeQ.value.answers.push({ text: '', isCorrect: false })
}

const deleteAnswer = (index: number) => {
  activeQ.value.answers.splice(index, 1)
}

// --- SAUVEGARDE FINALE ---
const saveQuizToBackend = async () => {
  // Petite vérification de sécurité absurde
  if (quizDraft.value.name === '' || quizDraft.value.questions.length === 0) {
    alert("Bruh... Tu ne peux pas sauvegarder un quiz sans nom et sans questions !")
    return;
  }

  // On détermine si c'est une édition ou une création
  const isEditing = quizDraft.value.id !== null;
  const url = isEditing
    ? `/api/categories/${quizDraft.value.id}`
    : `/api/categories`;
  const method = isEditing ? 'PUT' : 'POST'

  try {
    const response = await fetch(url, { // A Remplacer par la bonne route de création du backend
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}` // On prouve qu'on est le créateur !
      },
      body: JSON.stringify(quizDraft.value) // On envoie notre gros objet JSON
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

<style scoped>
/* MISE EN PAGE GLOBALE */
.edit-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f8f9fa; font-family: sans-serif; }
.main-container { border: 2px solid black; padding: 2rem; width: 800px; background-color: white; display: flex; flex-direction: column; align-items: center; }

/* INPUTS POINTILLÉS */
.dashed-input { border: 2px dashed black; padding: 0.8rem; font-size: 1.2rem; text-align: center; outline: none; }
.title-input { width: 400px; margin-bottom: 2rem; }
.w-full { width: 100%; box-sizing: border-box; margin-bottom: 2rem; }
.time-input { width: 120px; }
.tiny-input { width: 60px; padding: 0.2rem; }
.small-input { width: 150px; padding: 0.2rem; }

/* LISTES ET LIGNES */
.questions-list, .answers-list { width: 100%; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.item-row, .answer-row { display: flex; border: 2px solid black; border-radius: 8px; padding: 0.5rem 1rem; align-items: center; gap: 1rem; }
.clickable-text { flex: 1; cursor: pointer; font-size: 1.2rem; }
.clickable-text:hover { text-decoration: underline; }
.flex-1 { flex: 1; }

/* BOUTONS */
button { border: 2px solid black; border-radius: 8px; background-color: white; cursor: pointer; transition: 0.2s; }
button:hover { background-color: #eee; }
.delete-btn { padding: 0.5rem; border-radius: 4px; }
.action-btn, .save-btn, .settings-btn { padding: 0.8rem 2rem; font-size: 1.2rem; }
.action-btn { margin-bottom: 1rem; }
.save-btn { border-radius: 4px; }

/* CONTROLES DU BAS (Écran Question) */
.bottom-controls { display: flex; width: 100%; justify-content: space-between; align-items: flex-end; }
.center-buttons { display: flex; flex-direction: column; gap: 1rem; align-items: center; }

/* DESIGN DES TOGGLE SWITCH (Faux/Vrai) */
.toggle-switch { width: 50px; height: 26px; border: 2px solid black; border-radius: 13px; background-color: #ff4d4d; position: relative; cursor: pointer; transition: background-color 0.3s; }
.toggle-knob { width: 20px; height: 20px; background-color: white; border: 2px solid black; border-radius: 50%; position: absolute; top: 1px; left: 1px; transition: transform 0.3s; }
.toggle-switch.is-correct { background-color: #4CAF50; }
.toggle-switch.is-correct .toggle-knob { transform: translateX(24px); }

/* ÉCRAN SETTINGS */
.header-box { border: 2px solid black; padding: 0.5rem 2rem; font-size: 1.2rem; margin-bottom: 1rem; }
.question-display { border: 2px solid black; padding: 0.5rem 2rem; width: 100%; text-align: center; margin-bottom: 2rem; }
.settings-box { border: 2px solid black; padding: 2rem; width: 80%; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.setting-row { display: flex; align-items: center; gap: 1rem; font-size: 1.2rem; }
</style>