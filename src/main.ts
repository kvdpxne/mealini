import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import {useToastStore} from './stores/toast.store'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)

app.config.errorHandler = (err, _instance, info) => {
  console.error('[Global error]', {err, info})
  try {
    const toast = useToastStore()
    const message = err instanceof Error ? err.message : 'Wystąpił nieoczekiwany błąd'
    toast.show(message, 'error', 6000)
  } catch {
  }
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled promise]', event.reason)
  try {
    useToastStore().show(
      event.reason instanceof Error ? event.reason.message : 'Nieoczekiwany błąd',
      'error',
      6000,
    )
  } catch {
  }
})

app.mount('#app')