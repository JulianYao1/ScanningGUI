<template>
  <div class="barcode-scanner">
    <div class="scanner-status">
      <div v-if="isInitialized" class="status-indicator active">
        <span class="status-dot"></span>
        <span>Scanner Ready</span>
      </div>
      <div v-else class="status-indicator inactive">
        <span class="status-dot"></span>
        <span>Scanner Inactive</span>
      </div>
    </div>

    <div v-if="lastScanned" class="last-scanned">
      <div class="scan-feedback">
        <span class="check-icon">✓</span>
        <span>Last scanned: {{ lastScanned }}</span>
      </div>
    </div>

    <div class="input-section">
      <label for="barcode-input">Barcode</label>
      <input
        id="barcode-input"
        ref="barcodeInput"
        v-model="manualInput"
        type="text"
        placeholder="Scan or type barcode here..."
        @keyup.enter="handleManualSubmit"
        autocomplete="off"
      />
    </div>

    <div class="scanner-info">
      <p>Scan a barcode using your scanner or type manually and press Enter</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBarcodeScanner } from '~/composables/useBarcodeScanner'

interface Emits {
  (e: 'scan', barcode: string): void
}

const emit = defineEmits<Emits>()

const lastScanned = ref<string | null>(null)
const manualInput = ref('')
const barcodeInput = ref<HTMLInputElement | null>(null)

const handleScan = (barcode: string) => {
  lastScanned.value = barcode
  emit('scan', barcode)

  // Clear manual input
  manualInput.value = ''

  // Clear feedback after 2 seconds
  setTimeout(() => {
    lastScanned.value = null
  }, 2000)
}

const handleManualSubmit = () => {
  if (manualInput.value.trim()) {
    handleScan(manualInput.value.trim())
  }
}

const { isInitialized } = useBarcodeScanner({
  onScan: handleScan,
  minLength: 3,
  scanTime: 50,
  preventDefault: true
})
</script>

<style scoped>
.barcode-scanner {
  padding: 1.5rem;
  border: 2px dashed #4CAF50;
  border-radius: 8px;
  background: #f9fdf9;
  margin: 1rem 0;
}

.scanner-status {
  margin-bottom: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
}

.status-indicator.active .status-dot {
  background: #4CAF50;
}

.status-indicator.inactive .status-dot {
  background: #999;
}

.status-indicator.active {
  color: #4CAF50;
}

.status-indicator.inactive {
  color: #999;
}

.last-scanned {
  margin: 1rem 0;
}

.scan-feedback {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #e8f5e9;
  border-radius: 4px;
  color: #2e7d32;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

.check-icon {
  font-size: 1.25rem;
  font-weight: bold;
}

.input-section {
  margin: 1rem 0;
}

.input-section label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.input-section input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #4CAF50;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-section input:focus {
  outline: none;
  border-color: #45a049;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.input-section input::placeholder {
  color: #999;
}

.scanner-info {
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.scanner-info p {
  margin: 0;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
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
