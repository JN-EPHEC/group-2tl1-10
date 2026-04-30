import { createRouter, createWebHistory } from 'vue-router'
// TODO : Import des vues pricipal (Home, View, et le meilleur BRUH :) )
// import HomeView from '../views/HomeView.vue'
// import LoginView from '../views/LoginView.vue'
// import BruhView from '../views/BruhView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/bruh',
      name: 'bruh',
      component: BruhView
    }
  ]
})

export default router
