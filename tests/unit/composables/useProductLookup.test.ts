// tests/unit/composables/useProductLookup.test.ts
// Unit tests for useProductLookup composable

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProductLookup } from '~/composables/useProductLookup'

describe('useProductLookup', () => {
  let productLookup: ReturnType<typeof useProductLookup>

  beforeEach(() => {
    productLookup = useProductLookup()
    vi.clearAllMocks()
  })

  describe('lookupProduct', () => {
    it('should fetch product successfully', async () => {
      const mockProduct = {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'A test product',
        price: 9.99
      }

      // Mock $fetch
      global.$fetch = vi.fn().mockResolvedValue(mockProduct)

      const result = await productLookup.lookupProduct('123456789012')

      expect(result).toEqual({
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001',
        description: 'A test product',
        price: 9.99,
        quantity: 1,
        firstScannedAt: expect.any(Date),
        lastScannedAt: expect.any(Date)
      })

      expect(global.$fetch).toHaveBeenCalledWith('/api/products/123456789012')
    })

    it('should set loading to true while fetching', async () => {
      global.$fetch = vi.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve({
          barcode: '123456789012',
          name: 'Test Product',
          sku: 'TEST-001'
        }), 100))
      })

      const promise = productLookup.lookupProduct('123456789012')
      expect(productLookup.loading).toBe(true)

      await promise
      expect(productLookup.loading).toBe(false)
    })

    it('should set loading to false after fetch completes', async () => {
      global.$fetch = vi.fn().mockResolvedValue({
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001'
      })

      await productLookup.lookupProduct('123456789012')

      expect(productLookup.loading).toBe(false)
    })

    it('should handle 404 errors gracefully', async () => {
      global.$fetch = vi.fn().mockRejectedValue({
        statusCode: 404,
        data: { message: 'Product not found' }
      })

      const result = await productLookup.lookupProduct('999999999999')

      expect(result).toBeNull()
      expect(productLookup.error).toBe('Product not found: 999999999999')
    })

    it('should return null and set error for 404', async () => {
      global.$fetch = vi.fn().mockRejectedValue({
        statusCode: 404,
        data: { message: 'Not found' }
      })

      const result = await productLookup.lookupProduct('123456789012')

      expect(result).toBeNull()
      expect(productLookup.error).not.toBeNull()
    })

    it('should throw error for non-404 errors', async () => {
      const mockError = {
        statusCode: 500,
        data: { message: 'Internal server error' }
      }

      global.$fetch = vi.fn().mockRejectedValue(mockError)

      await expect(productLookup.lookupProduct('123456789012')).rejects.toEqual(mockError)
    })

    it('should set error message for network errors', async () => {
      global.$fetch = vi.fn().mockRejectedValue({
        statusCode: 500,
        data: { message: 'Database connection failed' }
      })

      try {
        await productLookup.lookupProduct('123456789012')
      } catch (err) {
        expect(productLookup.error).toBe('Database connection failed')
      }
    })

    it('should handle missing optional fields', async () => {
      const mockProduct = {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001'
        // No description or price
      }

      global.$fetch = vi.fn().mockResolvedValue(mockProduct)

      const result = await productLookup.lookupProduct('123456789012')

      expect(result?.description).toBeUndefined()
      expect(result?.price).toBeUndefined()
    })

    it('should set quantity to 1 for new products', async () => {
      const mockProduct = {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001'
      }

      global.$fetch = vi.fn().mockResolvedValue(mockProduct)

      const result = await productLookup.lookupProduct('123456789012')

      expect(result?.quantity).toBe(1)
    })

    it('should set firstScannedAt and lastScannedAt timestamps', async () => {
      const mockProduct = {
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001'
      }

      global.$fetch = vi.fn().mockResolvedValue(mockProduct)

      const result = await productLookup.lookupProduct('123456789012')

      expect(result?.firstScannedAt).toBeInstanceOf(Date)
      expect(result?.lastScannedAt).toBeInstanceOf(Date)
    })

    it('should clear previous error on new lookup', async () => {
      // First lookup fails
      global.$fetch = vi.fn().mockRejectedValue({
        statusCode: 404,
        data: { message: 'Not found' }
      })

      await productLookup.lookupProduct('999999999999')
      expect(productLookup.error).not.toBeNull()

      // Second lookup succeeds
      global.$fetch = vi.fn().mockResolvedValue({
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001'
      })

      await productLookup.lookupProduct('123456789012')
      expect(productLookup.error).toBeNull()
    })

    it('should set loading to false even if error occurs', async () => {
      global.$fetch = vi.fn().mockRejectedValue({
        statusCode: 404,
        data: { message: 'Not found' }
      })

      await productLookup.lookupProduct('999999999999')

      expect(productLookup.loading).toBe(false)
    })

    it('should use default error message if no message provided', async () => {
      global.$fetch = vi.fn().mockRejectedValue({
        statusCode: 500
        // No data or message
      })

      try {
        await productLookup.lookupProduct('123456789012')
      } catch (err) {
        expect(productLookup.error).toBe('Unable to lookup product')
      }
    })
  })
})
