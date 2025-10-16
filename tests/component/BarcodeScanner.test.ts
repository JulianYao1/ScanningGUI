// tests/component/BarcodeScanner.test.ts
// Component tests for BarcodeScanner

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import BarcodeScanner from '~/components/BarcodeScanner.vue'

// Mock the useBarcodeScanner composable
vi.mock('~/composables/useBarcodeScanner', () => ({
  useBarcodeScanner: vi.fn((options: any) => {
    // Call the onScan callback if provided for testing
    if (options?.onScan) {
      // Store callback for manual triggering in tests
      ;(global as any).mockOnScanCallback = options.onScan
    }

    return {
      isInitialized: ref(true)
    }
  })
}))

describe('BarcodeScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global as any).mockOnScanCallback = null
  })

  it('should render the component', () => {
    const wrapper = mount(BarcodeScanner)
    expect(wrapper.find('.barcode-scanner').exists()).toBe(true)
  })

  it('should show scanner ready status when initialized', () => {
    const wrapper = mount(BarcodeScanner)
    expect(wrapper.text()).toContain('Scanner Ready')
  })

  it('should show active status indicator when initialized', () => {
    const wrapper = mount(BarcodeScanner)
    expect(wrapper.find('.status-indicator.active').exists()).toBe(true)
  })

  it('should show inactive status when not initialized', () => {
    // Mock as not initialized
    vi.mock('~/composables/useBarcodeScanner', () => ({
      useBarcodeScanner: vi.fn(() => ({
        isInitialized: ref(false)
      }))
    }))

    const wrapper = mount(BarcodeScanner)
    expect(wrapper.text()).toContain('Scanner Inactive')
  })

  it('should display scanner info text', () => {
    const wrapper = mount(BarcodeScanner)
    expect(wrapper.text()).toContain('Scan a barcode using your scanner or type manually and press Enter')
  })

  it('should not show last scanned initially', () => {
    const wrapper = mount(BarcodeScanner)
    expect(wrapper.find('.last-scanned').exists()).toBe(false)
  })

  it('should emit scan event when barcode is scanned', async () => {
    const wrapper = mount(BarcodeScanner)

    // Trigger the scan callback
    const callback = (global as any).mockOnScanCallback
    if (callback) {
      callback('123456789012')
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('scan')).toBeTruthy()
    expect(wrapper.emitted('scan')?.[0]).toEqual(['123456789012'])
  })

  it('should display last scanned barcode', async () => {
    const wrapper = mount(BarcodeScanner)

    const callback = (global as any).mockOnScanCallback
    if (callback) {
      callback('123456789012')
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.last-scanned').exists()).toBe(true)
    expect(wrapper.text()).toContain('Last scanned: 123456789012')
  })

  it('should show check icon for successful scan', async () => {
    const wrapper = mount(BarcodeScanner)

    const callback = (global as any).mockOnScanCallback
    if (callback) {
      callback('123456789012')
    }

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.check-icon').exists()).toBe(true)
    expect(wrapper.find('.check-icon').text()).toBe('✓')
  })

  it('should clear last scanned after timeout', async () => {
    vi.useFakeTimers()

    const wrapper = mount(BarcodeScanner)

    const callback = (global as any).mockOnScanCallback
    if (callback) {
      callback('123456789012')
    }

    await wrapper.vm.$nextTick()
    expect(wrapper.find('.last-scanned').exists()).toBe(true)

    // Fast-forward time by 2 seconds
    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.last-scanned').exists()).toBe(false)

    vi.useRealTimers()
  })

  it('should initialize scanner with correct options', () => {
    const { useBarcodeScanner } = require('~/composables/useBarcodeScanner')

    mount(BarcodeScanner)

    expect(useBarcodeScanner).toHaveBeenCalledWith({
      onScan: expect.any(Function),
      minLength: 3,
      scanTime: 50,
      preventDefault: true
    })
  })

  it('should handle multiple scans', async () => {
    const wrapper = mount(BarcodeScanner)
    const callback = (global as any).mockOnScanCallback

    if (callback) {
      callback('111111111111')
      await wrapper.vm.$nextTick()

      callback('222222222222')
      await wrapper.vm.$nextTick()

      callback('333333333333')
      await wrapper.vm.$nextTick()
    }

    const emitted = wrapper.emitted('scan') as any[]
    expect(emitted).toHaveLength(3)
    expect(emitted[0]).toEqual(['111111111111'])
    expect(emitted[1]).toEqual(['222222222222'])
    expect(emitted[2]).toEqual(['333333333333'])
  })

  it('should update last scanned with most recent barcode', async () => {
    const wrapper = mount(BarcodeScanner)
    const callback = (global as any).mockOnScanCallback

    if (callback) {
      callback('111111111111')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Last scanned: 111111111111')

      callback('222222222222')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Last scanned: 222222222222')
      expect(wrapper.text()).not.toContain('Last scanned: 111111111111')
    }
  })
})
