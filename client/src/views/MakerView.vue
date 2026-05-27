<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 font-sans p-4">
    
    <div class="w-full max-w-3xl bg-white border-4 border-black p-10 md:p-16 flex flex-col items-center shadow-[12px_12px_0px_rgba(0,0,0,1)]">
      
      <h1 class="text-4xl md:text-5xl font-black mb-2 text-center uppercase tracking-tight">
        You are the creator
      </h1>
      <p class="text-xl md:text-2xl font-mono font-bold mb-16 text-center bg-black text-white px-4 py-1 inline-block transform -rotate-2">
        Abuse your power
      </p>

      <div class="flex flex-col md:flex-row gap-6 md:gap-12 w-full justify-center mb-16">
        
        <button 
          @click="goToNewQuiz"
          class="w-full md:w-auto px-8 py-6 text-2xl font-bold bg-fuchsia-300 border-4 border-black hover:bg-fuchsia-400 transition-transform active:translate-y-2 active:translate-x-2 active:shadow-none shadow-[6px_6px_0px_rgba(0,0,0,1)]"
        >
          New quiz
        </button>
        
        <button 
          @click="goToMyQuizzes"
          class="w-full md:w-auto px-8 py-6 text-2xl font-bold bg-lime-300 border-4 border-black hover:bg-lime-400 transition-transform active:translate-y-2 active:translate-x-2 active:shadow-none shadow-[6px_6px_0px_rgba(0,0,0,1)]"
        >
          My quizes
        </button>
      </div>

      <button 
        @click="goToHome"
        class="px-6 py-3 text-lg font-bold font-mono text-black bg-white border-4 border-dashed border-black hover:bg-red-400 hover:border-solid transition-all active:translate-y-1 active:translate-x-1 active:shadow-none shadow-[4px_4px_0px_rgba(0,0,0,1)]"
      >
        jk I'm a fraud
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter()

const goToNewQuiz = () => {
    console.log("Direction la création d'un nouveau quiz...")
    router.push('/maker/edit')
}

const goToMyQuizzes = () => {
    router.push('/maker/list')
}

const goToHome = () => {
    router.push('/')
}
</script>