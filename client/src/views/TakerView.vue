<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
    
    <div class="w-full max-w-md bg-white border-4 border-black p-8 md:p-12 flex flex-col items-center shadow-[12px_12px_0px_rgba(0,0,0,1)] relative transition-all">

      <div v-if="!isWaiting" class="w-full flex flex-col items-center">
        
        <h1 class="text-4xl md:text-5xl font-black mb-10 text-center uppercase tracking-tight">
          Join a Game
        </h1>

        <div class="w-full flex flex-col gap-6 mb-8">
          <input 
            type="text" 
            v-model="roomCode" 
            class="w-full p-4 text-2xl font-black font-mono text-center uppercase border-4 border-dashed border-black outline-none bg-transparent focus:bg-yellow-200 transition-colors placeholder-gray-300" 
            placeholder="[ ROOM CODE ]" 
          />
          <input 
            type="text" 
            v-model="username" 
            class="w-full p-4 text-xl font-bold font-mono text-center border-4 border-dashed border-black outline-none bg-transparent focus:bg-cyan-200 transition-colors placeholder-gray-300" 
            placeholder="[ YOUR NICKNAME ]" 
          />
        </div>

        <button 
          @click="joinGame" 
          :disabled="!roomCode || !username"
          class="w-full py-4 text-2xl font-black uppercase border-4 border-black transition-all mb-6
                 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:translate-y-2 disabled:translate-x-2 disabled:cursor-not-allowed
                 enabled:bg-green-400 enabled:hover:bg-green-500 enabled:shadow-[8px_8px_0px_rgba(0,0,0,1)] enabled:active:translate-y-2 enabled:active:translate-x-2 enabled:active:shadow-none"
        >
          Join
        </button>
        
        <button 
          @click="router.push('/')"
          class="font-mono font-bold text-gray-500 hover:text-red-500 hover:underline transition-colors"
        >
          👈 nvm, go back
        </button>
      </div>

      <div v-else class="w-full flex flex-col items-center">
        
        <h1 class="text-5xl md:text-6xl font-black mb-10 text-center text-white bg-green-500 px-6 py-2 border-4 border-black transform -rotate-2 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
          You're in!
        </h1>
        
        <div class="border-4 border-black bg-gray-900 text-green-400 p-6 w-full text-center shadow-[6px_6px_0px_rgba(0,0,0,1)] mt-4">
          <p class="text-xl font-mono mb-6 border-b-2 border-green-800 pb-4">
            > Connection_Established
          </p>
          <p class="text-lg font-mono animate-pulse leading-relaxed">
            Look at the main screen.<br>Waiting for the host to start...
          </p>
          <button 
          @click="leaveLobby"
          class="px-6 py-3 font-bold bg-white border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-100 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
          >
          Quitter la salle
          </button>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { socket } from '../services/socket'

const router = useRouter()
const roomCode = ref('')
const username = ref('')
const isWaiting = ref(false)
const route = useRoute()

onMounted(() => {
    socket.connect()
    if (route.query.code) {
      roomCode.value = route.query.code as string
      console.log("Code récupéré automatiquement depuis le QR Code :", route.query.code)
    }
})

const joinGame = () => {
    // Envoi du code et du pseudo au serveur
    socket.emit('join_game', { roomCode: roomCode.value, username: username.value }, (Response: any) => {
        if (Response.success) {
            isWaiting.value = true // Ca marche, passage en mode attente
        } else {
            alert(Response.message) // Le code était faux
        }
    })
}

const leaveLobby = () => {
  // On prévient le serveur qu'on abandonne la salle
  socket.emit('leave_game', roomCode.value)
  // On redirige le joueur vers l'écran de saisie du code ou l'accueil 
  router.push('/taker')
}

socket.on('game_started', () => {
    router.push(`/taker/game/${roomCode.value}`)
})
</script>