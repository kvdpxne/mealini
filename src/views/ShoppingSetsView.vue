<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {Plus} from 'lucide-vue-next'
import {storeToRefs} from 'pinia'
import {useShoppingSetsStore} from '@/stores/shoppingSets.store'
import {useShoppingSetsView} from '@/composables/useShoppingSetsView'
import ShoppingSetCard from '@/components/shopping/ShoppingSetCard.vue'
import SaveCurrentListModal from '@/components/shopping/SaveCurrentListModal.vue'
import EditSetItemsModal from '@/components/shopping/EditSetItemsModal.vue'
import SkeletonList from '@/components/shared/SkeletonList.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'
import type {ShoppingSet} from '@/types/database.types'

const setsStore = useShoppingSetsStore()
const {sets, loading, error} = storeToRefs(setsStore)
const {currentListCount, handleDelete, handleApply, clearError} = useShoppingSetsView()

const showSave = ref(false)
const editingSet = ref<ShoppingSet | null>(null)

const setItemCount = computed(() => {
  const map: Record<string, number> = {}
  for (const s of sets.value) {
    map[s.id] = setsStore.itemsBySetId[s.id]?.length ?? 0
  }
  return map
})

async function loadCounts() {
  await Promise.all(sets.value.map(s => setsStore.fetchItems(s.id)))
}

// Ładujemy liczniki pozycji, gdy zmieni się lista zestawów (mount + realtime + po dodaniu)
watch(() => sets.value.map(s => s.id).join(','), loadCounts, {immediate: true})
</script>

<template>
  <div class="sets-view">
    <header class="page-head">
      <div>
        <h1>Zestawy zakupów</h1>
        <p class="sub">Zapisz typową listę jako zestaw i dodawaj ją jednym kliknięciem.</p>
      </div>
      <button class="primary" :disabled="currentListCount === 0" @click="showSave = true">
        <Plus :size="16"/>
        <span>Zapisz obecną listę</span>
      </button>
    </header>

    <ErrorBanner v-if="error" :message="error" @dismiss="clearError"/>

    <SkeletonList v-if="loading" :count="3"/>
    <p v-else-if="sets.length === 0" class="empty">
      Nie masz jeszcze żadnych zestawów.
      <template v-if="currentListCount > 0">
        Masz {{ currentListCount }} pozycji na liście „do kupienia" – zapisz je jako pierwszy zestaw.
      </template>
      <template v-else>
        Dodaj produkty do listy zakupów, a potem zapisz je jako zestaw.
      </template>
    </p>
    <ul v-else class="sets-list">
      <ShoppingSetCard
        v-for="s in sets"
        :key="s.id"
        :set="s"
        :item-count="setItemCount[s.id] ?? 0"
        @apply="handleApply(s.id, s.name)"
        @edit="editingSet = s"
        @delete="handleDelete(s.id, s.name)"
      />
    </ul>

    <SaveCurrentListModal :visible="showSave" @close="showSave = false"/>
    <EditSetItemsModal
      :visible="!!editingSet"
      :set="editingSet"
      @close="editingSet = null"
    />
  </div>
</template>

<style scoped>
.sets-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-head h1 {
  margin: 0;
  font-size: 1.5rem;
}

.sub {
  margin: 0.25rem 0 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.primary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  color: #6b7280;
  padding: 3rem 1rem;
  line-height: 1.6;
}

.sets-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>