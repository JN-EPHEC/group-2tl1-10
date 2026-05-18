<template>
  <router-view /> 
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore()

// Dès que l'application Vue se lance, on tente de récupérer le profil
onMounted(() => {
  authStore.fetchUser()
})
</script>

<style>
/* Reset de base pour enlever les marges par défaut du navigateur */
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>