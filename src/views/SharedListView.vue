<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import {CheckCircle2, Clock, XCircle} from 'lucide-vue-next'
import {type SharedList, shoppingShareService} from '@/services/shopping-share.service'
import {useToastStore} from '@/stores/toast.store'
import {formatQuantity} from '@/lib/quantity'
import SkeletonList from '@/components/shared/SkeletonList.vue'

const route = useRoute()
const toast = useToastStore()

const token = computed(() => String(route.params.token ?? ''))
const list = ref<SharedList | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const completing = ref(false)
const completed = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    list.value = await shoppingShareService.getSharedList(token.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Nie udało się pobrać listy.'
  } finally {
    loading.value = false
  }
}

async function toggle(itemId: string, current: boolean) {
  if (!list.value) return
  // Optimistic
  const idx = list.value.items.findIndex(i => i.id === itemId)
  if (idx === -1) return
  const prev = list.value.items[idx]
  list.value.items[idx] = {...prev, is_bought: !current}
  try {
    await shoppingShareService.toggleItem(token.value, itemId, !current)
  } catch (e) {
    list.value.items[idx] = prev
    toast.show(e instanceof Error ? e.message : 'Nie udało się zapisać', 'error')
  }
}

async function complete() {
  completing.value = true
  try {
    await shoppingShareService.complete(token.value)
    completed.value = true
    toast.show('Zakupy zakończone – dziękujemy!', 'success')
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Nie udało się zakończyć', 'error')
  } finally {
    completing.value = false
  }
}

const toBuy = computed(() => list.value?.items.filter(i => !i.is_bought) ?? [])
const bought = computed(() => list.value?.items.filter(i => i.is_bought) ?? [])

onMounted(load)
</script>

<template>
  <div class="shared-view">
    <header class="page-head">
      <h1>Lista zakupów</h1>
      <p class="sub">Udostępniona przez gospodarstwo domowe. Odhaczaj pozycje w trakcie zakupów.</p>
    </header>

    <SkeletonList v-if="loading" :count="5"/>

    <div v-else-if="error" class="state error">
      <XCircle :size="40"/>
      <p>{{ error }}</p>
      <p class="hint">Poproś właściciela listy o nowy link.</p>
    </div>

    <div v-else-if="completed" class="state success">
      <CheckCircle2 :size="40"/>
      <p>Zakupy zakończone. Dziękujemy!</p>
    </div>

    <template v-else-if="list">
      <p class="expiry">
        <Clock :size="14"/>
        Link wygasa {{ new Date(list.expires_at).toLocaleString('pl-PL') }}
      </p>

      <section v-if="toBuy.length > 0">
        <h2>Do kupienia ({{ toBuy.length }})</h2>
        <ul class="items">
          <li v-for="item in toBuy" :key="item.id">
            <label>
              <input
                type="checkbox"
                :checked="item.is_bought"
                @change="toggle(item.id, item.is_bought)"
              />
              <span>{{ item.name }}</span>
              <span class="qty">{{ formatQuantity(item.quantity, item.unit) }}</span>
            </label>
          </li>
        </ul>
      </section>

      <section v-if="bought.length > 0">
        <h2>Kupione ({{ bought.length }})</h2>
        <ul class="items bought">
          <li v-for="item in bought" :key="item.id">
            <label>
              <input
                type="checkbox"
                :checked="item.is_bought"
                @change="toggle(item.id, item.is_bought)"
              />
              <span>{{ item.name }}</span>
              <span class="qty">{{ formatQuantity(item.quantity, item.unit) }}</span>
            </label>
          </li>
        </ul>
      </section>

      <button
        class="complete"
        :disabled="completing"
        @click="complete"
      >
        {{ completing ? 'Zamykanie...' : 'Zakończ zakupy' }}
      </button>
      <p class="note">
        Po zakończeniu link przestanie działać. Jeśli kupisz tylko część, po prostu
        zamknij kartę – link wygaśnie sam.
      </p>
    </template>
  </div>
</template>

<style scoped>
.shared-view {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.state {
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.state.error {
  color: #b91c1c;
}

.state.success {
  color: #15803d;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
}

.expiry {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
}

section h2 {
  font-size: 1rem;
  margin: 0.75rem 0 0.5rem;
  color: #374151;
}

.items {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.items li {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.6rem 0.85rem;
}

.items label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.items.bought span {
  text-decoration: line-through;
  color: #9ca3af;
}

.qty {
  margin-left: auto;
  font-size: 0.85rem;
  color: #6b7280;
}

.complete {
  margin-top: 1rem;
  padding: 0.7rem 1rem;
  background: #0a7;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
}

.complete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.note {
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
  margin: 0;
}
</style>