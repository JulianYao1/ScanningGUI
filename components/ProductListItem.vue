<template>
  <div class="product-item" data-testid="product-item">
    <div class="product-main">
      <div class="product-info">
        <h3 class="product-name" data-testid="product-name">{{ product.name }}</h3>
        <div class="product-meta">
          <span class="product-sku">SKU: {{ product.sku }}</span>
          <span class="product-barcode">Barcode: {{ product.barcode }}</span>
        </div>
        <p v-if="product.description" class="product-description">
          {{ product.description }}
        </p>
      </div>

      <div class="product-quantity">
        <span class="quantity-label">Quantity</span>
        <span class="quantity-value" data-testid="product-quantity">{{ product.quantity }}</span>
      </div>
    </div>

    <div v-if="product.price" class="product-pricing">
      <div class="price-item">
        <span class="price-label">Unit Price:</span>
        <span class="price-value">${{ product.price.toFixed(2) }}</span>
      </div>
      <div class="price-item total">
        <span class="price-label">Total:</span>
        <span class="price-value">${{ (product.price * product.quantity).toFixed(2) }}</span>
      </div>
    </div>

    <div class="product-timestamps">
      <span class="timestamp">First scanned: {{ formatTime(product.firstScannedAt) }}</span>
      <span v-if="product.quantity > 1" class="timestamp">
        Last scanned: {{ formatTime(product.lastScannedAt) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SessionProduct } from '~/types/scanning'

interface Props {
  product: SessionProduct
}

const props = defineProps<Props>()

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date)
}
</script>

<style scoped>
.product-item {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  margin-bottom: 0.75rem;
  transition: box-shadow 0.2s;
}

.product-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.product-info {
  flex: 1;
}

.product-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: #333;
}

.product-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.product-description {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #777;
}

.product-quantity {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #e3f2fd;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  min-width: 80px;
}

.quantity-label {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.quantity-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1976d2;
}

.product-pricing {
  display: flex;
  gap: 2rem;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.price-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.price-item.total {
  font-weight: 600;
}

.price-label {
  color: #666;
  font-size: 0.875rem;
}

.price-value {
  color: #333;
  font-size: 1rem;
}

.product-timestamps {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #999;
}

.timestamp {
  display: block;
}
</style>
