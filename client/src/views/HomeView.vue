<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
    
    <div class="w-full max-w-4xl bg-white border-4 border-black p-10 md:p-16 flex flex-col items-center shadow-[12px_12px_0px_rgba(0,0,0,1)]">
      
      <h1 class="text-4xl md:text-5xl font-black mb-16 text-center uppercase tracking-tight font-mono">
        {{ currentTitle }}
      </h1>

      <div class="flex flex-col md:flex-row gap-8 md:gap-16 mb-16 w-full justify-center">
        
        <div class="flex flex-col items-center gap-4 w-full md:w-1/2">
          <button 
            @click="router.push('/maker')"
            class="w-full py-6 text-2xl font-bold bg-yellow-300 border-4 border-black hover:bg-yellow-400 transition-transform active:translate-y-2 active:translate-x-2 active:shadow-none shadow-[6px_6px_0px_rgba(0,0,0,1)]"
          >
            I'm a quiz maker
          </button>
        </div>

        <div class="flex flex-col items-center gap-4 w-full md:w-1/2">
          <button 
            @click="router.push('/taker')"
            class="w-full py-6 text-2xl font-bold bg-cyan-300 border-4 border-black hover:bg-cyan-400 transition-transform active:translate-y-2 active:translate-x-2 active:shadow-none shadow-[6px_6px_0px_rgba(0,0,0,1)]"
          >
            I'm a quiz taker
          </button>
          
          <input 
            type="text" 
            v-model="displayName" 
            class="w-full p-3 text-center border-4 border-dashed border-black outline-none text-xl font-mono bg-transparent focus:bg-pink-100 transition-colors placeholder-gray-400" 
            placeholder="[ enter display name ]" 
          />
        </div>
      </div>

      <div class="flex justify-center w-full mt-4">
        
        <button 
          v-if="!authStore.isLoggedIn" 
          @click="goToLogin"
          class="px-12 py-4 text-xl font-bold bg-white border-4 border-black hover:bg-gray-200 transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)]"
        >
          LOG IN
        </button>

        <div v-else class="flex flex-col items-center gap-4">
          <div class="px-8 py-4 border-4 border-black font-mono text-xl bg-green-300 font-bold shadow-[6px_6px_0px_rgba(0,0,0,1)]">
            logged in as &lt;{{ authStore.user?.pseudo }}&gt;
          </div>
          <button 
            @click="handleLogout"
            class="px-6 py-2 text-sm font-bold font-mono text-red-600 bg-white border-4 border-dashed border-red-600 hover:bg-red-600 hover:text-white transition-colors"
          >
            ! get me outta here !
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { socket } from '../services/socket'

const router = useRouter()
const authStore = useAuthStore()

// --- LE TITRE ALÉATOIRE (L'absurdité commence) ---
const absurdTitles = [
  "Super duper memeable quiz maker 9000",
  "Le Quiz qui va te faire rater tes partiels de Réseaux III",
  "Avez-vous essayé de l'éteindre et de le rallumer ?",
  "Encore un projet codé à 3h du matin",
  "Error 404 : Brain not found"
]
const currentTitle = ref('')

onMounted(() => {
  // Connection au serveur
  socket.connect();

  // On écoute la réponse du serveur (Garder ça pour tes tests si besoin, sinon à virer)
  socket.on("pong", (message) => {
    console.log("Réponse du serveur :", message);
    alert("Socket.io fonctionne !")
  });
  
  // On choisit un titre au hasard au chargement de la page
  const randomIndex = Math.floor(Math.random() * absurdTitles.length)
  currentTitle.value = absurdTitles[randomIndex]
})

// Fonctions audio 
const playSound = (soundName: string) => {
  const audio = new Audio(`/sounds/${soundName}.mp3`);
  audio.play().catch(error => {
    console.warn("Le navigateur a bloqué l'audio :", error);
  });
}

// --- VARIABLES D'ÉTAT ---
const displayName = ref('')

// --- NAVIGATION & ACTIONS ---
const goToLogin = () => {
  router.push('/login')
}

// Déconnecter l'utilisateur
const handleLogout = () => {
  authStore.logout()
  playSound('tuco-get-out')
}
</script>