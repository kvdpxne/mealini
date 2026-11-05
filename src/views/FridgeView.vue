<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {storeToRefs} from 'pinia'
import {useFridgeStore} from '@/stores/fridge.store'
import {useAuthStore} from '@/stores/auth.store'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'
import {type CategoryFilter, useFridgeItems} from '@/composables/useFridgeItems'
import FridgeFilters from '@/components/fridge/FridgeFilters.vue'
import FridgeItemList from '@/components/fridge/FridgeItemList.vue'
import AddFridgeItemForm from '@/components/fridge/AddFridgeItemForm.vue'

const fridgeStore = useFridgeStore()
const authStore = useAuthStore()
const {items, loading} = storeToRefs(fridgeStore)

const search = ref('')
const category = ref<CategoryFilter>('all')

const {filteredSorted} = useFridgeItems(items, search, category)

async function refresh() {
  if (authStore.householdId) await fridgeStore.fetchItems(authStore.householdId)
}

onMounted(refresh)
useRealtimeSubscription('fridge_items', refresh)
useRealtimeSubscription('shopping_list_items', refresh)
</script>

<template>
  <div class="fridge-view">
    <h1>Moja lodówka</h1>
    <AddFridgeItemForm/>
    <FridgeFilters v-model:search="search" v-model:category="category"/>
    <p v-if="fridgeStore.error" class="error">{{ fridgeStore.error }}</p>
    <FridgeItemList
      :items="filteredSorted"
      :loading="loading"
      @delete="fridgeStore.deleteItem($event)"
      @move-to-shopping="fridgeStore.moveToShopping($event)"
      @update-quantity="(id, qty) => fridgeStore.updateQuantity(id, qty)"
    />
  </div>
</template>