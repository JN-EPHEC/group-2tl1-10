<template>
  <div class="min-h-screen bg-gray-100 font-sans flex items-center justify-center p-4">
    
    <div class="w-full max-w-5xl bg-white border-4 border-black p-6 md:p-10 shadow-[12px_12px_0px_rgba(0,0,0,1)] relative overflow-hidden">
      
      <div v-if="isRickrolling" class="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
        <img src="https://media.tenor.com/x8v1oNUOmg4AAAAd/rickroll-roll.gif" alt="Rickroll" class="w-full max-w-2xl border-8 border-white mb-8" />
        <h1 class="text-5xl md:text-7xl font-black text-white text-center animate-pulse">NEVER GONNA GIVE YOU UP!</h1>
      </div>
      
      <div v-if="screen === 'playing' || screen === 'results'" class="flex flex-col w-full">
        
        <div class="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
          <span class="text-xl font-bold font-mono bg-black text-white px-4 py-2">
            Q: {{ currentQ.index + 1 }}/{{ currentQ.total }}
          </span>
          <span class="text-lg font-bold font-mono border-4 border-dashed border-black px-4 py-2 bg-pink-200">
            Confused: {{ confusedCount }} 😵‍💫
          </span>
        </div>

        <h1 class="text-4xl md:text-5xl font-black text-center mb-10 leading-tight">
          {{ currentQ.text }}
        </h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div 
            v-for="(ans, i) in currentQ.answers" :key="i" 
            class="border-4 border-black p-6 text-2xl font-bold text-center shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-colors"
            :class="(screen === 'results' && isAnswerCorrect(ans)) ? 'bg-green-400 text-black border-8' : 'bg-white'"
          >
            {{ ans }}
          </div>
        </div>

        <div class="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t-4 border-black">
          <button 
            @click="exitGame"
            class="px-6 py-3 font-bold font-mono bg-white border-4 border-black hover:bg-red-400 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
          >
            Abort / Exit
          </button>
          
          <button 
            v-if="screen === 'playing'" 
            @click="showAnswer"
            class="px-8 py-4 text-xl font-black bg-cyan-300 border-4 border-black hover:bg-cyan-400 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
          >
            Show Answer
          </button>
          
          <button 
            v-else-if="screen === 'results'" 
            @click="showLeaderboard"
            class="px-8 py-4 text-xl font-black bg-yellow-300 border-4 border-black hover:bg-yellow-400 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
          >
            Continue
          </button>

          <div v-if="screen === 'playing'" class="text-3xl font-black font-mono bg-yellow-300 border-4 border-black px-6 py-2 transform rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            ⏱️ {{ timer }}
          </div>
        </div>
      </div>

      <div v-else-if="screen === 'leaderboard'" class="flex flex-col w-full items-center">
        <h1 class="text-5xl font-black uppercase mb-12 text-center tracking-widest">
          Leaderboard
        </h1>

        <div class="w-full flex flex-col items-center gap-12">
          
          <div class="flex justify-center items-end gap-4 md:gap-8 border-b-8 border-black w-full pb-0 px-4">
            
            <div v-if="leaderboard[1]" class="flex flex-col items-center w-24 md:w-32">
              <div class="text-lg font-bold truncate mb-2">{{ leaderboard[1].username }}</div>
              <div class="w-full h-24 bg-gray-300 border-4 border-black border-b-0 flex flex-col items-center justify-center">
                <span class="font-black text-2xl">2</span>
              </div>
              <div class="font-mono font-bold mt-2">{{ leaderboard[1].score }} pts</div>
            </div>
            
            <div v-if="leaderboard[0]" class="flex flex-col items-center w-28 md:w-40 z-10">
              <div class="text-xl font-black truncate mb-2 text-yellow-600">{{ leaderboard[0].username }}</div>
              <div class="w-full h-32 bg-yellow-400 border-4 border-black border-b-0 flex flex-col items-center justify-center shadow-[-8px_0px_0px_rgba(0,0,0,0.1)]">
                <span class="font-black text-4xl">1</span>
              </div>
              <div class="font-mono font-bold mt-2">{{ leaderboard[0].score }} pts</div>
            </div>

            <div v-if="leaderboard[2]" class="flex flex-col items-center w-24 md:w-32">
              <div class="text-lg font-bold truncate mb-2">{{ leaderboard[2].username }}</div>
              <div class="w-full h-16 bg-orange-400 border-4 border-black border-b-0 flex flex-col items-center justify-center">
                <span class="font-black text-xl">3</span>
              </div>
              <div class="font-mono font-bold mt-2">{{ leaderboard[2].score }} pts</div>
            </div>

          </div>

          <div v-if="leaderboard.length > 3" class="w-full max-w-lg border-4 border-black bg-white p-4 max-h-48 overflow-y-auto shadow-[inset_0px_0px_10px_rgba(0,0,0,0.1)]">
            <div 
              v-for="(player, index) in leaderboard.slice(3)" :key="index" 
              class="flex justify-between items-center py-3 border-b-2 border-dashed border-gray-300 last:border-0 font-mono text-lg"
            >
              <span class="font-bold text-gray-500 w-12">{{ index + 4 }}.</span>
              <span class="font-bold flex-1">{{ player.username }}</span>
              <span class="font-black">{{ player.score }} pts</span>
            </div>
          </div>
        </div>

        <div class="flex w-full justify-between mt-12 pt-6 border-t-4 border-black">
          <button 
            @click="exitGame"
            class="px-6 py-3 font-bold font-mono bg-white border-4 border-black hover:bg-red-400 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
          >
            Exit Game
          </button>
          <button 
            @click="nextQuestion"
            class="px-8 py-4 text-xl font-black bg-green-400 border-4 border-black hover:bg-green-500 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
          >
            Next Question ➡️
          </button>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { socket } from '../services/socket'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const currentQ = ref<any>({ text: '', answers: [], index: 0, total: 0 })
const timer = ref(15)
const confusedCount = ref(0)
const roomCode = route.params.roomCode as string
const screen = ref('playing') 
const correctAnswersList = ref<string[]>([]) 
const leaderboard = ref<any[]>([])
const isRickrolling = ref(false)
const backgroundMusic = new Audio('/sounds/ambiance-absurde.mp3') // TODO: Mettre une vrai musique
backgroundMusic.loop = true
backgroundMusic.volume = 0.3

let timerInterval: any = null;

const playSound = (soundName: string) => {
  const audio = new Audio(`/sounds/${soundName}.mp3`);
  audio.play().catch(error => {
    console.warn("Le navigateur a bloqué l'audio :", error);
  });
}

// Vérification corrigée : si aucune réponse n'est définie, RIEN ne s'allume en vert !
const isAnswerCorrect = (ans: string) => {
  if (correctAnswersList.value.length === 0) return false;
  return correctAnswersList.value.includes(ans);
}

onMounted(() => {
  socket.emit('get_current_question', roomCode, (data: any) => {
    currentQ.value = data
    timer.value = data.timeLimit || 15
    startTimer()
  })

  // === NOUVEL ÉCOUTEUR === 
  // Coupe le chrono automatiquement quand le backend prévient que tout le monde a voté
  socket.on('all_players_answered', () => {
    showAnswer();
  })

  socket.on('results_revealed', (data: any) => {
    let correct = data.correctAnswers || data.correctAnswer;
    if (correct === undefined || correct === null) correct = [];
    if (!Array.isArray(correct)) correct = [correct];
    
    correctAnswersList.value = correct;
    leaderboard.value = data.leaderboard
    screen.value = 'results' 
  })

  socket.on('next_question_ready', () => {
    socket.emit('get_current_question', roomCode, (data: any) => {
      currentQ.value = data
      screen.value = 'playing'
      timer.value = data.timeLimit || 15
      confusedCount.value = 0
      startTimer()
    })
  })

  socket.on('update_confused', (count: number) => {
    confusedCount.value = count;
    if (count >= 0) {
      playSound('ia-ia-ahh-yeye-yeye-lovely-sad')
    }
  })

  socket.on('activate_rickroll', () => {
    isRickrolling.value = true;
    setTimeout(() => { isRickrolling.value = false; }, 5000);
    playSound('rickroll-good')
  })

  socket.on("all_players_answered", () => {
    showAnswer();
  })

  socket.on('game_over', () => {
    backgroundMusic.pause()
    alert("C'est la fin du Quiz ! Admirez le classement final.")
  })
})

onUnmounted(() => {
  clearInterval(timerInterval)
  socket.off('all_players_answered')
  socket.off('results_revealed')
  socket.off('next_question_ready')
  socket.off('update_confused')
  socket.off('activate_rickroll')
  socket.off('game_over')
})

const startTimer = () => {
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
  clearInterval(timerInterval) 
  socket.emit('reveal_answer', roomCode)
}

const showLeaderboard = () => {
  screen.value = 'leaderboard'
}

const exitGame = () => {
  if (window.confirm("Veux-tu vraiment rage_quit ? Tes joueurs vont rester coincés dans le vide !")) {
    router.push('/maker/list')
  }
}

const nextQuestion = () => {
  socket.emit('next_question', roomCode)
}
</script>