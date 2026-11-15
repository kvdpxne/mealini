<script setup lang="ts">
import {ref, watch} from 'vue'
import {Plus, Trash2, X} from 'lucide-vue-next'
import {storeToRefs} from 'pinia'
import {useShoppingSetsStore} from '@/stores/shoppingSets.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import InlineEdit from '@/components/shared/InlineEdit.vue'
import {formatQuantityParts} from '@/lib/quantity'
import {displayStepForUnit, UNITS} from '@/lib/units'
import {NAME_MAX_LENGTH} from '@/lib/validation'
import type {ShoppingSet, ShoppingSetItem} from '@/types/database.types'

const props = defineProps<{ visible: boolean; set: ShoppingSet | null }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const setsStore = useShoppingSetsStore()
const {itemsBySetId} = storeToRefs(setsStore)
const {run} = useAsyncAction()

const newName = ref('')
const newQty = ref(1)
const newUnit = ref('szt')

watch(
  () => props.visible,
  async (v) => {
    if (v && props.set) {
      await setsStore.fetchItems(props.set.id)
      newName.value = ''
      newQty.value = 1
      newUnit.value = 'szt'
    }
  },
)

const items = () => (props.set ? itemsBySetId.value[props.set.id] ?? [] : [])

function displayQty(item: ShoppingSetItem) {
  return formatQuantityParts(item.quantity, item.unit)
}

async function handleAdd() {
  if (!props.set || !newName.value.trim()) return
  const setId = props.set.id
  const result = await run(async () => {
    await setsStore.addItem(setId, {
      name: newName.value,
      quantity: newQty.value,
      unit: newUnit.value,
    })
    return true as const
  }, { success: 'Pozycja dodana' })
  if (result) {
    newName.value = ''
    newQty.value = 1
    newUnit.value = 'szt'
  }
}

async function handleUpdateName(item: ShoppingSetItem, name: string) {
  if (!props.set) return
  const setId = props.set.id
  await run(async () => {
    await setsStore.updateItem(setId, item.id, { name })
    return true as const
  })
}

async function handleUpdateQty(item: ShoppingSetItem, newValue: number) {
  if (!props.set) return
  const setId = props.set.id
  const parts = displayQty(item)
  await run(async () => {
    await setsStore.updateItem(setId, item.id, {
      quantity: newValue,
      unit: parts.unit,
    })
    return true as const
  })
}

async function handleDelete(item: ShoppingSetItem) {
  if (!props.set) return
  const setId = props.set.id
  await run(async () => {
    await setsStore.deleteItem(setId, item.id)
    return true as const
  })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible && set" class="overlay" @click.self="emit('close')">
      <div class="dialog">
        <header class="dialog-head">
          <h3>{{ set.name }}</h3>
          <button class="icon-btn" @click="emit('close')">
            <X :size="18"/>
          </button>
        </header>

        <ul v-if="items().length > 0" class="items">
          <li v-for="item in items()" :key="item.id">
            <InlineEdit
              :model-value="item.name"
              type="text"
              :maxlength="NAME_MAX_LENGTH"
              emphasis
              @update="handleUpdateName(item, $event as string)"
            />
            <InlineEdit
              :model-value="displayQty(item).value"
              type="number"
              :min="0.01"
              :step="displayStepForUnit(displayQty(item).unit)"
              :suffix="displayQty(item).unit"
              variant="muted"
              @update="handleUpdateQty(item, $event as number)"
            />
            <button class="icon-btn danger" title="Usuń" @click="handleDelete(item)">
              <Trash2 :size="16"/>
            </button>
          </li>
        </ul>
        <p v-else class="empty">Zestaw jest pusty. Dodaj pierwszą pozycję poniżej.</p>

        <form class="add-form" @submit.prevent="handleAdd">
          <input v-model="newName" type="text" placeholder="Nazwa" :maxlength="NAME_MAX_LENGTH" required/>
          <input v-model.number="newQty" type="number" min="0.01" step="0.01"/>
          <select v-model="newUnit">
            <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
          </select>
          <button type="submit" class="primary" :disabled="!newName.trim()">
            <Plus :size="14"/>
            <span>Dodaj</span>
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 1rem;
}

.dialog {
  background: #fff;
  border-radius: 10px;
  padding: 1.5rem;
  max-width: 560px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 85vh;
  overflow-y: auto;
}

.dialog-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-head h3 {
  margin: 0;
  font-size: 1.1rem;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.3rem;
  border-radius: 4px;
}

.icon-btn.danger:hover {
  background: #fef2f2;
  color: #dc2626;
}

.items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.items li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
}

.items li > :first-child {
  flex: 1;
  min-width: 0;
}

.empty {
  color: #6b7280;
  font-size: 0.85rem;
  text-align: center;
  padding: 1rem;
  margin: 0;
}

.add-form {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.add-form input[type="text"] {
  flex: 1;
  min-width: 120px;
  padding: 0.4rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
}

.add-form input[type="number"] {
  width: 70px;
  padding: 0.4rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
}

.add-form select {
  padding: 0.4rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.85rem;
}

.primary {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.85rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>