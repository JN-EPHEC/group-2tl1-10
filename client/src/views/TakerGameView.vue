<template>
  <div class="taker-game">
    <div v-if="screen === 'playing'" class="answers-layout">
      <div class="grid-2x2">
        <button v-for="(ans, i) in answers" :key="i" 
                class="answer-btn" @click="submitAnswer(ans)">
          {{ ans }}
        </button>
      </div>
      <button class="confused-btn" @click="sendConfused">I'm confused</button>
    </div>

    <div v-else-if="screen === 'waiting'" class="waiting-msg">
      <h2>Answer submitted!</h2>
      <p>Wait for the results...</p>
    </div>

    <div v-else-if="screen === 'results'" class="results-screen" :class="{ 'win': isCorrect, 'lose': !isCorrect }">
      <h1 v-if="isCorrect">Points?</h1>
      <h1 v-else>No points?</h1>
      
      <img v-if="isCorrect" src="https://i.imgflip.com/6c986v.jpg" alt="Megamind points" class="meme-img"/>
      <img v-else src="https://i.kym-cdn.com/entries/icons/original/000/039/393/cover2.jpg" alt="Megamind no points" class="meme-img"/>
    </div>
  </div>
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

onMounted(() => {
  socket.emit('get_current_question', roomCode, (data: any) => {
    answers.value = data.answers
    screen.value = 'playing'
  })

  // Ecoute de la révélation des résultats
  socket.on('results_revealed', (data: any) => {
    isCorrect.value = (myAnswer.value === data.correctAnswer)
    screen.value = 'results'
  })

  // Quand le créateur passe à la question d'après
  socket.on('next_question_ready', () => {
    socket.emit('get_current_question', roomCode, (data: any) => {
      answers.value = data.answers
      screen.value = 'playing'
      hasAnswered.value = false // On autorise le joueur à re-cliquer
      myAnswer.value = ''
    })
  })

  // Quand le jeu est totalement fini
  socket.on('game_over', () => {
    alert("Le quiz est terminé ! TU peux retourner à l'accueil.")
    router.push('/')
  })
})

const submitAnswer = (answerText: string) => {
  myAnswer.value = answerText
  screen.value = 'waiting'
  // On renvoie le code de la room ET la réponse !
  socket.emit('submit_answer', { roomCode, answer: answerText })
}

const sendConfused = () => {}
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