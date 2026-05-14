<template>
    <div class="taker-wrapper">
        <div class="main-container" v-if="!isWaiting">
            <h1 class="main-title">Join a Game</h1>

            <div class="form-group">
                <input type="text" v-model="roomCode" class="dashed-input" placeholder="Room Code (ex: 1234)" />
                <input type="text" v-model="username" class="dashed-input" placeholder="Your Nickname" />
            </div>

            <button class="join-btn" @click="joinGame" :disabled="!roomCode || !username">Join</button>
            <button class="fraud-btn" @click="router.push('/')">Go back</button>
        </div>

        <div class="main-container" v-else>
            <h1 class="main-title">You're in!</h1>
            <p style="font-size: 1.5rem; text-align: center;">Look at the main screen.<br>Waiting for the host to start...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { socket } from '../services/socket'

const router = useRouter()
const roomCode = ref('')
const username = ref('')
const isWaiting = ref(false)

onMounted(() => {
    socket.connect()
})

const joinGame = () => {
    // Envoie du code et du pseudo au serveur
    socket.emit('join_game', { roomCode: roomCode.value, username: username.value }, (Response: any) => {
        if (Response.success) {
            isWaiting.value = true // Ca marche, passage en mode attente
        } else {
            alert(Response.Message) // Le code était faux
        }
    })
}
</script>

<style scoped>
.taker-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f8f9fa; }
.main-container { border: 2px solid black; padding: 3rem; width: 500px; background-color: white; display: flex; flex-direction: column; align-items: center; gap: 2rem; }
.form-group { display: flex; flex-direction: column; gap: 1rem; width: 100%; }
.dashed-input { border: 2px dashed black; padding: 1rem; font-size: 1.2rem; text-align: center; width: 100%; box-sizing: border-box; }
button { border: 2px solid black; border-radius: 8px; background-color: white; cursor: pointer; padding: 1rem 2rem; font-size: 1.2rem; width: 100%; }
button:hover:not(:disabled) { background-color: #eee; }
.fraud-btn { border: none; text-decoration: underline; padding: 0.5rem; }
</style>