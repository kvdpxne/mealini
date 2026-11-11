<script setup lang="ts">
import {storeToRefs} from 'pinia'
import {useShoppingStore} from '@/stores/shopping.store'
import {useShoppingView} from '@/composables/useShoppingView'
import ShoppingStoreBar from '@/components/shopping/ShoppingStoreBar.vue'
import ShoppingRouteToggleBar from '@/components/shopping/ShoppingRouteToggleBar.vue'
import ShoppingMapPanel from '@/components/shopping/ShoppingMapPanel.vue'
import ShoppingAddForm from '@/components/shopping/ShoppingAddForm.vue'
import QuickAddChips from '@/components/shopping/QuickAddChips.vue'
import ShoppingFilters from '@/components/shopping/ShoppingFilters.vue'
import ShoppingItemList from '@/components/shopping/ShoppingItemList.vue'
import ShoppingGroupedList from '@/components/shopping/ShoppingGroupedList.vue'
import ShoppingBoughtSection from '@/components/shopping/ShoppingBoughtSection.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'

const shoppingStore = useShoppingStore()
const {error} = storeToRefs(shoppingStore)

const {
  suggestions, loading,
  stores, zones, currentMapUrl,
  isOnline,
  movingAll,
  search, newItem, newQuantity, newUnit,
  toBuy, isSearchActive,
  activeStore, routeSortEnabled, useGroupedView, showBoughtSection,
  groups, zoneIdFor,
  selectStore,
  handleToggleRouteSort,
  handleAdd, handleQuickAdd, handleToggle,
  handleDelete, handleClear,
  handleMoveToFridge, handleMoveAllBought, handleSetZone,
  bought,
  clearError,
} = useShoppingView()
</script>

<template>
  <div class="shopping-view">
    <h1>Lista zakupów</h1>

    <ShoppingStoreBar
      :stores="stores"
      :selected-store-id="activeStore?.id ?? null"
      @select="selectStore"
    />

    <ShoppingRouteToggleBar
      v-if="activeStore"
      :store="activeStore"
      :route-sort-enabled="routeSortEnabled"
      :has-zones="zones.length > 0"
      @update:route-sort-enabled="handleToggleRouteSort"
    />

    <ShoppingMapPanel
      v-if="activeStore && currentMapUrl"
      :store-name="activeStore.name"
      :map-url="currentMapUrl"
    />

    <ShoppingAddForm
      v-model:name="newItem"
      v-model:quantity="newQuantity"
      v-model:unit="newUnit"
      :disabled="!isOnline"
      @submit="handleAdd"
    />

    <QuickAddChips :suggestions="suggestions" :disabled="!isOnline" @add="handleQuickAdd"/>

    <ShoppingFilters v-model:search="search"/>

    <ErrorBanner v-if="error" :message="error" @dismiss="clearError"/>

    <section>
      <h2>Do kupienia <span v-if="toBuy.length" class="count">({{ toBuy.length }})</span></h2>

      <ShoppingGroupedList
        v-if="useGroupedView"
        :groups="groups"
        :zones="zones"
        :is-online="isOnline"
        :is-search-active="isSearchActive"
        :zone-id-for="zoneIdFor"
        @toggle="handleToggle"
        @delete="handleDelete"
        @set-zone="handleSetZone"
      />
      <ShoppingItemList
        v-else
        :items="toBuy"
        :loading="loading"
        :disabled="!isOnline"
        :empty-text="isSearchActive ? 'Brak wyników w liście do kupienia.' : 'Nic do kupienia.'"
        @toggle="handleToggle"
        @delete="handleDelete"
        @move-to-fridge="handleMoveToFridge"
      />
    </section>

    <ShoppingBoughtSection
      v-if="showBoughtSection"
      :bought="bought"
      :loading="loading"
      :is-online="isOnline"
      :moving-all="movingAll"
      @toggle="handleToggle"
      @delete="handleDelete"
      @move-to-fridge="handleMoveToFridge"
      @move-all-bought="handleMoveAllBought"
      @clear="handleClear"
    />
  </div>
</template>

<style scoped>
.shopping-view h1 {
  margin: 0 0 1rem;
}

.shopping-view h2 {
  font-size: 1.05rem;
  margin: 0;
  color: #374151;
}

.count {
  color: #6b7280;
  font-weight: 400;
  font-size: 0.85rem;
}
</style>