import {createRouter, createWebHistory} from 'vue-router'
import {useAuthStore} from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/login', component: () => import('@/views/LoginView.vue'), meta: {public: true}},
    {path: '/forgot-password', component: () => import('@/views/ForgotPasswordView.vue'), meta: {public: true}},
    {path: '/reset-password', component: () => import('@/views/ResetPasswordView.vue'), meta: {public: true}},
    {path: '/account', component: () => import('@/views/AccountSettingsView.vue')},
    {path: '/household', component: () => import('@/views/HouseholdSettingsView.vue')},
    {path: '/onboarding', component: () => import('@/views/OnboardingView.vue')},
    {path: '/shopping', component: () => import('@/views/ShoppingListView.vue')},
    {path: '/stores', component: () => import('@/views/StoresListView.vue')},
    {path: '/stores/:id', component: () => import('@/views/StoreDetailView.vue')},
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