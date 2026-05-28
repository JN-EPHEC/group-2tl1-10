<template>
  <div class="min-h-screen flex items-center justify-center font-sans">
    
    <div v-if="screen === 'playing'" class="w-full max-w-2xl flex flex-col p-4">
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full mb-8">
        <button 
          v-for="(ans, i) in answers" :key="ans + i" 
          @click="submitAnswer(ans)"
          @mouseenter="jumpButton"
          class="p-8 text-2xl md:text-3xl font-black bg-white border-4 border-black hover:bg-gray-100 shadow-[8px_8px_0px_rgba(0,0,0,1)] active:translate-y-2 active:translate-x-2 active:shadow-none transition-transform duration-200 break-words"
        >
          {{ ans }}
        </button>
      </div>

      <div class="flex flex-wrap justify-center gap-4 mt-4 border-t-4 border-black pt-8">
        <button 
          @click="sendConfused" 
          :disabled="hasConfused"
          class="px-6 py-3 font-bold font-mono border-4 border-dashed border-black transition-all
                 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
                 enabled:bg-purple-300 enabled:hover:bg-purple-400 enabled:shadow-[4px_4px_0px_rgba(0,0,0,1)] enabled:active:translate-y-1 enabled:active:translate-x-1 enabled:active:shadow-none"
        >
          {{ hasConfused ? "You are confused 😵‍💫" : "I'm confused" }}
        </button>

        <button 
          v-if="currentSettings?.secretButton" 
          @click="triggerSecret"
          class="px-6 py-3 font-bold bg-black text-white border-4 border-black hover:bg-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all animate-pulse"
        >
          DO NOT CLICK
        </button>

        <button 
          v-if="currentSettings?.rageQuit" 
          @click="triggerRageQuit"
          class="px-6 py-3 font-black text-white bg-red-600 border-4 border-black hover:bg-red-700 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
        >
          RAGE QUIT
        </button>
      </div>
    </div>

    <div v-else-if="screen === 'waiting'" class="w-full h-screen bg-yellow-300 flex flex-col items-center justify-center border-8 border-black p-4">
      <h2 class="text-4xl md:text-6xl font-black mb-6 text-center uppercase border-4 border-black bg-white px-8 py-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] transform -rotate-2">
        Answer submitted!
      </h2>
      <p class="text-2xl font-bold font-mono bg-black text-white px-6 py-2">
        Wait for the results...
      </p>
    </div>

    <div 
      v-else-if="screen === 'results'" 
      class="w-full h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500"
      :class="isCorrect ? 'bg-green-400' : 'bg-red-500'"
    >
      <h1 class="text-6xl md:text-8xl font-black text-white mb-8 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase">
        {{ isCorrect ? 'Points?' : 'No points?' }}
      </h1>
      
      <img 
        v-if="isCorrect" 
        src="../../public/pictures/Points.png" 
        alt="Megamind points" 
        class="w-full max-w-md border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] transform rotate-1"
      />
      <img 
        v-else 
        src="../../public/pictures/No_points.png" 
        alt="Megamind no points" 
        class="w-full max-w-md border-8 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] transform -rotate-1"
      />
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
const screen = ref('playing') 
const isCorrect = ref(false)
const myAnswer = ref('') 
const currentSettings = ref<any>({})
const hasConfused = ref(false)

// Fonction vitale pour transformer les paramètres "faux" du backend en vrais booléens
const parseSettings = (rawSettings: any) => {
  let parsed = rawSettings;
  if (typeof rawSettings === 'string') {
    try { parsed = JSON.parse(rawSettings); } catch(e) { parsed = {}; }
  }
  return {
    rageQuit: parsed?.rageQuit === true || parsed?.rageQuit === 'true',
    secretButton: parsed?.secretButton === true || parsed?.secretButton === 'true',
    jumpingButtons: parsed?.jumpingButtons === true || parsed?.jumpingButtons === 'true',
    enableSounds: parsed?.enableSounds !== false && parsed?.enableSounds !== 'false'
  }
}

onMounted(() => {
  socket.emit('get_current_question', roomCode, (data: any) => {
    answers.value = data.answers
    currentSettings.value = parseSettings(data.settings)
    screen.value = 'playing'
    hasConfused.value = false
  })

  socket.on('results_revealed', (data: any) => {
    // On sécurise la lecture de la bonne réponse (String OU Tableau)
    const correctAns = data.correctAnswers || data.correctAnswer || [];
    if (Array.isArray(correctAns)) {
      isCorrect.value = correctAns.includes(myAnswer.value);
    } else {
      isCorrect.value = (myAnswer.value === correctAns);
    }

    screen.value = 'results'
    if (isCorrect.value) {
      playSound('mlg-horns-sound-effect')
    } else {
      playSound('fahhhhhhhhhhhhhh')
    }
  })

  socket.on('next_question_ready', () => {
    socket.emit('get_current_question', roomCode, (data: any) => {
      answers.value = data.answers
      currentSettings.value = parseSettings(data.settings)
      screen.value = 'playing'
      hasAnswered.value = false 
      hasConfused.value = false
      myAnswer.value = ''
    })
  })

  socket.on('game_over', () => {
    alert("Le quiz est terminé ! Tu peux retourner à l'accueil.")
    router.push('/')
  })
})

const playSound = (soundName: string) => {
  if (!currentSettings.value?.enableSounds) return;
  const audio = new Audio(`/sounds/${soundName}.mp3`);
  audio.play().catch(error => {
    console.warn("Le navigateur a bloqué l'audio :", error);
  });
}

// La fameuse mécanique du bouton fuyant
const jumpButton = (e: Event) => {
  if (!currentSettings.value?.jumpingButtons) return;
  const target = e.target as HTMLElement;
  const randomX = Math.floor(Math.random() * 200) - 100; // Entre -100px et +100px
  const randomY = Math.floor(Math.random() * 200) - 100;
  target.style.transform = `translate(${randomX}px, ${randomY}px)`;
}

const submitAnswer = (answerText: string) => {
  myAnswer.value = answerText
  screen.value = 'waiting'
  socket.emit('submit_answer', { roomCode, answer: answerText })
  playSound('ive-got-this')
}

const sendConfused = () => {
  if (hasConfused.value) return;
  hasConfused.value = true;
  socket.emit('im_confused', roomCode);
}

const triggerSecret = () => {
  socket.emit('trigger_secret', roomCode);
}

const triggerRageQuit = () => {
  socket.emit('submit_answer', { roomCode, answer: 'RAGE_QUIT_ABANDON' });
  isCorrect.value = false;
  screen.value = 'results';
  playSound('chicken-on-tree-screaming')
}
</script>