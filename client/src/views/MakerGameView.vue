<template>
  <div class="game-wrapper">
    <div class="main-container">
      <div v-if="isRickrolling" class="rickroll-overlay">
        <img src="https://media.tenor.com/x8v1oNUOmg4AAAAd/rickroll-roll.gif" alt="Rickroll" />
        <h1 style="color: white; font-size: 4rem;">NEVER GONNA GIVE YOU UP!</h1>
      </div>
      
      <div v-if="screen === 'playing'" class="screen-layout">
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

      <div v-else-if="screen === 'results'" class="screen-layout">
        <div class="header">
          <span>question: {{ currentQ.index + 1 }}/{{ currentQ.total }}</span>
        </div>

        <h1 class="question-title">{{ currentQ.text }}</h1>

        <div class="answers-grid">
          <div v-for="(ans, i) in currentQ.answers" :key="i" 
               class="answer-box" 
               :class="{ 'correct-answer': ans === correctAnswer }">
            {{ ans }}
          </div>
        </div>

        <div class="footer">
          <button class="exit-btn" @click="exitGame">exit</button>
          <button class="show-btn" @click="showLeaderboard">Continue</button>
        </div>
      </div>

      <div v-else-if="screen === 'leaderboard'" class="screen-layout">
        <h1 class="leaderboard-title">Leaderboard</h1>

        <div class="leaderboard-box">
          <div class="podium-container">
            <div v-if="leaderboard[1]" class="podium-step second">
              <div class="username">{{ leaderboard[1].username }}</div>
              <div class="step-box">2nd place</div>
              <div class="score">{{ leaderboard[1].score }} pts</div>
            </div>
            
            <div v-if="leaderboard[0]" class="podium-step first">
              <div class="username">{{ leaderboard[0].username }}</div>
              <div class="step-box">1st place</div>
              <div class="score">{{ leaderboard[0].score }} pts</div>
            </div>

            <div v-if="leaderboard[2]" class="podium-step third">
              <div class="username">{{ leaderboard[2].username }}</div>
              <div class="step-box">3rd place</div>
              <div class="score">{{ leaderboard[2].score }} pts</div>
            </div>
          </div>

          <div class="rest-of-players">
            <div v-for="(player, index) in leaderboard.slice(3)" :key="index" class="player-row">
              <span class="rank">{{ index + 4 }}th place</span>
              <span class="name">{{ player.username }}</span>
              <span class="points">{{ player.score }} pts</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <button class="exit-btn" @click="exitGame">exit</button>
          <button class="show-btn" @click="nextQuestion">next question</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { socket } from '../services/socket'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const currentQ = ref<any>({ text: '', answers: [], index: 0, total: 0 })
const timer = ref(15)
const confusedCount = ref(0)
const roomCode = route.params.roomCode as string
const screen = ref('playing') // 'playing', 'results', 'leaderboard'
const correctAnswer = ref('')
const leaderboard = ref<any[]>([])
const isRickrolling = ref(false)

let timerInterval: any = null;

onMounted(() => {
  // Dès que la page s'affiche, on réclame la question
  socket.emit('get_current_question', roomCode, (data: any) => {
    currentQ.value = data
    startTimer()
  })

  // Révélations des résultats
  socket.on('results_revealed', (data: any) => {
    correctAnswer.value = data.correctAnswer
    leaderboard.value = data.leaderboard
    screen.value = 'results' // Affichage de la bonne réponse
  })

  // Quand le serveur dit que la question suivante est prête
  socket.on('next_question_ready', () => {
    // On réclame la nouvelle question
    socket.emit('get_current_question', roomCode, (data: any) => {
      currentQ.value = data
      screen.value = 'playing'
      timer.value = 15
      confusedCount.value = 0
      startTimer()
    })
  })

  // Mise à jour du compteur de confusion
  socket.on('update_confused', (count: number) => {
    confusedCount.value = count;
    // * Plus tard : if (count > 3) palyDangerSound() 
  })

  // Activation du Rickroll
  socket.on('activate_rickroll', () => {
    isRickrolling.value = true;
    // ON cache le rickroll après 5 secondes
    setTimeout(() => { isRickrolling.value = false; }, 5000);
  })

  socket.on('game_over', () => {
    alert("C'est la fin du Quiz ! Admirez le classement final.")
    // On laisse le créateur sur l'écran 'leaderboard' pour qu'il voie le podium 
  })
})

const startTimer = () => {
  // Retrait de l'ancien chrono
  clearInterval(timerInterval)

  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      clearInterval(timerInterval)
      showAnswer()
    }
  }, 1000)
}

const showAnswer = () => {
  clearInterval(timerInterval) // On coupe le chrono
  socket.emit('reveal_answer', roomCode)
}

const showLeaderboard = () => {
  screen.value = 'leaderboard'
}

const exitGame = () => {
  if (window.confirm("Veux-tu vraiment rage_quit ? Tes joueurs vont rester coincés dans le vide !")) {
    router.push('/maker/list')
    // * On pourra ajouter un socket.emit('end_game') ici pour expulser les joueurs
  }
}

const nextQuestion = () => {
  // On donne l'ordre au serveur de passer à la suite
  socket.emit('next_question', roomCode)
}

</script>

<style scoped>
.answers-grid { display: grid; grid-template-columns: 1fr; gap: 10px; width: 100%; margin: 20px 0; }
.answer-box { border: 2px solid black; padding: 15px; text-align: center; font-size: 1.5rem; }
.timer { font-weight: bold; font-size: 1.2rem; border: 1px solid black; padding: 5px 15px; }
.correct-answer {
  background-color: #4CAF50 !important;
  color: white;
  border-color: #388E3C !important;
  font-weight: bold;
}

/* Style pour le Podium */
.leaderboard-title {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 2rem;
}
.leaderboard-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.podium-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 2rem;
}
.podium-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150px;
}
.step-box {
  border: 2px solid black;
  width: 100%;
  text-align: center;
  padding: 10px 0;
  background: #f0f0f0;
}
.first .step-box { height: 120px; display: flex; align-items: center; justify-content: center; background: #ffd700; font-weight: bold; }
.second .step-box { height: 90px; display: flex; align-items: center; justify-content: center; background: #c0c0c0; }
.third .step-box { height: 60px; display: flex; align-items: center; justify-content: center; background: #cd7f32; }

.username { font-weight: bold; margin-bottom: 5px; font-size: 1.2rem; }
.score { margin-top: 5px; font-size: 0.9rem; color: #555; }

/* Style pour le reste des joueurs */
.rest-of-players {
  border: 2px solid black;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}
.player-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed #ccc;
}
.player-row:last-child { border-bottom: none; }
.rickroll-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ça passe par dessus TOUT */
}
.rickroll-overlay img {
  width: 80%;
  max-width: 600px;
}
</style>