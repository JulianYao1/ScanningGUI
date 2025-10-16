// composables/useScanning.ts
// Scanning session state management composable

import type { ScanningSession, SessionProduct, BoxStyle } from '~/types/scanning'
import { SessionStatus } from '~/types/scanning'
import { v4 as uuidv4 } from 'uuid'

export function useScanning() {
  // Multiple sessions support (T032)
  const sessions = ref<ScanningSession[]>([])
  const currentSessionId = ref<string | null>(null)

  // Computed property for current session
  const currentSession = computed(() => {
    if (!currentSessionId.value) return null
    return sessions.value.find(s => s.id === currentSessionId.value) || null
  })

  const createSession = (boxNumber: string, boxStyle: BoxStyle) => {
    // Pause currently active session if exists (T033)
    if (currentSessionId.value) {
      const activeSession = sessions.value.find(s => s.id === currentSessionId.value)
      if (activeSession && activeSession.status === SessionStatus.Active) {
        activeSession.status = SessionStatus.Paused
        activeSession.updatedAt = new Date()
      }
    }

    const session: ScanningSession = {
      id: uuidv4(),
      boxNumber,
      boxStyle,
      products: [],
      status: SessionStatus.Active,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    sessions.value.push(session)
    currentSessionId.value = session.id
    return session
  }

  const switchSession = (sessionId: string) => {
    const targetSession = sessions.value.find(s => s.id === sessionId)
    if (!targetSession) {
      throw new Error(`Session ${sessionId} not found`)
    }

    // Pause currently active session (T033)
    if (currentSessionId.value) {
      const activeSession = sessions.value.find(s => s.id === currentSessionId.value)
      if (activeSession && activeSession.status === SessionStatus.Active) {
        activeSession.status = SessionStatus.Paused
        activeSession.updatedAt = new Date()
      }
    }

    // Activate target session (T033)
    if (targetSession.status === SessionStatus.Paused) {
      targetSession.status = SessionStatus.Active
      targetSession.updatedAt = new Date()
    }

    currentSessionId.value = sessionId
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

    // Status transition validation (T033)
    const validTransitions: Record<SessionStatus, SessionStatus[]> = {
      [SessionStatus.Active]: [SessionStatus.Paused, SessionStatus.Completed],
      [SessionStatus.Paused]: [SessionStatus.Active, SessionStatus.Completed],
      [SessionStatus.Completed]: [] // Cannot transition from completed
    }

    const currentStatus = currentSession.value.status
    if (!validTransitions[currentStatus].includes(status)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${status}`)
    }

    currentSession.value.status = status
    currentSession.value.updatedAt = new Date()
  }

  const deleteSession = (sessionId: string) => {
    sessions.value = sessions.value.filter(s => s.id !== sessionId)

    // If deleted session was active, clear current session
    if (currentSessionId.value === sessionId) {
      currentSessionId.value = null
    }
  }

  const clearSession = () => {
    currentSessionId.value = null
  }

  const clearAllSessions = () => {
    sessions.value = []
    currentSessionId.value = null
  }

  const loadSessions = (loadedSessions: ScanningSession[]) => {
    sessions.value = loadedSessions

    // Set current session to the most recently active one
    const activeSession = loadedSessions.find(s => s.status === SessionStatus.Active)
    if (activeSession) {
      currentSessionId.value = activeSession.id
    } else if (loadedSessions.length > 0) {
      currentSessionId.value = loadedSessions[0].id
    }
  }

  return {
    sessions: readonly(sessions),
    currentSession,
    currentSessionId: readonly(currentSessionId),
    createSession,
    switchSession,
    addProduct,
    removeProduct,
    updateSessionStatus,
    deleteSession,
    clearSession,
    clearAllSessions,
    loadSessions
  }
}
