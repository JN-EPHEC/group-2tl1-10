<template>
    <div class="login-container">
        <h1 class="title">Do you know da waccount?</h1>

        <div class="form">
            <input type="email" v-model="email" placeholder="email" />
            <input type="password" v-model="password" placeholder="password" />

            <button @click="handleLogin">log in with email</button>
            <button @click="handleRegister">create new account</button>

            <button class="bruh-btn" @click="goToBruh">there is no other option</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth' 

// Variables pour stocker ce que l'utilisateur tape
const email = ref('')
const password = ref('')
const pseudo = ref('') // Nouveau champ pour l'inscription

// Le routeur permet de naviguer entre les pages
const router = useRouter()
const authStore = useAuthStore()

// --- CONNEXION ---
const handleLogin =  async () => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.value, password: password.value })
        })

        const data = await response.json()

        if (!response.ok) throw new Error(data.error)

        // Sauvegarde du token et de toutes les informations
        authStore.saveAuth(data.token, data.user)
        console.log("Connecté avec succès !", data)
        router.push('/')

    } catch(error: any) {
        alert("Erreur: " + error.message)
    }
}

// --- INSCRIPTION ---
const handleRegister = async () => {
    if (!pseudo.value) {
        alert("Met un pseudo pour t'inscrire, stp !")
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

        alert("Compté créé ! Tu peux maintenant de connecter.")

    } catch(error: any) {
        alert("Erreur: " + error.message)
    }
}

const goToBruh = () => {
    router.push('/bruh')
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

.bruh-btn {
    margin-top: 1rem;
    border: 2px dashed red;
}
</style>