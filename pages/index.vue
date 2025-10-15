<template>
  <div class="scanning-page">
    <header class="page-header">
      <h1>Picklist Scanner</h1>
      <p class="subtitle">Scan products into boxes for warehouse picking</p>
    </header>

    <main class="page-content">
      <!-- Session Setup -->
      <section v-if="!currentSession" class="setup-section">
        <BoxSetupForm @start-session="handleStartSession" />
      </section>

      <!-- Active Session -->
      <section v-else class="session-section">
        <div class="session-header">
          <div class="session-info">
            <h2>Box: {{ currentSession.boxNumber }}</h2>
            <span class="box-style-badge">{{ currentSession.boxStyle }}</span>
          </div>
          <button class="btn-secondary" @click="handleCompleteSession">
            Complete Session
          </button>
        </div>

        <!-- Error Display -->
        <div v-if="errorMessage" class="error-message">
          <span class="error-icon">⚠</span>
          <span>{{ errorMessage }}</span>
          <button class="error-close" @click="errorMessage = null">×</button>
        </div>

        <!-- Barcode Scanner -->
        <BarcodeScanner @scan="handleScan" />

        <!-- Loading Indicator -->
        <div v-if="loading" class="loading-indicator">
          <span class="spinner"></span>
          <span>Looking up product...</span>
        </div>

        <!-- Product List -->
        <ProductList :products="currentSession.products" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { BoxStyle } from '~/types/scanning'
import BoxSetupForm from '~/components/BoxSetupForm.vue'
import BarcodeScanner from '~/components/BarcodeScanner.vue'
import ProductList from '~/components/ProductList.vue'
import { useScanning } from '~/composables/useScanning'
import { useProductLookup } from '~/composables/useProductLookup'
import { useSessionPersistence } from '~/composables/useSessionPersistence'
import { isValidBarcode, sanitizeBarcode } from '~/utils/barcodeValidator'

const { currentSession, createSession, addProduct, clearSession } = useScanning()
const { lookupProduct, loading, error } = useProductLookup()
const { saveSession } = useSessionPersistence()

const errorMessage = ref<string | null>(null)

const handleStartSession = (boxNumber: string, boxStyle: BoxStyle) => {
  createSession(boxNumber, boxStyle)
  errorMessage.value = null
}

const handleScan = async (barcode: string) => {
  if (!currentSession.value) {
    errorMessage.value = 'No active session. Please start a session first.'
    return
  }

  // Sanitize and validate barcode
  const sanitized = sanitizeBarcode(barcode)

  if (!isValidBarcode(sanitized)) {
    errorMessage.value = `Invalid barcode format: ${barcode}`
    return
  }

  errorMessage.value = null

  try {
    const product = await lookupProduct(sanitized)

    if (!product) {
      // Error message already set by useProductLookup
      errorMessage.value = error.value
      return
    }

    // Add product to session
    addProduct(product)

    // Save session to localStorage (T024)
    saveSession(currentSession.value)
  } catch (err: any) {
    errorMessage.value = err.data?.message || 'Failed to lookup product. Please try again.'
    console.error('Scan error:', err)
  }
}

const handleCompleteSession = () => {
  if (!currentSession.value) return

  // Save final state
  if (currentSession.value.products.length > 0) {
    saveSession(currentSession.value)
  }

  // Clear session
  clearSession()
  errorMessage.value = null
}

// Watch for errors from useProductLookup
watch(error, (newError) => {
  if (newError) {
    errorMessage.value = newError
  }
})
</script>

<style scoped>
.scanning-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.page-header {
  background: white;
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.page-header h1 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 2rem;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.setup-section {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.session-section {
  /* Active session container */
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.session-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.session-info h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.box-style-badge {
  padding: 0.375rem 0.75rem;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
}

.btn-secondary {
  padding: 0.625rem 1.25rem;
  background: #666;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #555;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #ffebee;
  border: 1px solid #ef5350;
  border-radius: 4px;
  color: #c62828;
  margin-bottom: 1rem;
  animation: slideIn 0.3s ease-out;
}

.error-icon {
  font-size: 1.25rem;
}

.error-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #c62828;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-close:hover {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fff3e0;
  border-radius: 4px;
  color: #e65100;
  margin-bottom: 1rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #ffcc80;
  border-top-color: #e65100;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
