import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || '')
    const user = ref<{ id: number; pseudo: string; email: string } | null>(null)

    // L'utilisateur est connecté seulement si il a un token ET que l'utilisateur est chargé 
    const isLoggedIn = ref(false)

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

    // Fonction pour se souvenir de l'utilisateur après rechargement
    const fetchUser = async () => {
        if (!token.value) return

        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token.value}`
                }
            })

            if (response.ok) {
                const userData = await response.json()
                user.value = userData
                isLoggedIn.value = true
            } else {
                logout()
            }
        } catch (error) {
            console.error("Erreur de connexion au backend", error)
            logout()
        }
    }

    return { token, user, isLoggedIn, saveAuth, logout, fetchUser }
})