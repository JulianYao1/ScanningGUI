import { vi } from 'vitest'
import { ref, computed, reactive, readonly } from 'vue'

// Make Vue composables globally available
global.ref = ref
global.computed = computed
global.reactive = reactive
global.readonly = readonly

// Mock Nuxt auto-imports
global.$fetch = vi.fn()

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock fetch for API calls
global.fetch = vi.fn()
