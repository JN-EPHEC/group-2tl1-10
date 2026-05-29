<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
    
    <div class="w-full max-w-4xl bg-white border-4 border-black p-6 md:p-12 relative flex flex-col items-center shadow-[12px_12px_0px_rgba(0,0,0,1)]">

      <div 
        v-if="roomCode"
        class="md:absolute top-8 right-8 w-32 h-32 aspect-square border-4 border-black bg-white flex items-center justify-center p-2 transform md:rotate-3 mb-6 md:mb-0 shadow-[4px_4px_0px_rgba(0,0,0,1)] z-10"
      >
        <QrcodeVue :value="joinUrl" :size="110" level="H" />
      </div>

      <h1 class="text-4xl md:text-6xl font-black mb-6 text-center uppercase tracking-tight">
        Waiting for victims
      </h1>

      <div class="mb-12 flex flex-col items-center">
        <h2 class="text-xl md:text-2xl font-bold mb-2 font-mono uppercase">Room code:</h2>
        <div class="text-5xl md:text-7xl font-black font-mono bg-yellow-300 border-4 border-black px-8 py-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] transform -rotate-1">
          {{ roomCode || '...' }}
        </div>
      </div>

      <div class="w-full border-4 border-black bg-gray-900 text-green-400 p-6 mb-12 shadow-[8px_8px_0px_rgba(0,0,0,1)] min-h-[250px]">
        
        <h3 class="text-center font-mono text-xl mb-6 border-b-4 border-green-800 pb-4 uppercase tracking-widest">
          > Connected_Entities : [ {{ players.length }} ]
        </h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-lg md:text-xl">
          <div v-for="(player, index) in players" :key="index" class="flex items-center gap-2 truncate">
            <span class="text-pink-500 animate-pulse">></span> {{ player }}
          </div>
          
          <div v-if="players.length === 0" class="col-span-full text-center text-green-700 animate-pulse mt-8">
            _ waiting for incoming connections...
          </div>
        </div>
      </div>

      <div class="flex flex-col-reverse md:flex-row justify-between w-full gap-6">
        
        <button 
          @click="goBack"
          class="px-8 py-4 text-xl font-bold bg-white border-4 border-black hover:bg-gray-200 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[6px_6px_0px_rgba(0,0,0,1)]"
        >
          abort / exit
        </button>
        
        <button 
          :disabled="players.length === 0" 
          @click="beginQuiz"
          class="px-10 py-4 text-2xl font-black uppercase border-4 border-black transition-all 
                 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:translate-y-2 disabled:translate-x-2 disabled:cursor-not-allowed
                 enabled:bg-cyan-300 enabled:hover:bg-cyan-400 enabled:shadow-[8px_8px_0px_rgba(0,0,0,1)] enabled:active:translate-y-2 enabled:active:translate-x-2 enabled:active:shadow-none"
        >
          Begin quiz
        </button>
        
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { socket } from '../services/socket';
import QrcodeVue from 'qrcode.vue'; 

const route = useRoute()
const router = useRouter()

const roomCode = ref('')
const players = ref<string[]>([])
const quizId = route.params.id

// Variable calculée dynamiquement avec des ACCENTS GRAVES (backticks) ``
const joinUrl = computed(() => {
  if (!roomCode.value) return '' // Pas de code, pas d'url
  // window.location.origin récupère automatiquement http://localhost:5173 ou le domaine VPS
  // Adapte bien la route '/taker' si ce n'est pas la bonne !
  return `${window.location.origin}/taker?code=${roomCode.value}`
})

onMounted(() => {
    socket.connect()

    socket.emit('create_game', quizId, (Response: any) => {
        // Dès qu'on reçoit le code (ex: 2544), roomCode est mis à jour
        // Ce qui met à jour 'joinUrl', et le QR Code se dessine instantanément
        roomCode.value = Response.roomCode
    })

    socket.on('player_joined', (username: string) => {
        players.value.push(username)
    })
})

onUnmounted(() => {
    socket.off('player_joined')
})

const goBack = () => {
    router.push('/maker/list')
}

const beginQuiz = () => {
    socket.emit('start_game', roomCode.value)
}

socket.on('game_started', () => {
    router.push(`/maker/game/${roomCode.value}`)
})
</script>