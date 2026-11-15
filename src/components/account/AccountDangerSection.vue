<script setup lang="ts">
import {ref} from 'vue'
import {Trash2} from 'lucide-vue-next'
import DeleteAccountModal from './DeleteAccountModal.vue'

const showModal = ref(false)
</script>

<template>
  <section class="card danger">
    <h2>Strefa niebezpieczna</h2>
    <p class="hint">
      Usunięcie konta jest nieodwracalne. Usuniemy Twój profil, dane logowania
      i członkostwa we wszystkich gospodarstwach. Jeśli jesteś ostatnim członkiem
      gospodarstwa, usuniemy je razem z całą zawartością.
    </p>
    <button class="danger-btn" @click="showModal = true">
      <Trash2 :size="16"/>
      <span>Usuń konto</span>
    </button>
    <DeleteAccountModal :visible="showModal" @close="showModal = false"/>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 1.5rem;
}

.card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  color: #b91c1c;
}

.hint {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0 0 1rem;
  line-height: 1.45;
}

.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.danger-btn:hover {
  background: #b91c1c;
}
</style>