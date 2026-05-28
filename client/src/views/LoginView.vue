<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 font-sans p-4">
    
    <div class="w-full max-w-md bg-white border-4 border-black p-8 md:p-10 flex flex-col items-center shadow-[12px_12px_0px_rgba(0,0,0,1)] relative">
      
      <h1 class="text-3xl md:text-4xl font-black mb-8 text-center uppercase tracking-tight">
        Do you know da waccount?
      </h1>
      
      <div class="flex flex-col gap-4 w-full mb-8">
        <input 
          v-if="isRegisterMode" 
          type="text" 
          v-model="pseudo" 
          placeholder="[ your pseudo ]" 
          class="w-full p-4 font-mono text-lg border-4 border-black outline-none focus:bg-cyan-100 transition-colors placeholder-gray-400"
        />
        
        <input 
          type="email" 
          v-model="email" 
          placeholder="[ email ]" 
          class="w-full p-4 font-mono text-lg border-4 border-black outline-none focus:bg-pink-100 transition-colors placeholder-gray-400"
        />
        <input 
          type="password" 
          v-model="password" 
          placeholder="[ password ]" 
          class="w-full p-4 font-mono text-lg border-4 border-black outline-none focus:bg-yellow-100 transition-colors placeholder-gray-400"
        />

        <template v-if="!isRegisterMode">
          <button 
            @click="handleLogin"
            class="w-full py-4 text-xl font-bold bg-green-400 border-4 border-black hover:bg-green-500 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all mt-4"
          >
            log in with email
          </button>
          <button 
            @click="isRegisterMode = true"
            class="w-full py-3 text-lg font-bold bg-white border-4 border-dashed border-black hover:bg-gray-200 transition-colors"
          >
            create new account
          </button>
        </template>

        <template v-else>
          <button 
            @click="handleRegister"
            class="w-full py-4 text-xl font-bold bg-cyan-300 border-4 border-black hover:bg-cyan-400 shadow-[6px_6px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all mt-4"
          >
            Confirm and Create!
          </button>
          <button 
            @click="isRegisterMode = false"
            class="w-full py-3 text-lg font-bold bg-white border-4 border-dashed border-black hover:bg-gray-200 transition-colors"
          >
            Nevermind, go back to login
          </button>
        </template>
        
        <button 
          @click="goToBruh"
          class="w-full py-3 mt-4 text-lg font-bold font-mono text-red-600 bg-white border-4 border-dashed border-red-600 hover:bg-red-600 hover:text-white transition-colors"
        >
          ! there is no other option !
        </button>
      </div>

      <button 
        @click="goToHome"
        class="font-mono font-bold text-gray-500 hover:text-black hover:underline transition-colors mt-2"
      >
        👈 nvm, take me home
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const pseudo = ref('')

const isRegisterMode = ref(false) 

const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Le serveur est mort (502). Allume ton backend !");
    }

    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    
    authStore.saveAuth(data.token, data.user)
    router.push('/') 
    
  } catch (error: any) {
    alert("Bruh... " + error.message)
  }
}

const handleRegister = async () => {
  if (!pseudo.value || !email.value || !password.value) {
    alert("Remplis tous les champs, on n'est pas des devins !")
    return
  }

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value, pseudo: pseudo.value })
    })
    
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    
    alert("Compte créé avec succès ! Connecte-toi maintenant.")
    isRegisterMode.value = false 
    
  } catch (error: any) {
    alert("Bruh... " + error.message)
  }
}

const goToBruh = () => {
  router.push('/bruh')
}

const goToHome = () => {
    router.push('/')
}
</script>