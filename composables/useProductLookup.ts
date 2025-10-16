// composables/useProductLookup.ts
// Product lookup composable for fetching product data from API

import type { SessionProduct } from '~/types/scanning'
import type { DatabaseProduct } from '~/server/types/database'

export function useProductLookup() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const lookupProduct = async (barcode: string): Promise<SessionProduct | null> => {
    loading.value = true
    error.value = null

    try {
      const product = await $fetch<DatabaseProduct>(`/api/products/${barcode}`)

      return {
        barcode: product.barcode,
        name: product.name,
        sku: product.sku,
        description: product.description || undefined,
        price: product.price || undefined,
        quantity: 1,
        firstScannedAt: new Date(),
        lastScannedAt: new Date()
      }
    } catch (err: any) {
      if (err.statusCode === 404) {
        error.value = `Product not found: ${barcode}`
        return null // Product not found
      }

      error.value = err.data?.message || 'Unable to lookup product'
      throw err // Re-throw other errors
    } finally {
      loading.value = false
    }
  }

  return {
    lookupProduct,
    loading: readonly(loading),
    error: readonly(error)
  }
}
