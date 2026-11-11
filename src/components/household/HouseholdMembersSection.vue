<script setup lang="ts">
import {storeToRefs} from 'pinia'
import {useHouseholdStore} from '@/stores/household.store'
import {useAuthStore} from '@/stores/auth.store'
import {displayName} from '@/utils/displayName'

const householdStore = useHouseholdStore()
const authStore = useAuthStore()
const {members} = storeToRefs(householdStore)

function formatJoinedAt(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL')
}
</script>

<template>
  <section class="card">
    <h2>Członkowie <span class="count">({{ members.length }})</span></h2>
    <ul class="members">
      <li v-for="m in members" :key="m.user_id">
        <div class="member-main">
          <strong>{{ displayName(m) }}</strong>
          <span v-if="m.user_id === authStore.user?.id" class="badge-you">Ty</span>
        </div>
        <span class="joined">dołączył(a) {{ formatJoinedAt(m.joined_at) }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
}

.card h2 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  color: #111;
}

.count {
  color: #9ca3af;
  font-weight: 400;
  font-size: 0.9rem;
}

.members {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.members li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.members li:last-child {
  border-bottom: none;
}

.member-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-you {
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

.joined {
  font-size: 0.8rem;
  color: #6b7280;
}

@media (max-width: 640px) {
  .members li {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
  }
}
</style>