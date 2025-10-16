// tests/unit/utils/barcodeValidator.test.ts
// Unit tests for barcode validation utilities

import { describe, it, expect } from 'vitest'
import { isValidBarcode, sanitizeBarcode } from '~/utils/barcodeValidator'

describe('barcodeValidator', () => {
  describe('isValidBarcode', () => {
    describe('UPC-A format (12 digits)', () => {
      it('should accept valid UPC-A barcode', () => {
        expect(isValidBarcode('123456789012')).toBe(true)
      })

      it('should accept UPC-A with leading zeros', () => {
        expect(isValidBarcode('000000000001')).toBe(true)
      })
    })

    describe('EAN-13 format (13 digits)', () => {
      it('should accept valid EAN-13 barcode', () => {
        expect(isValidBarcode('1234567890123')).toBe(true)
      })

      it('should accept EAN-13 with leading zeros', () => {
        expect(isValidBarcode('0000000000001')).toBe(true)
      })
    })

    describe('Code128 format (3-50 alphanumeric)', () => {
      it('should accept valid Code128 barcode with letters', () => {
        expect(isValidBarcode('ABC123')).toBe(true)
      })

      it('should accept Code128 with hyphens', () => {
        expect(isValidBarcode('PROD-123-ABC')).toBe(true)
      })

      it('should accept Code128 with underscores', () => {
        expect(isValidBarcode('PROD_123_ABC')).toBe(true)
      })

      it('should accept minimum length Code128 (3 chars)', () => {
        expect(isValidBarcode('ABC')).toBe(true)
      })

      it('should accept maximum length Code128 (50 chars)', () => {
        const longBarcode = 'A'.repeat(50)
        expect(isValidBarcode(longBarcode)).toBe(true)
      })

      it('should reject Code128 longer than 50 chars', () => {
        const tooLongBarcode = 'A'.repeat(51)
        expect(isValidBarcode(tooLongBarcode)).toBe(false)
      })

      it('should reject Code128 shorter than 3 chars', () => {
        expect(isValidBarcode('AB')).toBe(false)
      })
    })

    describe('Invalid formats', () => {
      it('should reject empty string', () => {
        expect(isValidBarcode('')).toBe(false)
      })

      it('should reject null', () => {
        expect(isValidBarcode(null as any)).toBe(false)
      })

      it('should reject undefined', () => {
        expect(isValidBarcode(undefined as any)).toBe(false)
      })

      it('should reject non-string values', () => {
        expect(isValidBarcode(123 as any)).toBe(false)
      })

      it('should reject barcode with special characters', () => {
        expect(isValidBarcode('ABC@123')).toBe(false)
      })

      it('should reject barcode with spaces', () => {
        expect(isValidBarcode('ABC 123')).toBe(false)
      })

      it('should reject 11-digit barcode (between UPC and EAN)', () => {
        expect(isValidBarcode('12345678901')).toBe(false)
      })

      it('should reject 14-digit barcode (too long for EAN)', () => {
        expect(isValidBarcode('12345678901234')).toBe(false)
      })
    })

    describe('Whitespace handling', () => {
      it('should accept barcode with leading whitespace', () => {
        expect(isValidBarcode('  123456789012')).toBe(true)
      })

      it('should accept barcode with trailing whitespace', () => {
        expect(isValidBarcode('123456789012  ')).toBe(true)
      })

      it('should accept barcode with both leading and trailing whitespace', () => {
        expect(isValidBarcode('  123456789012  ')).toBe(true)
      })
    })
  })

  describe('sanitizeBarcode', () => {
    it('should trim leading whitespace', () => {
      expect(sanitizeBarcode('  ABC123')).toBe('ABC123')
    })

    it('should trim trailing whitespace', () => {
      expect(sanitizeBarcode('ABC123  ')).toBe('ABC123')
    })

    it('should trim both leading and trailing whitespace', () => {
      expect(sanitizeBarcode('  ABC123  ')).toBe('ABC123')
    })

    it('should convert to uppercase', () => {
      expect(sanitizeBarcode('abc123')).toBe('ABC123')
    })

    it('should handle mixed case', () => {
      expect(sanitizeBarcode('aBc123XyZ')).toBe('ABC123XYZ')
    })

    it('should handle already sanitized input', () => {
      expect(sanitizeBarcode('ABC123')).toBe('ABC123')
    })

    it('should handle numeric-only barcodes', () => {
      expect(sanitizeBarcode('123456789012')).toBe('123456789012')
    })

    it('should handle empty string', () => {
      expect(sanitizeBarcode('')).toBe('')
    })

    it('should preserve hyphens and underscores', () => {
      expect(sanitizeBarcode('prod-123_abc')).toBe('PROD-123_ABC')
    })
  })
})
