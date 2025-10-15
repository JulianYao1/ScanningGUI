// composables/useScanning.ts
// Scanning session state management composable

import type { ScanningSession, SessionProduct, SessionStatus, BoxStyle } from '~/types/scanning'
import { v4 as uuidv4 } from 'uuid'

export function useScanning() {
  const currentSession = ref<ScanningSession | null>(null)

  const createSession = (boxNumber: string, boxStyle: BoxStyle) => {
    const session: ScanningSession = {
      id: uuidv4(),
      boxNumber,
      boxStyle,
      products: [],
      status: 'active' as SessionStatus,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    currentSession.value = session
    return session
  }

  const addProduct = (product: SessionProduct) => {
    if (!currentSession.value) {
      throw new Error('No active session')
    }

    const existingProductIndex = currentSession.value.products.findIndex(
      p => p.barcode === product.barcode
    )

    if (existingProductIndex >= 0) {
      // Increment quantity for existing product
      currentSession.value.products[existingProductIndex].quantity++
      currentSession.value.products[existingProductIndex].lastScannedAt = new Date()
    } else {
      // Add new product
      currentSession.value.products.push(product)
    }

    currentSession.value.updatedAt = new Date()
  }

  const removeProduct = (barcode: string) => {
    if (!currentSession.value) return

    currentSession.value.products = currentSession.value.products.filter(
      p => p.barcode !== barcode
    )
    currentSession.value.updatedAt = new Date()
  }

  const updateSessionStatus = (status: SessionStatus) => {
    if (!currentSession.value) return

    currentSession.value.status = status
    currentSession.value.updatedAt = new Date()
  }

  const clearSession = () => {
    currentSession.value = null
  }

  return {
    currentSession: readonly(currentSession),
    createSession,
    addProduct,
    removeProduct,
    updateSessionStatus,
    clearSession
  }
}
