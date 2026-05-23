<template>
  <div class="taker-game">
    <div v-if="screen === 'playing'" class="answers-layout">
      <div class="grid-2x2">
        <button v-for="(ans, i) in answers" :key="i" 
                class="answer-btn" @click="submitAnswer(ans)">
          {{ ans }}
        </button>
      </div>
      <div class="chaos-buttons">
        <button class="confused-btn" @click="sendConfused" :disabled="hasConfused">
          {{ hasConfused ? "You are confused 😵‍💫" : "I'm confused" }}
        </button>

        <button v-if="currentSettings?.secretButton" class="secret-btn" @click="triggerSecret">
          DO NOT CLICK
        </button>

        <button v-if="currentSettings?.rageQuit" class="rage-btn" @click="triggerRageQuit">
          RAGE QUIT
        </button>
      </div>
    </div>

    <div v-else-if="screen === 'waiting'" class="waiting-msg">
      <h2>Answer submitted!</h2>
      <p>Wait for the results...</p>
    </div>

    <div v-else-if="screen === 'results'" class="results-screen" :class="{ 'win': isCorrect, 'lose': !isCorrect }">
      <h1 v-if="isCorrect">Points?</h1>
      <h1 v-else>No points?</h1>
      
      <img v-if="isCorrect" src="../../public/pictures/Points.png" alt="Megamind points" class="meme-img"/>
      <img v-else src="../../public/pictures/No_points.png" alt="Megamind no points" class="meme-img"/>
    </div>
  </div>np
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { socket } from '../services/socket'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const hasAnswered = ref(false)
const roomCode = route.params.roomCode as string
const answers = ref([])
const screen = ref('playing') // 'playing', 'waiting', 'results'
const isCorrect = ref(false)
const myAnswer = ref('') 
const currentSettings = ref<any>({})
const hasConfused = ref(false)

onMounted(() => {
  socket.emit('get_current_question', roomCode, (data: any) => {
    answers.value = data.answers
    currentSettings.value = data.settings || {} // On sauvergarde les réglages 
    screen.value = 'playing'
    hasConfused.value = false
  })

  // Ecoute de la révélation des résultats
  socket.on('results_revealed', (data: any) => {
    if (data.correctAnswers.length === 0) {
      // Si aucune bonne réponse, on gagne si on est resté sage sans cliquer
      isCorrect.value = (myAnswer.value === '')
    } else {
      isCorrect.value = data.correctAnswers.includes(myAnswer.value)
    }
    screen.value = 'results'
    if (isCorrect.value) {
      playSound('mlg-horns-sound-effect')
    } else {
      playSound('fahhhhhhhhhhhhhh')
    }
  })

  // Quand le créateur passe à la question d'après
  socket.on('next_question_ready', () => {
    socket.emit('get_current_question', roomCode, (data: any) => {
      answers.value = data.answers
      currentSettings.value = data.settings || {}
      screen.value = 'playing'
      hasAnswered.value = false // On autorise le joueur à re-cliquer
      hasConfused.value = false
      myAnswer.value = ''
    })
  })

  // Quand le jeu est totalement fini
  socket.on('game_over', () => {
    alert("Le quiz est terminé ! TU peux retourner à l'accueil.")
    router.push('/')
  })
})

// Fonction audio 
const playSound = (soundName: string) => {
  // Vérification de si le créateur à désactivé les sons (on l'autorise par défaut)
  if (currentSettings.value?.enableSounds === false) return;

  // On lance le son
  const audio = new Audio(`/sounds/${soundName}.mp3`);
  audio.play().catch(error => {
    console.warn("Le navigateur à bloqué l'audio :", error);
  });
}

const submitAnswer = (answerText: string) => {
  myAnswer.value = answerText
  screen.value = 'waiting'
  // On renvoie le code de la room ET la réponse !
  socket.emit('submit_answer', { roomCode, answer: answerText })
  playSound('ive-got-this')
}

// Fonction Confused
const sendConfused = () => {
  if (hasConfused.value) return;
  hasConfused.value = true;
  socket.emit('im_confused', roomCode);
}

// Secret Button
const triggerSecret = () => {
  socket.emit('trigger_secret', roomCode);
}

// Le Rage Quit (Insta-loose)
const triggerRageQuit = () => {
  // On soumet une réponse fausse au serveur
  socket.emit('submit_answer', { roomCode, answer: 'RAGE_QUIT_ABANDON' });
  // On affiche directement le Megamind "No points?" au joueur
  isCorrect.value = false;
  screen.value = 'results';
  playSound('chicken-on-tree-screaming')
}
</script>

<style scoped>
.results-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: white; }
.win { background-color: #4CAF50; } 
.lose { background-color: #f44336; }
.meme-img { max-width: 80%; max-height: 50vh; margin-top: 20px; border: 5px solid black; }
.grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; height: 60vh; }
.answer-btn { border: 2px solid black; font-size: 1.5rem; cursor: pointer; background: white; }
.confused-btn { margin-top: 20px; padding: 10px; border: 1px dashed black; }
</style>