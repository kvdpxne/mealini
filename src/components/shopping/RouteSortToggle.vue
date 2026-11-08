<script setup lang="ts">
defineProps<{ modelValue: boolean; disabled?: boolean }>()
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()
</script>

<template>
  <label class="toggle-switch" :class="{ disabled }">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="track"><span class="thumb"/></span>
    <span class="label"><slot/></span>
  </label>
</template>

<style scoped>
.toggle-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;
  font-size: 0.85rem;
  color: #374151;
}

.toggle-switch.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-switch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.track {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  background: #d1d5db;
  border-radius: 999px;
  transition: background 0.15s;
  flex-shrink: 0;
}

.thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.15s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

input:checked + .track {
  background: #0a7;
}

input:checked + .track .thumb {
  transform: translateX(14px);
}

input:focus-visible + .track {
  outline: 2px solid #0a7;
  outline-offset: 2px;
}

.label {
  user-select: none;
}
</style>