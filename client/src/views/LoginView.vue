<template>
  <div class="login-container">
    <h1 class="title">Do you know da waccount?</h1>
    
    <div class="form">
      <!-- Ce champ n'apparaît QUE si on est en mode inscription (v-if="isRegisterMode") -->
      <input 
        v-if="isRegisterMode" 
        type="text" 
        v-model="pseudo" 
        placeholder="your pseudo" 
      />
      
      <input type="email" v-model="email" placeholder="email" />
      <input type="password" v-model="password" placeholder="password" />

      <!-- AFFICHAGE MODE CONNEXION -->
      <template v-if="!isRegisterMode">
        <button @click="handleLogin">log in with email</button>
        <button @click="isRegisterMode = true">create new account</button>
      </template>

      <!-- AFFICHAGE MODE INSCRIPTION -->
      <template v-else>
        <button class="confirm-btn" @click="handleRegister">Confirm and Create!</button>
        <button @click="isRegisterMode = false">Nevermind, go back to login</button>
      </template>
      
      <button class="bruh-btn" @click="goToBruh">there is no other option</button>
    </div>

    <!-- BOUTON DE RETOUR -->
     <button class="back-home-btn" @click="goToHome">👈 nvm, take me home</button>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const pseudo = ref('')

// L'interrupteur qui gère la sous-interface !
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
    isRegisterMode.value = false // On repasse en mode login !
    
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

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-family: sans-serif;
}

.title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 300px;
}

input, button {
  padding: 0.8rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  cursor: pointer;
  background-color: #f0f0f0;
  transition: 0.2s;
}

button:hover {
  background-color: #e0e0e0;
}

.confirm-btn {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.confirm-btn:hover {
  background-color: #c3e6cb;
}

.bruh-btn {
  margin-top: 1rem;
  border: 2px dashed red;
}

.back-home-btn {
    margin-top: 2rem;
    background: none;
    border: none;
    text-decoration: underline;
    color: #666;
    font-size: 1rem;
    cursor: pointer;
    transition: color 0.2s;
}

.back-home-btn:hover {
    color: black;
}
</style>