<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {getAvatarUrl} from '@/lib/avatars'

const props = withDefaults(defineProps<{
  avatarId?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
}>(), {
  avatarId: null,
  name: null,
  size: 'md',
})

const imageFailed = ref(false)
watch(() => props.avatarId, () => {
  imageFailed.value = false
})

const url = computed(() => getAvatarUrl(props.avatarId))
const showImage = computed(() => !!url.value && !imageFailed.value)
const initial = computed(() => {
  const n = props.name?.trim()
  return n ? n.charAt(0).toUpperCase() : '?'
})
</script>

<template>
  <span class="avatar" :class="`avatar--${size}`" :title="name ?? undefined">
    <img
      v-if="showImage"
      :src="url!"
      :alt="name ?? 'Avatar'"
      @error="imageFailed = true"
    />
    <span v-else class="initial">{{ initial }}</span>
  </span>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  color: #6b7280;
  font-weight: 600;
  flex-shrink: 0;
  user-select: none;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar--sm {
  width: 24px;
  height: 24px;
  font-size: 0.7rem;
}

.avatar--md {
  width: 32px;
  height: 32px;
  font-size: 0.85rem;
}

.avatar--lg {
  width: 48px;
  height: 48px;
  font-size: 1.1rem;
}
</style>