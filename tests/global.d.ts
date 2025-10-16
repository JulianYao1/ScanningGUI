// Global type declarations for test environment
import type { Ref, ComputedRef } from 'vue'

declare global {
  var ref: typeof import('vue')['ref']
  var computed: typeof import('vue')['computed']
  var reactive: typeof import('vue')['reactive']
  var readonly: typeof import('vue')['readonly']
  var $fetch: typeof import('ofetch')['$fetch']
}

export {}
