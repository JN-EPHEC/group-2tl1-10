<template>
    <div class="lobby-wrapper">
        <div class="main-container">
            <h1 class="main-title">Waiting for victims</h1>
            <h2 class="room-code">Room code: <span>{{ roomCode || '...' }}</span></h2>
            <div class="qr-placeholder">
                <qrcode-vue :value="joinUrl" :size="200" level="M" />
            </div>

            <div class="players-box">
                <h3>Players:</h3>
                <div class="players-grid">
                    <div v-for="(player, index) in players" :key="index" class="player-name">
                        - {{ player }}
                    </div>
                </div>
            </div>

            <div class="bottom-controls">
                <button class="exit-btn" @click="goBack">exit</button>
                <button class="begin-btn" :disabled="players.length === 0" @click="beginQuiz">
                    Begin quiz
                </button>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { socket } from '../services/socket';
import { computed } from 'vue';
import QrcodeVue from 'qrcode.vue'; 

const route = useRoute()
const router = useRouter()

const roomCode = ref('')
const players = ref<string[]>([])
const quizId = route.params.id

onMounted(() => {
    // On se connecte au Socket
    socket.connect()

    // On demande au serveur de créer la game
    socket.emit('create_game', quizId, (Response: any) => {
        roomCode.value = Response.roomCode
    })

    // On écoute l'arrivée des victimes (joueurs)
    socket.on('player_joined', (username: string) => {
        players.value.push(username)
    })
})

onUnmounted(() => {
    // On nettoie les écouteurs quand on quitte la page
    socket.off('player_joined')
})

const goBack = () => {
    router.push('/maker/list')
}

const beginQuiz = () => {
    socket.emit('start_game', roomCode.value)
}

const joinUrl = computed(() => {
    return `${window.location.origin}/?code=${roomCode.value}`;
})

// On écoute le signale de départ pour rediriger le créateur aussi
socket.on('game_started', () => {
    router.push(`/maker/game/${roomCode.value}`)
})
</script>

<style>
.lobby-wrapper { display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color: #f8f9fa; font-family: sans-serif; }
.main-container { border: 2px solid black; padding: 2rem 3rem; width: 800px; background-color: white; display: flex; flex-direction: column; align-items: center; position: relative; }

.main-title { font-size: 3rem; margin-bottom: 0.5rem; }
.room-code { font-size: 2rem; font-weight: normal; margin-bottom: 2rem; }
.room-code span { font-weight: bold; letter-spacing: 2px; }

.qr-placeholder { position: absolute; top: 2rem; right: 2rem; border: 2px solid black; padding: 1rem; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 0.8rem; }

.players-box { border: 2px solid black; width: 100%; min-height: 200px; padding: 1rem; margin-bottom: 2rem; }
.players-box h3 { text-align: center; text-decoration: underline; font-size: 1.5rem; margin-bottom: 1.5rem; }
.players-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center; font-size: 1.2rem; }

.bottom-controls { display: flex; justify-content: space-between; width: 100%; }
button { border: 2px solid black; border-radius: 8px; background-color: white; cursor: pointer; padding: 0.8rem 2rem; font-size: 1.2rem; transition: 0.2s; }
button:hover:not(:disabled) { background-color: #eee; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>