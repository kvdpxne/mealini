<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useToastStore} from '@/stores/toast.store'
import {useConfirmStore} from '@/stores/confirm.store'
import {useShoppingStore} from '@/stores/shopping.store'
import {useAuthStore} from '@/stores/auth.store'
import {useRealtimeSubscription} from '@/composables/useRealtimeSubscription'
import ShoppingItemList from '@/components/shopping/ShoppingItemList.vue'

const toast = useToastStore()
const confirm = useConfirmStore()
const shoppingStore = useShoppingStore()
const authStore = useAuthStore()
const newItem = ref('')

async function refresh() {
  if (authStore.householdId) {
    await shoppingStore.fetchItems(authStore.householdId)
  }
}

async function handleAdd() {
  if (!authStore.householdId || !newItem.value.trim()) return
  await shoppingStore.addItem(authStore.householdId, newItem.value)
  newItem.value = ''
  toast.show('Dodano do listy', 'success')
}

async function handleClear() {
  if (!authStore.householdId) return
  const ok = await confirm.ask('Usunąć wszystkie kupione pozycje?', 'Wyczyść listę')
  if (!ok) return
  await shoppingStore.clearBought(authStore.householdId)
  toast.show('Wyczyszczono kupione', 'success')
}

async function handleMoveAllBought() {
  if (!authStore.householdId) return
  const count = await shoppingStore.moveAllBoughtToFridge(authStore.householdId)
  toast.show(`Przeniesiono ${count} ${count === 1 ? 'produkt' : 'produktów'} do lodówki`, 'success')
}

async function handleMoveToFridge(id: string) {
  await shoppingStore.moveToFridge(id)
  toast.show('Przeniesiono do lodówki', 'success')
}

async function handleDelete(id: string) {
  const ok = await confirm.ask('Usunąć tę pozycję?', 'Usuń')
  if (!ok) return
  await shoppingStore.deleteItem(id)
  toast.show('Usunięto', 'info')
}

onMounted(refresh)
useRealtimeSubscription('shopping_list_items', refresh)
useRealtimeSubscription('fridge_items', refresh)
</script>

<template>
  <div class="shopping-view">
    <h1>Lista zakupów</h1>

    <form class="add-form" @submit.prevent="handleAdd">
      <input v-model="newItem" type="text" placeholder="Co dokupić?" required/>
      <button type="submit">Dodaj</button>
    </form>

    <p v-if="shoppingStore.error" class="error">{{ shoppingStore.error }}</p>

    <section>
      <h2>Do kupienia</h2>
      <ShoppingItemList
        :items="shoppingStore.toBuy"
        empty-text="Nic do kupienia 🎉"
        @toggle="shoppingStore.toggleBought($event)"
        @delete="shoppingStore.deleteItem($event)"
        @move-to-fridge="shoppingStore.moveToFridge($event)"
      />
    </section>

    <section v-if="shoppingStore.bought.length > 0">
      <div class="section-head">
        <h2>Kupione</h2>
        <div class="bulk-actions">
          <button class="secondary" @click="handleMoveAllBought">🧊 Przenieś do lodówki</button>
          <button class="secondary" @click="handleClear">Wyczyść</button>
        </div>
      </div>
      <ShoppingItemList
        :items="shoppingStore.bought"
        empty-text=""
        @toggle="shoppingStore.toggleBought($event)"
        @delete="handleDelete"
        @move-to-fridge="handleMoveToFridge"
      />
    </section>
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

.add-form {
  display: flex;
  gap: 0.5rem;
}

.add-form input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.add-form button {
  padding: 0.5rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.25rem 0 0.25rem;
}

.bulk-actions {
  display: flex;
  gap: 0.5rem;
}

.secondary {
  background: transparent;
  border: 1px solid #d1d5db;
  padding: 0.3rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.secondary:hover {
  background: #f3f4f6;
}

.error {
  color: #c00;
  margin-top: 0.75rem;
}
</style>