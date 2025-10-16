// tests/unit/utils/csvFormatter.test.ts
// Unit tests for CSV formatting utilities

import { describe, it, expect } from 'vitest'
import {
  escapeCsvField,
  formatPrice,
  sessionToCsvRows,
  generateCsv,
  generateFilename
} from '~/utils/csvFormatter'
import { BoxStyle, SessionStatus } from '~/types/scanning'
import type { ScanningSession } from '~/types/scanning'

describe('csvFormatter', () => {
  describe('escapeCsvField', () => {
    it('should return string as-is if no special characters', () => {
      expect(escapeCsvField('Simple Text')).toBe('Simple Text')
    })

    it('should wrap in quotes if contains comma', () => {
      expect(escapeCsvField('Text, with comma')).toBe('"Text, with comma"')
    })

    it('should wrap in quotes if contains double quote', () => {
      expect(escapeCsvField('Text "quoted"')).toBe('"Text ""quoted"""')
    })

    it('should double internal quotes', () => {
      expect(escapeCsvField('Say "hello"')).toBe('"Say ""hello"""')
    })

    it('should wrap in quotes if contains newline', () => {
      expect(escapeCsvField('Line1\nLine2')).toBe('"Line1\nLine2"')
    })

    it('should wrap in quotes if contains carriage return', () => {
      expect(escapeCsvField('Line1\rLine2')).toBe('"Line1\rLine2"')
    })

    it('should handle numbers', () => {
      expect(escapeCsvField(123)).toBe('123')
    })

    it('should handle numbers with commas in string form', () => {
      expect(escapeCsvField('1,234.56')).toBe('"1,234.56"')
    })

    it('should handle empty string', () => {
      expect(escapeCsvField('')).toBe('')
    })

    it('should handle multiple special characters', () => {
      expect(escapeCsvField('Text, with "quotes" and\nnewlines')).toBe(
        '"Text, with ""quotes"" and\nnewlines"'
      )
    })
  })

  describe('formatPrice', () => {
    it('should format price with 2 decimal places', () => {
      expect(formatPrice(9.99)).toBe('9.99')
    })

    it('should format whole numbers with .00', () => {
      expect(formatPrice(10)).toBe('10.00')
    })

    it('should round to 2 decimal places', () => {
      expect(formatPrice(9.999)).toBe('10.00')
    })

    it('should return empty string for undefined', () => {
      expect(formatPrice(undefined)).toBe('')
    })

    it('should return empty string for null', () => {
      expect(formatPrice(null as any)).toBe('')
    })

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('0.00')
    })

    it('should handle negative prices', () => {
      expect(formatPrice(-5.99)).toBe('-5.99')
    })

    it('should handle very small prices', () => {
      expect(formatPrice(0.01)).toBe('0.01')
    })

    it('should handle large prices', () => {
      expect(formatPrice(1234567.89)).toBe('1234567.89')
    })
  })

  describe('sessionToCsvRows', () => {
    it('should convert session with products to CSV rows', () => {
      const session: ScanningSession = {
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
      }

      const rows = sessionToCsvRows(session)

      expect(rows).toHaveLength(1)
      expect(rows[0]).toEqual({
        boxNumber: 'BOX-001',
        boxStyle: 'Small Box',
        barcode: '123456789012',
        productName: 'Test Product',
        sku: 'TEST-001',
        quantity: 2,
        unitPrice: '9.99',
        totalPrice: '19.98'
      })
    })

    it('should handle products without prices', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
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

      const rows = sessionToCsvRows(session)

      expect(rows[0].unitPrice).toBe('')
      expect(rows[0].totalPrice).toBe('')
    })

    it('should calculate total price correctly', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: [
          {
            barcode: '123456789012',
            name: 'Test Product',
            sku: 'TEST-001',
            quantity: 3,
            price: 10.50,
            firstScannedAt: new Date(),
            lastScannedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const rows = sessionToCsvRows(session)

      expect(rows[0].totalPrice).toBe('31.50')
    })

    it('should handle multiple products', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
        boxStyle: BoxStyle.MediumBox,
        status: 'active' as SessionStatus,
        products: [
          {
            barcode: '111',
            name: 'Product 1',
            sku: 'SKU-1',
            quantity: 1,
            price: 5.00,
            firstScannedAt: new Date(),
            lastScannedAt: new Date()
          },
          {
            barcode: '222',
            name: 'Product 2',
            sku: 'SKU-2',
            quantity: 2,
            price: 10.00,
            firstScannedAt: new Date(),
            lastScannedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const rows = sessionToCsvRows(session)

      expect(rows).toHaveLength(2)
    })
  })

  describe('generateCsv', () => {
    it('should generate CSV with header and data rows', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: [
          {
            barcode: '123456789012',
            name: 'Test Product',
            sku: 'TEST-001',
            quantity: 1,
            price: 9.99,
            firstScannedAt: new Date(),
            lastScannedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const csv = generateCsv(session)

      expect(csv).toContain('Box Number,Box Style,Barcode,Product Name,SKU,Quantity,Unit Price,Total Price')
      expect(csv).toContain('BOX-001,Small Box,123456789012,Test Product,TEST-001,1,9.99,9.99')
    })

    it('should include UTF-8 BOM for Excel compatibility', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const csv = generateCsv(session)

      expect(csv.charCodeAt(0)).toBe(0xFEFF) // UTF-8 BOM
    })

    it('should properly escape product names with commas', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: [
          {
            barcode: '123456789012',
            name: 'Product, with comma',
            sku: 'TEST-001',
            quantity: 1,
            firstScannedAt: new Date(),
            lastScannedAt: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const csv = generateCsv(session)

      expect(csv).toContain('"Product, with comma"')
    })

    it('should handle empty product list', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const csv = generateCsv(session)
      const lines = csv.split('\n')

      // Should have BOM + header only (1 line after removing BOM)
      expect(lines.length).toBe(1)
      expect(csv).toContain('Box Number,Box Style,Barcode,Product Name,SKU,Quantity,Unit Price,Total Price')
    })
  })

  describe('generateFilename', () => {
    it('should generate filename with box number and timestamp', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const filename = generateFilename(session)

      expect(filename).toMatch(/^picklist_BOX-001_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.csv$/)
    })

    it('should sanitize box number with special characters', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX/001*TEST',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const filename = generateFilename(session)

      expect(filename).toContain('BOX_001_TEST')
      expect(filename).not.toContain('/')
      expect(filename).not.toContain('*')
    })

    it('should always end with .csv extension', () => {
      const session: ScanningSession = {
        id: '1',
        boxNumber: 'BOX-001',
        boxStyle: BoxStyle.SmallBox,
        status: 'active' as SessionStatus,
        products: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const filename = generateFilename(session)

      expect(filename).toMatch(/\.csv$/)
    })
  })
})
