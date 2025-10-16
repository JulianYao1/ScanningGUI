<template>
  <div class="product-list">
    <div class="list-header">
      <h2>Scanned Products</h2>
      <div v-if="products.length > 0" class="list-summary">
        <span class="summary-item">
          <strong>{{ products.length }}</strong> unique item{{ products.length === 1 ? '' : 's' }}
        </span>
        <span class="summary-item">
          <strong>{{ totalQuantity }}</strong> total unit{{ totalQuantity === 1 ? '' : 's' }}
        </span>
        <span v-if="totalPrice > 0" class="summary-item total-price">
          Total: <strong>${{ totalPrice.toFixed(2) }}</strong>
        </span>
      </div>
    </div>

    <div v-if="products.length === 0" class="empty-state">
      <p>No products scanned yet</p>
      <p class="empty-hint">Scan a barcode to get started</p>
    </div>

    <div v-else class="list-items">
      <ProductListItem
        v-for="product in products"
        :key="product.barcode"
        :product="product"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SessionProduct } from '~/types/scanning'
import ProductListItem from './ProductListItem.vue'

interface Props {
  products: SessionProduct[]
}

const props = defineProps<Props>()

const totalQuantity = computed(() => {
  return props.products.reduce((sum, product) => sum + product.quantity, 0)
})

const totalPrice = computed(() => {
  return props.products.reduce((sum, product) => {
    if (product.price) {
      return sum + (product.price * product.quantity)
    }
    return sum
  }, 0)
})
</script>

<style scoped>
.product-list {
  margin-top: 2rem;
}

.list-header {
  margin-bottom: 1.5rem;
}

.list-header h2 {
  margin: 0 0 0.75rem 0;
  color: #333;
  font-size: 1.5rem;
}

.list-summary {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.summary-item {
  color: #666;
  font-size: 0.9rem;
}

.summary-item strong {
  color: #333;
  font-size: 1rem;
}

.summary-item.total-price {
  margin-left: auto;
  font-size: 1rem;
}

.summary-item.total-price strong {
  font-size: 1.25rem;
  color: #4CAF50;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #999;
}

.empty-state p {
  margin: 0.5rem 0;
}

.empty-state p:first-child {
  font-size: 1.125rem;
  font-weight: 500;
}

.empty-hint {
  font-size: 0.875rem;
}

.list-items {
  /* Container for product items */
}
</style>
