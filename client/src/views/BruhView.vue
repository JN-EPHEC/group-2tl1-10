<template>
    <div class="bruh-container">
        <h1 class="giant-text">bruh</h1>
        <button @click="goBack" class="back-btn">ok je repars</button>
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

// C'est cette fonction qui fait marcher le bouton !
const goBack = () => {
  console.log("Retour au login...")
  router.push('/login')
}
</script>

<style scoped>
.bruh-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #000;
    color: white;
}

.giant-text {
    font-size: 15rem; 
    font-weight: bold;
    margin: 0;
}

.back-btn {
    margin-top: 2rem;
    padding: 1rem 2rem;
    font-size: 1.5rem;
    cursor: pointer;
}
</style>