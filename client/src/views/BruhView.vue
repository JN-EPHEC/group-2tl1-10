<template>
    <div class="bruh-container">
        <h1 class="giant-text">bruh</h1>
        <button @click="goBack" class="back-btn">ok je repars</button>
    </div>
</template>

<script lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// onMounted s'exécute dès que la page apparaît à l'écran
onMounted(() => {
    // On récupère un son "bruh" classique depuis internet (à télécharger plus tard)
    const bruhSound = new Audio('https://www.myinstants.com/media/sounds/movie_1.mp3')

    // * REMARQUE : Certains navigateurs peuvent ne pas jouer le son par défaut 
    bruhSound.play().catch(error => console.log("Le navigateur a bloqué le son autoplay :(", error))
})

const goBack = () => {
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