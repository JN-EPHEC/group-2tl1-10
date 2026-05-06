import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import BruhView from '../views/BruhView.vue'
import TakerView from '../views/TakerView.vue'
import MakerView from '../views/MakerView.vue'
import MakerListView from '../views/MakerListView.vue'
import MakerEditView from '../views/MakerEditView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/bruh', name: 'bruh', component: BruhView },
    { path: '/taker', name: 'taker', component: TakerView },
    { path: '/maker', name: 'maker', component: MakerView, meta: { requiresAuth: true } },
    { path: '/maker/list', name: 'maker-list', component: MakerListView, meta: { requiresAuth: true } },
    { path: '/maker/edit', name: 'maker-edit', component: MakerEditView, meta: { requiresAuth: true } }
  ]
})

// --- Router Guard ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Si la page où on veut aller est protégé ET qu'on n'est PAS connecté
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // Insulte absurde
    alert("Halte là, fraudeur ! Tu dois avoir un compte pour abuser de ton pouvoir")

    // Renvois vers la page bruh (ou login c'est trop chiant plus tard)
    next('/bruh')
  } else {
    // Sinon, on laisse l'utilisateur passer
    next()
  }
})

export default router
