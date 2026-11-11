<script setup lang="ts">
import {useStoreDetail} from '@/composables/useStoreDetail'
import StoreDetailHeader from '@/components/stores/StoreDetailHeader.vue'
import StoreMapSection from '@/components/stores/StoreMapSection.vue'
import StoreZonesSection from '@/components/stores/StoreZonesSection.vue'
import StoreFormModal from '@/components/stores/StoreFormModal.vue'
import ErrorBanner from '@/components/shared/ErrorBanner.vue'

const {
  currentStore, currentMapUrl, zones, error, loading,
  showRename,
  handleRename, handleUploadMap, handleRemoveMap,
  handleAddZone, handleRenameZone, handleDeleteZone, handleMoveZone,
  goBack, clearError,
} = useStoreDetail()
</script>

<template>
  <div class="store-detail">
    <StoreDetailHeader
      :store-name="currentStore?.name"
      @back="goBack"
      @rename="showRename = true"
    />

    <ErrorBanner v-if="error" :message="error" @dismiss="clearError"/>

    <div v-if="loading && !currentStore" class="state">Ładowanie...</div>

    <template v-else-if="currentStore">
      <StoreMapSection
        :map-url="currentMapUrl"
        @upload="handleUploadMap"
        @remove="handleRemoveMap"
      />
      <StoreZonesSection
        :zones="zones"
        @add="handleAddZone"
        @rename="handleRenameZone"
        @delete="handleDeleteZone"
        @move="handleMoveZone"
      />
    </template>

    <StoreFormModal
      :visible="showRename"
      title="Zmień nazwę sklepu"
      :initial-name="currentStore?.name"
      @save="handleRename"
      @close="showRename = false"
    />
  </div>
</template>

<style scoped>
.store-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 720px;
  margin: 0 auto;
}

.state {
  padding: 2rem;
  text-align: center;
  color: #6b7280;
}
</style>