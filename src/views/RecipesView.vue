<script setup lang="ts">
import {ref} from 'vue'
import {BookOpen, Utensils} from 'lucide-vue-next'
import MyRecipesTab from '@/components/recipes/MyRecipesTab.vue'
import SpoonacularTab from '@/components/recipes/SpoonacularTab.vue'

const activeTab = ref<'my' | 'spoonacular'>('my')
</script>

<template>
  <div class="recipes-view">
    <header>
      <h1>Przepisy</h1>
      <p class="sub">Twoje przepisy oraz inspiracje z zawartości lodówki.</p>
    </header>

    <div class="tabs">
      <button :class="['tab', { active: activeTab === 'my' }]" @click="activeTab = 'my'">
        <BookOpen :size="16"/>
        <span>Moje przepisy</span>
      </button>
      <button :class="['tab', { active: activeTab === 'spoonacular' }]" @click="activeTab = 'spoonacular'">
        <Utensils :size="16"/>
        <span>Z lodówki</span>
      </button>
    </div>

    <MyRecipesTab v-if="activeTab === 'my'"/>
    <SpoonacularTab v-else/>
  </div>
</template>

<style scoped>
.recipes-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipes-view h1 {
  margin: 0;
  font-size: 1.5rem;
}

.sub {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: -1px;
}

.tab:hover {
  color: #111;
}

.tab.active {
  color: #0a7;
  border-bottom-color: #0a7;
  font-weight: 500;
}
</style>