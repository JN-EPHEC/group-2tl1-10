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

// Variables pour stocker ce que l'utilisateur tape
const email = ref('')
const password = ref('')

// Le routeur permet de naviguer entre les pages
const router = useRouter()

const handleLogin = () => {
    console.log("Tentative de login avec :", email.value, password.value)
    // TODO: Appeler notre Backend ici plus tard !
    router.push('/') // Redirige vers la page d'accueil
}

const handleRegister = () => {
    console.log ("Tentative de création de compte avec :", email.value, password.value)
    // TODO: Appeler notre Backend ici plus tard !
    router.push('/')
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