<script setup lang="ts">
import {ref} from 'vue'
import {BookOpen, Sparkles, Utensils} from 'lucide-vue-next'
import MyRecipesTab from '@/components/recipes/MyRecipesTab.vue'
import SpoonacularTab from '@/components/recipes/SpoonacularTab.vue'
import AiChefTab from '@/components/recipes/AiChefTab.vue'

type Tab = 'my' | 'spoonacular' | 'ai'
const activeTab = ref<Tab>('my')
</script>

<template>
  <div class="recipes-view">
    <header>
      <h1>Przepisy</h1>
      <p class="sub">Twoje przepisy, inspiracje z lodówki i pomoc asystenta AI.</p>
    </header>

    <div class="tabs" role="tablist">
      <button
        role="tab"
        :aria-selected="activeTab === 'my'"
        :class="['tab', { active: activeTab === 'my' }]"
        @click="activeTab = 'my'"
      >
        <BookOpen :size="16"/>
        <span>Moje przepisy</span>
      </button>
      <button
        role="tab"
        :aria-selected="activeTab === 'spoonacular'"
        :class="['tab', { active: activeTab === 'spoonacular' }]"
        @click="activeTab = 'spoonacular'"
      >
        <Utensils :size="16"/>
        <span>Z lodówki</span>
      </button>
      <button
        role="tab"
        :aria-selected="activeTab === 'ai'"
        :class="['tab', { active: activeTab === 'ai' }]"
        @click="activeTab = 'ai'"
      >
        <Sparkles :size="16"/>
        <span>Asystent AI</span>
      </button>
    </div>

    <MyRecipesTab v-if="activeTab === 'my'"/>
    <SpoonacularTab v-else-if="activeTab === 'spoonacular'"/>
    <AiChefTab v-else/>
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
  overflow-x: auto;
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
  white-space: nowrap;
  flex-shrink: 0;
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