import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '')
    const user = ref<{ id: number; pseudo: string; email: string } | null>(null)

    // Si on a un token, on dit qu'on est connecté
    const isLoggedIn = ref(!!token.value)

    const saveAuth = (newToken: string, userData: any) => {
        token.value = newToken
        user.value = userData
        isLoggedIn.value = true
        localStorage.setItem('token', newToken) // Sauvegarde dans le navigateur
    }

    const logout = () => {
        token.value = ''
        user.value = null
        isLoggedIn.value = false
        localStorage.removeItem('token')
    }

    return { token, user, isLoggedIn, saveAuth, logout }
})