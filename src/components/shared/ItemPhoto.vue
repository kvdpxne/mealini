<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {ImagePlus, Loader2, Trash2, X} from 'lucide-vue-next'
import {itemPhotoService, type ItemType} from '@/services/item-photo.service'
import {useAuthStore} from '@/stores/auth.store'
import {useToastStore} from '@/stores/toast.store'

const props = defineProps<{
  imagePath: string | null
  itemType: ItemType
  itemId: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:imagePath', path: string | null): void
}>()

const authStore = useAuthStore()
const toast = useToastStore()

const signedUrl = ref<string | null>(null)
const uploading = ref(false)
const lightbox = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function refreshUrl() {
  if (!props.imagePath) {
    signedUrl.value = null
    return
  }
  signedUrl.value = await itemPhotoService.getSignedUrl(props.imagePath)
}

watch(() => props.imagePath, refreshUrl, {immediate: true})

const hasPhoto = computed(() => !!props.imagePath)

function pickFile() {
  if (props.disabled || uploading.value) return
  fileInput.value?.click()
}

async function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!authStore.householdId) return

  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
    toast.show('Dozwolone formaty: PNG, JPEG, WebP.', 'error')
    return
  }

  uploading.value = true
  try {
    const path = await itemPhotoService.upload(
      authStore.householdId,
      props.itemType,
      props.itemId,
      file,
      props.imagePath,
    )
    emit('update:imagePath', path)
    toast.show('Zdjęcie dodane', 'success')
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Nie udało się dodać zdjęcia', 'error')
  } finally {
    uploading.value = false
    ;(e.target as HTMLInputElement).value = ''
  }
}

async function handleRemove() {
  if (!props.imagePath || props.disabled) return
  try {
    await itemPhotoService.remove(props.imagePath)
    emit('update:imagePath', null)
    toast.show('Zdjęcie usunięte', 'info')
  } catch (e) {
    toast.show(e instanceof Error ? e.message : 'Nie udało się usunąć zdjęcia', 'error')
  }
}
</script>

<template>
  <div class="item-photo">
    <button
      v-if="hasPhoto && signedUrl"
      type="button"
      class="thumb"
      :disabled="disabled"
      title="Powiększ"
      @click="lightbox = true"
    >
      <img :src="signedUrl" alt="" loading="lazy"/>
    </button>

    <button
      v-else
      type="button"
      class="placeholder"
      :disabled="disabled || uploading"
      :title="uploading ? 'Przetwarzanie...' : 'Dodaj zdjęcie'"
      @click="pickFile"
    >
      <Loader2 v-if="uploading" :size="18" class="spin"/>
      <ImagePlus v-else :size="18"/>
    </button>

    <div v-if="hasPhoto && !disabled" class="actions">
      <button type="button" class="mini" title="Zmień" @click="pickFile">
        <ImagePlus :size="12"/>
      </button>
      <button type="button" class="mini danger" title="Usuń" @click="handleRemove">
        <Trash2 :size="12"/>
      </button>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/webp"
      hidden
      @change="handleFile"
    />

    <Teleport to="body">
      <div v-if="lightbox && signedUrl" class="lightbox" @click.self="lightbox = false">
        <button class="lb-close" @click="lightbox = false">
          <X :size="24"/>
        </button>
        <img :src="signedUrl" alt=""/>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.item-photo {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.thumb, .placeholder {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  padding: 0;
  color: #9ca3af;
  transition: border-color 0.15s, background 0.15s;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb:hover {
  border-color: #0a7;
}

.placeholder:hover:not(:disabled) {
  border-color: #0a7;
  color: #0a7;
  background: #f0fdf4;
}

.placeholder:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.actions {
  position: absolute;
  bottom: -4px;
  right: -4px;
  display: flex;
  gap: 2px;
}

.mini {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  padding: 0;
}

.mini:hover {
  background: #f3f4f6;
  color: #111;
}

.mini.danger:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.lightbox img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
}

.lb-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: #fff;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lb-close:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>