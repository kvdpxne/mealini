<script setup lang="ts">
import {Home, Refrigerator, ShoppingCart, User} from 'lucide-vue-next'
import {RouterLink} from 'vue-router'

const items = [
  {to: '/', label: 'Lodówka', icon: Refrigerator, exact: true},
  {to: '/shopping', label: 'Zakupy', icon: ShoppingCart, exact: false},
  {to: '/household', label: 'Dom', icon: Home, exact: false},
  {to: '/account', label: 'Konto', icon: User, exact: false},
] as const
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="item"
      :class="{ 'router-link-active': item.exact ? undefined : undefined }"
      :exact-active-class="item.exact ? 'router-link-exact-active' : undefined"
      active-class="active"
    >
      <component :is="item.icon" :size="22"/>
      <span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding: 0.35rem 0 calc(0.35rem + env(safe-area-inset-bottom));
  z-index: 50;
}

.item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.4rem 0.25rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.7rem;
  transition: color 0.15s;
}

.item.active {
  color: #0a7;
}

.item:hover {
  color: #0a7;
}

@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
  }
}
</style>