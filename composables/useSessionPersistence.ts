// composables/useSessionPersistence.ts
// Session persistence composable using localStorage

import type { ScanningSession } from '~/types/scanning'

const STORAGE_KEY = 'picklist-sessions'
const STORAGE_VERSION = 1

interface StoredSessions {
  version: number
  sessions: ScanningSession[]
  lastUpdated: string
}

export function useSessionPersistence() {
  const saveSession = (session: ScanningSession) => {
    try {
      const stored = loadAllSessions()
      const existingIndex = stored.sessions.findIndex(s => s.id === session.id)

      if (existingIndex >= 0) {
        stored.sessions[existingIndex] = session
      } else {
        stored.sessions.push(session)
      }

      stored.lastUpdated = new Date().toISOString()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch (error) {
      console.error('Failed to save session:', error)
      throw new Error('STORAGE_FULL')
    }
  }

  const loadSession = (sessionId: string): ScanningSession | null => {
    const stored = loadAllSessions()
    const session = stored.sessions.find(s => s.id === sessionId)

    if (!session) return null

    // Convert date strings back to Date objects
    return {
      ...session,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      products: session.products.map(p => ({
        ...p,
        firstScannedAt: new Date(p.firstScannedAt),
        lastScannedAt: new Date(p.lastScannedAt)
      }))
    }
  }

  const loadAllSessions = (): StoredSessions => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)

      if (!data) {
        return {
          version: STORAGE_VERSION,
          sessions: [],
          lastUpdated: new Date().toISOString()
        }
      }

      const parsed = JSON.parse(data)

      // Handle version migrations if needed
      if (!parsed.version) {
        return {
          version: STORAGE_VERSION,
          sessions: parsed.sessions || [],
          lastUpdated: new Date().toISOString()
        }
      }

      return parsed
    } catch (error) {
      console.error('Failed to load sessions:', error)
      return {
        version: STORAGE_VERSION,
        sessions: [],
        lastUpdated: new Date().toISOString()
      }
    }
  }

  const deleteSession = (sessionId: string) => {
    try {
      const stored = loadAllSessions()
      stored.sessions = stored.sessions.filter(s => s.id !== sessionId)
      stored.lastUpdated = new Date().toISOString()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch (error) {
      console.error('Failed to delete session:', error)
    }
  }

  const clearAllSessions = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear sessions:', error)
    }
  }

  return {
    saveSession,
    loadSession,
    loadAllSessions,
    deleteSession,
    clearAllSessions
  }
}
