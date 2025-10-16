<template>
  <div class="picklist-download">
    <!-- Download Button -->
    <button
      :disabled="!canDownload || isExporting"
      :class="buttonClasses"
      @click="handleDownload"
    >
      <span v-if="isExporting" class="loading-icon">⏳</span>
      <span v-else class="download-icon">⬇️</span>
      {{ buttonText }}
    </button>

    <!-- Product Count Summary -->
    <div v-if="session && session.products.length > 0" class="summary">
      {{ session.products.length }} product{{ session.products.length !== 1 ? 's' : '' }} scanned
      ({{ totalQuantity }} total items)
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <!-- Empty State Message -->
    <div v-if="!session || session.products.length === 0" class="empty-message">
      Scan products to enable download
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ScanningSession } from '~/types/scanning'

interface Props {
  session: ScanningSession | null
}

const props = defineProps<Props>()

// Composable for export logic
const { isExporting, error, downloadCsv, canExport } = usePicklistExport()

// Computed properties
const canDownload = computed(() => canExport(props.session))

const totalQuantity = computed(() => {
  if (!props.session) return 0
  return props.session.products.reduce((sum, product) => sum + product.quantity, 0)
})

const buttonText = computed(() => {
  if (isExporting.value) return 'Generating CSV...'
  if (!canDownload.value) return 'Download Picklist'
  return 'Download Picklist'
})

const buttonClasses = computed(() => ({
  'download-button': true,
  'download-button--disabled': !canDownload.value || isExporting.value,
  'download-button--loading': isExporting.value,
  'download-button--ready': canDownload.value && !isExporting.value
}))

// Actions
const handleDownload = () => {
  if (!props.session || !canDownload.value) return
  downloadCsv(props.session)
}
</script>

<style scoped>
.picklist-download {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: #3b82f6;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.download-button:hover:not(.download-button--disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.download-button:active:not(.download-button--disabled) {
  transform: translateY(0);
}

.download-button--disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.download-button--loading {
  background: #6366f1;
  cursor: wait;
}

.download-button--ready {
  background: #10b981;
}

.download-button--ready:hover {
  background: #059669;
}

.loading-icon,
.download-icon {
  font-size: 1.25rem;
}

.summary {
  text-align: center;
  font-size: 0.875rem;
  color: #6b7280;
}

.error-message {
  padding: 0.75rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  text-align: center;
}

.empty-message {
  text-align: center;
  font-size: 0.875rem;
  color: #9ca3af;
  font-style: italic;
}
</style>
