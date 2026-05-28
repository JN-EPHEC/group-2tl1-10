<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 overflow-hidden">
    
    <h1 class="text-[8rem] md:text-[15rem] font-black leading-none mb-12 text-center animate-pulse">
      bruh
    </h1>
    
    <button 
      @click="goBack"
      class="px-8 py-4 text-2xl font-bold font-mono text-black bg-white border-4 border-white hover:bg-gray-300 shadow-[8px_8px_0px_rgba(255,255,255,0.4)] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all"
    >
      ok je repars
    </button>
    
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const bruhSound = new Audio('https://www.myinstants.com/media/sounds/movie_1.mp3')
  bruhSound.play().catch(e => console.log("Son bloqué", e))
})

const goBack = () => {
  console.log("Retour au login...")
  router.push('/login')
}
</script>