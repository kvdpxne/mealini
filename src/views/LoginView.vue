<script setup lang="ts">
import {ref} from 'vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

const mode = ref<'login' | 'register'>('login')
</script>

<template>
  <div class="login-view">
    <LoginForm v-if="mode === 'login'"/>
    <RegisterForm v-else/>
    <p class="switch">
      <template v-if="mode === 'login'">
        Nie masz konta?
        <a href="#" @click.prevent="mode = 'register'">Zarejestruj się</a>
      </template>
      <template v-else>
        Masz już konto?
        <a href="#" @click.prevent="mode = 'login'">Zaloguj się</a>
      </template>
    </p>
  </div>
</template>

<style scoped>
.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
}

.switch {
  font-size: 0.9rem;
}

.switch a {
  color: #0a7;
}
</style>