// tests/component/ProductList.test.ts
// Component tests for ProductList

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductList from '~/components/ProductList.vue'
import type { SessionProduct } from '~/types/scanning'

describe('ProductList', () => {
  const createMockProduct = (overrides = {}): SessionProduct => ({
    barcode: '123456789012',
    name: 'Test Product',
    sku: 'TEST-001',
    quantity: 1,
    price: 9.99,
    firstScannedAt: new Date(),
    lastScannedAt: new Date(),
    ...overrides
  })

  it('should render the component', () => {
    const wrapper = mount(ProductList, {
      props: {
        products: []
      }
    })

    expect(wrapper.find('.product-list').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Scanned Products')
  })

  it('should show empty state when no products', () => {
    const wrapper = mount(ProductList, {
      props: {
        products: []
      }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No products scanned yet')
    expect(wrapper.text()).toContain('Scan a barcode to get started')
  })

  it('should not show empty state when products exist', () => {
    const wrapper = mount(ProductList, {
      props: {
        products: [createMockProduct()]
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('should render ProductListItem for each product', () => {
    const products = [
      createMockProduct({ barcode: '111' }),
      createMockProduct({ barcode: '222' }),
      createMockProduct({ barcode: '333' })
    ]

    const wrapper = mount(ProductList, {
      props: {
        products
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    const items = wrapper.findAllComponents({ name: 'ProductListItem' })
    expect(items).toHaveLength(3)
  })

  it('should display total unique items count', () => {
    const products = [
      createMockProduct({ barcode: '111' }),
      createMockProduct({ barcode: '222' }),
      createMockProduct({ barcode: '333' })
    ]

    const wrapper = mount(ProductList, {
      props: {
        products
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    expect(wrapper.text()).toContain('3 unique items')
  })

  it('should use singular form for 1 unique item', () => {
    const wrapper = mount(ProductList, {
      props: {
        products: [createMockProduct()]
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    expect(wrapper.text()).toContain('1 unique item')
    expect(wrapper.text()).not.toContain('items')
  })

  it('should calculate total quantity correctly', () => {
    const products = [
      createMockProduct({ barcode: '111', quantity: 2 }),
      createMockProduct({ barcode: '222', quantity: 3 }),
      createMockProduct({ barcode: '333', quantity: 1 })
    ]

    const wrapper = mount(ProductList, {
      props: {
        products
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    expect(wrapper.text()).toContain('6 total units')
  })

  it('should use singular form for 1 total unit', () => {
    const wrapper = mount(ProductList, {
      props: {
        products: [createMockProduct({ quantity: 1 })]
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    expect(wrapper.text()).toContain('1 total unit')
    expect(wrapper.text()).not.toMatch(/1 total units/)
  })

  it('should calculate total price correctly', () => {
    const products = [
      createMockProduct({ barcode: '111', quantity: 2, price: 10.00 }),
      createMockProduct({ barcode: '222', quantity: 3, price: 5.00 }),
      createMockProduct({ barcode: '333', quantity: 1, price: 15.00 })
    ]

    const wrapper = mount(ProductList, {
      props: {
        products
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    // 2*10 + 3*5 + 1*15 = 20 + 15 + 15 = 50
    expect(wrapper.text()).toContain('$50.00')
  })

  it('should handle products without prices', () => {
    const products = [
      createMockProduct({ barcode: '111', quantity: 2, price: undefined }),
      createMockProduct({ barcode: '222', quantity: 3, price: undefined })
    ]

    const wrapper = mount(ProductList, {
      props: {
        products
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    // Total price should not show if no prices
    expect(wrapper.text()).not.toContain('Total: $')
  })

  it('should handle mixed products with and without prices', () => {
    const products = [
      createMockProduct({ barcode: '111', quantity: 2, price: 10.00 }),
      createMockProduct({ barcode: '222', quantity: 3, price: undefined })
    ]

    const wrapper = mount(ProductList, {
      props: {
        products
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    // Should only count products with prices: 2*10 = 20
    expect(wrapper.text()).toContain('$20.00')
  })

  it('should not show total price when total is 0', () => {
    const products = [
      createMockProduct({ barcode: '111', quantity: 2, price: 0 }),
      createMockProduct({ barcode: '222', quantity: 3, price: undefined })
    ]

    const wrapper = mount(ProductList, {
      props: {
        products
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    expect(wrapper.text()).not.toContain('Total: $')
  })

  it('should display summary info when products exist', () => {
    const wrapper = mount(ProductList, {
      props: {
        products: [createMockProduct()]
      },
      global: {
        stubs: {
          ProductListItem: true
        }
      }
    })

    expect(wrapper.find('.list-summary').exists()).toBe(true)
  })

  it('should not display summary when no products', () => {
    const wrapper = mount(ProductList, {
      props: {
        products: []
      }
    })

    expect(wrapper.find('.list-summary').exists()).toBe(false)
  })

  it('should pass product prop to ProductListItem', () => {
    const product = createMockProduct({ barcode: '123' })

    const wrapper = mount(ProductList, {
      props: {
        products: [product]
      },
      global: {
        stubs: {
          ProductListItem: {
            template: '<div>{{ product.barcode }}</div>',
            props: ['product']
          }
        }
      }
    })

    expect(wrapper.text()).toContain('123')
  })
})
