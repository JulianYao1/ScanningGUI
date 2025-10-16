// tests/unit/composables/useScanning.test.ts
// Unit tests for useScanning composable

import { describe, it, expect, beforeEach } from 'vitest'
import { useScanning } from '~/composables/useScanning'
import { BoxStyle, SessionStatus } from '~/types/scanning'
import type { SessionProduct } from '~/types/scanning'

describe('useScanning', () => {
  let scanning: ReturnType<typeof useScanning>

  beforeEach(() => {
    scanning = useScanning()
  })

  describe('createSession', () => {
    it('should create a new session with provided details', () => {
      const session = scanning.createSession('BOX-001', BoxStyle.SmallBox)

      expect(session).toBeDefined()
      expect(session.boxNumber).toBe('BOX-001')
      expect(session.boxStyle).toBe(BoxStyle.SmallBox)
      expect(session.products).toEqual([])
      expect(session.status).toBe(SessionStatus.Active)
      expect(session.id).toBeTruthy()
      expect(session.createdAt).toBeInstanceOf(Date)
      expect(session.updatedAt).toBeInstanceOf(Date)
    })

    it('should add session to sessions array', () => {
      scanning.createSession('BOX-001', BoxStyle.SmallBox)

      expect(scanning.sessions.value.length).toBe(1)
    })

    it('should set currentSessionId to new session', () => {
      const session = scanning.createSession('BOX-001', BoxStyle.SmallBox)

      expect(scanning.currentSessionId.value).toBe(session.id)
    })

    it('should pause previous active session when creating new one', () => {
      const session1 = scanning.createSession('BOX-001', BoxStyle.SmallBox)
      const session2 = scanning.createSession('BOX-002', BoxStyle.MediumBox)

      expect(scanning.sessions.value[0].status).toBe(SessionStatus.Paused)
      expect(scanning.sessions.value[1].status).toBe(SessionStatus.Active)
      expect(scanning.currentSessionId.value).toBe(session2.id)
    })
  })

  describe('addProduct', () => {
    beforeEach(() => {
      scanning.createSession('BOX-001', BoxStyle.SmallBox)
    })

    it('should add new product to session', () => {
      const product: SessionProduct = {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001',
        price: 9.99,
        quantity: 1,
        firstScannedAt: new Date(),
        lastScannedAt: new Date()
      }

      scanning.addProduct(product)

      expect(scanning.currentSession.value?.products.length).toBe(1)
      expect(scanning.currentSession.value?.products[0]).toEqual(product)
    })

    it('should increment quantity for duplicate barcode scans', () => {
      const product: SessionProduct = {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001',
        quantity: 1,
        firstScannedAt: new Date(),
        lastScannedAt: new Date()
      }

      scanning.addProduct(product)
      scanning.addProduct(product)
      scanning.addProduct(product)

      expect(scanning.currentSession.value?.products.length).toBe(1)
      expect(scanning.currentSession.value?.products[0].quantity).toBe(3)
    })

    it('should update lastScannedAt when incrementing quantity', () => {
      const product: SessionProduct = {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001',
        quantity: 1,
        firstScannedAt: new Date(),
        lastScannedAt: new Date()
      }

      scanning.addProduct(product)
      const firstScanTime = scanning.currentSession.value?.products[0].lastScannedAt

      // Wait a bit
      setTimeout(() => {
        scanning.addProduct(product)
        const secondScanTime = scanning.currentSession.value?.products[0].lastScannedAt

        expect(secondScanTime?.getTime()).toBeGreaterThan(firstScanTime?.getTime() || 0)
      }, 10)
    })

    it('should throw error when no active session', () => {
      scanning.clearSession()

      const product: SessionProduct = {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001',
        quantity: 1,
        firstScannedAt: new Date(),
        lastScannedAt: new Date()
      }

      expect(() => scanning.addProduct(product)).toThrow('No active session')
    })

    it('should update session updatedAt timestamp', () => {
      const product: SessionProduct = {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001',
        quantity: 1,
        firstScannedAt: new Date(),
        lastScannedAt: new Date()
      }

      const beforeTime = new Date()
      scanning.addProduct(product)

      expect(scanning.currentSession.value?.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
    })
  })

  describe('switchSession', () => {
    it('should switch to target session', () => {
      const session1 = scanning.createSession('BOX-001', BoxStyle.SmallBox)
      const session2 = scanning.createSession('BOX-002', BoxStyle.MediumBox)

      scanning.switchSession(session1.id)

      expect(scanning.currentSessionId.value).toBe(session1.id)
    })

    it('should pause currently active session when switching', () => {
      const session1 = scanning.createSession('BOX-001', BoxStyle.SmallBox)
      const session2 = scanning.createSession('BOX-002', BoxStyle.MediumBox)

      expect(scanning.sessions.value[1].status).toBe(SessionStatus.Active)

      scanning.switchSession(session1.id)

      expect(scanning.sessions.value[1].status).toBe(SessionStatus.Paused)
    })

    it('should activate paused session when switching to it', () => {
      const session1 = scanning.createSession('BOX-001', BoxStyle.SmallBox)
      const session2 = scanning.createSession('BOX-002', BoxStyle.MediumBox)

      expect(scanning.sessions.value[0].status).toBe(SessionStatus.Paused)

      scanning.switchSession(session1.id)

      expect(scanning.sessions.value[0].status).toBe(SessionStatus.Active)
    })

    it('should throw error for non-existent session', () => {
      expect(() => scanning.switchSession('invalid-id')).toThrow('Session invalid-id not found')
    })
  })

  describe('updateSessionStatus', () => {
    beforeEach(() => {
      scanning.createSession('BOX-001', BoxStyle.SmallBox)
    })

    it('should update session status from active to paused', () => {
      scanning.updateSessionStatus(SessionStatus.Paused)

      expect(scanning.currentSession.value?.status).toBe(SessionStatus.Paused)
    })

    it('should update session status from active to completed', () => {
      scanning.updateSessionStatus(SessionStatus.Completed)

      expect(scanning.currentSession.value?.status).toBe(SessionStatus.Completed)
    })

    it('should update session status from paused to active', () => {
      scanning.updateSessionStatus(SessionStatus.Paused)
      scanning.updateSessionStatus(SessionStatus.Active)

      expect(scanning.currentSession.value?.status).toBe(SessionStatus.Active)
    })

    it('should throw error for invalid transition from completed', () => {
      scanning.updateSessionStatus(SessionStatus.Completed)

      expect(() => scanning.updateSessionStatus(SessionStatus.Active)).toThrow('Invalid status transition')
    })

    it('should update session updatedAt timestamp', () => {
      const beforeTime = new Date()
      scanning.updateSessionStatus(SessionStatus.Paused)

      expect(scanning.currentSession.value?.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
    })
  })

  describe('removeProduct', () => {
    beforeEach(() => {
      scanning.createSession('BOX-001', BoxStyle.SmallBox)
    })

    it('should remove product from session', () => {
      const product: SessionProduct = {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001',
        quantity: 1,
        firstScannedAt: new Date(),
        lastScannedAt: new Date()
      }

      scanning.addProduct(product)
      expect(scanning.currentSession.value?.products.length).toBe(1)

      scanning.removeProduct('123456789012')
      expect(scanning.currentSession.value?.products.length).toBe(0)
    })

    it('should not throw error when removing non-existent product', () => {
      expect(() => scanning.removeProduct('999')).not.toThrow()
    })
  })

  describe('deleteSession', () => {
    it('should remove session from sessions array', () => {
      const session = scanning.createSession('BOX-001', BoxStyle.SmallBox)
      expect(scanning.sessions.value.length).toBe(1)

      scanning.deleteSession(session.id)
      expect(scanning.sessions.value.length).toBe(0)
    })

    it('should clear currentSessionId if deleting active session', () => {
      const session = scanning.createSession('BOX-001', BoxStyle.SmallBox)

      scanning.deleteSession(session.id)
      expect(scanning.currentSessionId.value).toBeNull()
    })
  })

  describe('loadSessions', () => {
    it('should load sessions from array', () => {
      const mockSessions = [
        {
          id: '1',
          boxNumber: 'BOX-001',
          boxStyle: BoxStyle.SmallBox,
          products: [],
          status: SessionStatus.Active,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      scanning.loadSessions(mockSessions)

      expect(scanning.sessions.value.length).toBe(1)
      expect(scanning.currentSessionId.value).toBe('1')
    })

    it('should set current session to active session if one exists', () => {
      const mockSessions = [
        {
          id: '1',
          boxNumber: 'BOX-001',
          boxStyle: BoxStyle.SmallBox,
          products: [],
          status: SessionStatus.Paused,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          boxNumber: 'BOX-002',
          boxStyle: BoxStyle.MediumBox,
          products: [],
          status: SessionStatus.Active,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      scanning.loadSessions(mockSessions)

      expect(scanning.currentSessionId.value).toBe('2')
    })
  })

  describe('clearAllSessions', () => {
    it('should remove all sessions and clear current session', () => {
      scanning.createSession('BOX-001', BoxStyle.SmallBox)
      scanning.createSession('BOX-002', BoxStyle.MediumBox)

      expect(scanning.sessions.value.length).toBe(2)

      scanning.clearAllSessions()

      expect(scanning.sessions.value.length).toBe(0)
      expect(scanning.currentSessionId.value).toBeNull()
    })
  })
})
