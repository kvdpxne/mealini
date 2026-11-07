<script setup lang="ts">
import {computed, nextTick, ref} from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string | number
  type?: 'text' | 'number'
  maxlength?: number
  min?: number
  step?: number
  suffix?: string
  disabled?: boolean
  emphasis?: boolean
  variant?: 'default' | 'muted'
  placeholder?: string
}>(), {
  type: 'text',
  disabled: false,
  emphasis: false,
  variant: 'default',
  placeholder: '(brak)',
})

const emit = defineEmits<{ (e: 'update', value: string | number): void }>()

const editing = ref(false)
const draft = ref<string | number>(props.modelValue)
const inputEl = ref<HTMLInputElement | null>(null)

const displayText = computed(() => {
  const v = props.modelValue
  if (v === '' || v === null || v === undefined) return props.placeholder
  return props.suffix ? `${v} ${props.suffix}` : String(v)
})

async function startEdit() {
  if (props.disabled) return
  draft.value = props.modelValue
  editing.value = true
  await nextTick()
  inputEl.value?.focus()
  inputEl.value?.select()
}

function commit() {
  if (!editing.value) return
  editing.value = false

  let next: string | number
  if (props.type === 'number') {
    const n = Number(draft.value)
    if (!Number.isFinite(n) || n <= 0) return
    next = n
  } else {
    const s = String(draft.value).trim()
    if (!s) return
    if (props.maxlength && s.length > props.maxlength) return
    next = s
  }

  if (next === props.modelValue) return
  emit('update', next)
}

function cancel() {
  editing.value = false
}
</script>

<template>
  <span
    class="inline-edit"
    :class="[`inline-edit--${variant}`, { 'inline-edit--emphasis': emphasis }]"
  >
    <input
      v-if="editing"
      ref="inputEl"
      v-model="draft"
      :type="type"
      :maxlength="maxlength"
      :min="min"
      :step="step"
      class="inline-input"
      @blur="commit"
      @keyup.enter="commit"
      @keyup.esc="cancel"
    />
    <span
      v-else
      class="editable"
      :class="{ 'editable--disabled': disabled }"
      :title="disabled ? undefined : 'Kliknij, aby edytować'"
      @click="startEdit"
    >
      {{ displayText }}
    </span>
  </span>
</template>

<style scoped>
.inline-edit {
  display: inline-flex;
  align-items: center;
}

.editable {
  cursor: pointer;
  border-bottom: 1px dashed transparent;
  padding: 0.05rem 0.15rem;
  border-radius: 3px;
  transition: border-color 0.15s, background 0.15s;
}

.editable:hover:not(.editable--disabled) {
  border-bottom-color: #9ca3af;
  background: #f9fafb;
}

.editable--disabled {
  cursor: default;
}

.inline-edit--emphasis .editable {
  font-weight: 600;
  color: #111;
}

.inline-edit--muted .editable {
  color: #6b7280;
  font-size: 0.9rem;
}

.inline-input {
  width: 100px;
  min-width: 60px;
  padding: 0.15rem 0.35rem;
  font-size: inherit;
  font-family: inherit;
  font-weight: inherit;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #111;
}
</style>