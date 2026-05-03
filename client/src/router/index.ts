import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import BruhView from '../views/BruhView.vue'
import TakerView from '../views/TakerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/bruh', name: 'bruh', component: BruhView },
    { path: '/taker', name: 'taker', component: TakerView }
  ]
})

export default router
