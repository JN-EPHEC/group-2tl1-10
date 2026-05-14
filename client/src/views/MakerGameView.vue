<template>
  <div class="game-wrapper">
    <div class="main-container">
      <div class="header">
        <span>question: {{ currentQ.index + 1 }}/{{ currentQ.total }}</span>
        <span class="confused-box">confused players: {{ confusedCount }}</span>
      </div>

      <h1 class="question-title">{{ currentQ.text }}</h1>

      <div class="answers-grid">
        <div v-for="(ans, i) in currentQ.answers" :key="i" class="answer-box">
          {{ ans }}
        </div>
      </div>

      <div class="footer">
        <button class="exit-btn" @click="exitGame">exit</button>
        <button class="show-btn" @click="showAnswer">Show answer</button>
        <div class="timer">Timer: {{ timer }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { socket } from '../services/socket'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentQ = ref<any>({ text: '', answers: [], index: 0, total: 0 })
const timer = ref(15)
const confusedCount = ref(0)
const roomCode = route.params.roomCode as string

onMounted(() => {
  // Dès que la page s'affiche, on réclame la question
  socket.emit('get_current_question', roomCode, (data: any) => {
    currentQ.value = data
    startTimer()
  })
})

const startTimer = () => {
  const interval = setInterval(() => {
    if (timer.value > 0) timer.value--
    else clearInterval(interval)
  }, 1000)
}

const showAnswer = () => {
  // TODO: Émettre l'événement pour stopper le temps et montrer la réponse
}
</script>

<style scoped>
.answers-grid { display: grid; grid-template-columns: 1fr; gap: 10px; width: 100%; margin: 20px 0; }
.answer-box { border: 2px solid black; padding: 15px; text-align: center; font-size: 1.5rem; }
.timer { font-weight: bold; font-size: 1.2rem; border: 1px solid black; padding: 5px 15px; }
</style>