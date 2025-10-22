// composables/useBarcodeScanner.ts
// Barcode scanner integration composable using onscan.js

import onScan from 'onscan.js'

export interface BarcodeScannerOptions {
  onScan: (barcode: string) => void
  minLength?: number
  scanTime?: number
  preventDefault?: boolean
}

export function useBarcodeScanner(options: BarcodeScannerOptions) {
  const isInitialized = ref(false)

  const initializeScanner = () => {
    if (isInitialized.value) return

    onScan.attachTo(document, {
      onScan: (sCode: string) => {
        options.onScan(sCode)
      },
      minLength: options.minLength || 3,
      timeBeforeScanTest: options.scanTime || 50,
      preventDefault: options.preventDefault !== false,
      onKeyDetect: (iKeyCode: number) => {
        // Debug: Log key detection if needed
        // console.log('Key detected:', iKeyCode)
      },
      // Allow typing in input/textarea/select elements
      ignoreIfFocusOn: 'input,textarea,select'
    })

    isInitialized.value = true
  }

  const detachScanner = () => {
    if (!isInitialized.value) return

    onScan.detachFrom(document)
    isInitialized.value = false
  }

  onMounted(() => {
    initializeScanner()
  })

  onBeforeUnmount(() => {
    detachScanner()
  })

  return {
    isInitialized: readonly(isInitialized),
    initializeScanner,
    detachScanner
  }
}
