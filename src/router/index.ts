import {createRouter, createWebHistory} from 'vue-router'
import {useAuthStore} from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/login', component: () => import('@/views/LoginView.vue'), meta: {public: true}},
    {path: '/onboarding', component: () => import('@/views/OnboardingView.vue')},
    {path: '/shopping', component: () => import('@/views/ShoppingListView.vue')},
    {path: '/', component: () => import('@/views/FridgeView.vue')},
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.initialize()

  if (!authStore.session) {
    return to.meta.public ? true : '/login'
  }

  if (!authStore.householdId) {
    return to.path === '/onboarding' ? true : '/onboarding'
  }

  if (to.path === '/login' || to.path === '/onboarding') {
    return '/'
  }

  return true
})

export default router