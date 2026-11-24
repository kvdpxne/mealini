<script setup lang="ts">
import {computed} from 'vue'
import {storeToRefs} from 'pinia'
import {Check} from 'lucide-vue-next'
import {useProfileStore} from '@/stores/profile.store'
import {useAuthStore} from '@/stores/auth.store'
import {useAsyncAction} from '@/composables/useAsyncAction'
import {AVATARS} from '@/lib/avatars'
import {displayName} from '@/utils/displayName'
import Avatar from '@/components/shared/Avatar.vue'

const profileStore = useProfileStore()
const authStore = useAuthStore()
const {profile} = storeToRefs(profileStore)
const {run} = useAsyncAction()

const currentAvatarId = computed(() => profile.value?.avatar_id ?? null)
const currentDisplayName = computed(() => displayName(profile.value ?? authStore.user))

async function handleSelect(id: string | null) {
  if (id === currentAvatarId.value) return
  await run(async () => {
    await profileStore.update({avatar_id: id})
    return true as const
  }, {success: id ? 'Avatar zmieniony' : 'Avatar usunięty'})
}
</script>

<template>
  <section class="card">
    <header class="head">
      <h2>Avatar</h2>
      <Avatar :avatar-id="currentAvatarId" :name="currentDisplayName" size="lg"/>
    </header>
    <p class="hint">
      Wybierz jeden z dostępnych avatarów. Bez avatara wyświetlimy pierwszą literę
      Twojego nickname'u.
    </p>

    <p v-if="AVATARS.length === 0" class="empty">
      Brak dostępnych avatarów. Dodaj pliki do <code>src/assets/avatars/</code>.
    </p>

    <div v-else class="grid">
      <button
        v-for="a in AVATARS"
        :key="a.id"
        type="button"
        class="option"
        :class="{ selected: a.id === currentAvatarId }"
        :title="a.label"
        @click="handleSelect(a.id)"
      >
        <img :src="a.url" :alt="a.label" loading="lazy"/>
        <span v-if="a.id === currentAvatarId" class="check">
          <Check :size="12"/>
        </span>
      </button>

      <button
        type="button"
        class="option clear"
        :class="{ selected: currentAvatarId === null }"
        title="Bez avatara"
        @click="handleSelect(null)"
      >
        <span class="clear-icon">—</span>
        <span v-if="currentAvatarId === null" class="check">
          <Check :size="12"/>
        </span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.5rem;
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.head h2 {
  margin: 0;
  font-size: 1.1rem;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.empty {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.empty code {
  background: #f3f4f6;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  font-size: 0.85em;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 0.5rem;
  max-width: 480px;
}

.option {
  position: relative;
  padding: 0;
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 50%;
  background: #f3f4f6;
  cursor: pointer;
  overflow: visible;
  transition: border-color 0.15s, transform 0.15s;
}

.option img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.option:hover {
  border-color: #d1d5db;
  transform: scale(1.05);
}

.option.selected {
  border-color: #0a7;
}

.option .check {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0a7;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
}

.option.clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.clear-icon {
  font-size: 1.5rem;
  color: #9ca3af;
}

.option.clear.selected .clear-icon {
  color: #0a7;
}
</style>