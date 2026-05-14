<template>
  <div class="taker-game">
    <div v-if="!hasAnswered" class="answers-layout">
      <div class="grid-2x2">
        <button v-for="(ans, i) in answers" :key="i" 
                class="answer-btn" @click="submitAnswer(ans)">
          Answer {{ i + 1 }}
        </button>
      </div>
      <button class="confused-btn" @click="sendConfused">I'm confused</button>
    </div>
    <div v-else class="waiting-msg">
      <h2>Answer submitted!</h2>
      <p>Wait for the results...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { socket } from '../services/socket'

const answers = ref([])
const hasAnswered = ref(false)

onMounted(() => {
  socket.on('game_started', (data) => {
    answers.value = data.answers
    hasAnswered.value = false
  })
})

const submitAnswer = (answerText: string) => {
  hasAnswered.value = true
  socket.emit('submit_answer', answerText)
}
</script>

<style scoped>
.grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; height: 60vh; }
.answer-btn { border: 2px solid black; font-size: 1.5rem; cursor: pointer; background: white; }
.confused-btn { margin-top: 20px; padding: 10px; border: 1px dashed black; }
</style>