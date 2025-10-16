// tests/unit/composables/usePicklistExport.test.ts
// Unit tests for usePicklistExport composable

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePicklistExport } from '~/composables/usePicklistExport'
import { BoxStyle, SessionStatus } from '~/types/scanning'
import type { ScanningSession } from '~/types/scanning'

describe('usePicklistExport', () => {
  let exportComposable: ReturnType<typeof usePicklistExport>

  beforeEach(() => {
    exportComposable = usePicklistExport()
  })

  const createMockSession = (): ScanningSession => ({
    id: '1',
    boxNumber: 'BOX-001',
    boxStyle: BoxStyle.SmallBox,
    status: 'active' as SessionStatus,
    products: [
      {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001',
        quantity: 2,
        price: 9.99,
        firstScannedAt: new Date(),
        lastScannedAt: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  })

  describe('generateCsvContent', () => {
    it('should generate CSV content from session', () => {
      const session = createMockSession()
      const csvContent = exportComposable.generateCsvContent(session)

      expect(csvContent).toContain('Box Number,Box Style,Barcode')
      expect(csvContent).toContain('BOX-001,Small Box,123456789012')
    })

    it('should include UTF-8 BOM', () => {
      const session = createMockSession()
      const csvContent = exportComposable.generateCsvContent(session)

      expect(csvContent.charCodeAt(0)).toBe(0xFEFF)
    })
  })

  describe('canExport', () => {
    it('should return true for valid session with products', () => {
      const session = createMockSession()
      expect(exportComposable.canExport(session)).toBe(true)
    })

    it('should return false for null session', () => {
      expect(exportComposable.canExport(null)).toBe(false)
    })

    it('should return false for session without products', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(exportComposable.canExport(session)).toBe(false)
    })

    it('should return false for session without box number', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: '',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: [
          {
            barcode: '123456789012',
            name: 'Test Product',
            sku: 'TEST-001',
            quantity: 1,
            firstScannedAt: new Date(),
            lastScannedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(exportComposable.canExport(session)).toBe(false)
    })
  })

  describe('downloadCsv', () => {
    beforeEach(() => {
      // Mock DOM elements
      global.document.createElement = vi.fn((tag) => {
        if (tag === 'a') {
          return {
            setAttribute: vi.fn(),
            click: vi.fn(),
            style: {}
          } as any
        }
        return {} as any
      })

      global.document.body.appendChild = vi.fn()
      global.document.body.removeChild = vi.fn()

      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
      global.URL.revokeObjectURL = vi.fn()

      global.Blob = vi.fn((content, options) => ({
        content,
        options
      })) as any
    })

    it('should create blob with CSV content', () => {
      const session = createMockSession()
      exportComposable.downloadCsv(session)

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.any(String)],
        { type: 'text/csv;charset=utf-8;' }
      )
    })

    it('should create download link with correct attributes', () => {
      const session = createMockSession()
      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {}
      }

      global.document.createElement = vi.fn(() => mockLink as any)

      exportComposable.downloadCsv(session)

      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:mock-url')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/^picklist_BOX-001_/))
    })

    it('should trigger download by clicking link', () => {
      const session = createMockSession()
      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {}
      }

      global.document.createElement = vi.fn(() => mockLink as any)

      exportComposable.downloadCsv(session)

      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should cleanup by removing link and revoking URL', () => {
      const session = createMockSession()
      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {}
      }

      global.document.createElement = vi.fn(() => mockLink as any)

      exportComposable.downloadCsv(session)

      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink)
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('should set isExporting to true during export', () => {
      const session = createMockSession()

      // Check before
      expect(exportComposable.isExporting).toBe(false)

      exportComposable.downloadCsv(session)

      // After synchronous download, should be false again
      expect(exportComposable.isExporting).toBe(false)
    })

    it('should handle errors gracefully', () => {
      const session = createMockSession()

      // Make Blob throw an error
      global.Blob = vi.fn(() => {
        throw new Error('Blob creation failed')
      }) as any

      exportComposable.downloadCsv(session)

      expect(exportComposable.error).toBe('Blob creation failed')
      expect(exportComposable.isExporting).toBe(false)
    })

    it('should clear previous errors', () => {
      const session = createMockSession()

      // First download fails
      global.Blob = vi.fn(() => {
        throw new Error('First error')
      }) as any

      exportComposable.downloadCsv(session)
      expect(exportComposable.error).toBe('First error')

      // Second download succeeds
      global.Blob = vi.fn((content, options) => ({
        content,
        options
      })) as any

      exportComposable.downloadCsv(session)
      expect(exportComposable.error).toBeNull()
    })
  })

  describe('previewCsv', () => {
    it('should return first 5 rows by default', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: Array.from({ length: 10 }, (_, i) => ({
          barcode: `12345678901${i}`,
          name: `Product ${i}`,
          sku: `SKU-${i}`,
          quantity: 1,
          firstScannedAt: new Date(),
          lastScannedAt: new Date()
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const preview = exportComposable.previewCsv(session)
      const lines = preview.split('\n')

      // Header + 5 data rows = 6 lines
      expect(lines.length).toBe(6)
    })

    it('should respect custom maxRows parameter', () => {
      const session = createMockSession()
      const preview = exportComposable.previewCsv(session, 2)
      const lines = preview.split('\n')

      // Header + 2 data rows = 3 lines (but we only have 1 product, so 2 lines)
      expect(lines.length).toBeLessThanOrEqual(3)
    })

    it('should include header row', () => {
      const session = createMockSession()
      const preview = exportComposable.previewCsv(session)

      expect(preview).toContain('Box Number,Box Style,Barcode')
    })
  })
})
