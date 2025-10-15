# Research: Picklist Scanner

**Feature**: 001-picklist-scanner
**Date**: 2025-10-15
**Purpose**: Technical research and decision rationale for implementation

## Overview

This document captures research findings and technical decisions for the picklist scanner feature. All "NEEDS CLARIFICATION" items from Technical Context have been resolved through best practices research and technology evaluation.

## Key Technical Decisions

### 1. Barcode Scanner Integration: onscan.js

**Decision**: Use [onscan.js](https://github.com/axenox/onscan.js/) library for keyboard wedge barcode scanner support.

**Rationale**:
- Keyboard wedge scanners act as HID devices (keyboards), no camera/WebRTC needed
- onscan.js detects rapid keyboard input patterns typical of barcode scanners
- Distinguishes scanner input from manual typing by speed/timing
- Lightweight (~10KB), zero dependencies, framework-agnostic
- Handles prefix/suffix characters, configurable scan detection
- Works across all browsers without requiring camera permissions

**Integration Pattern**:
```typescript
// composables/useBarcodeScanner.ts
import { onScanInit, onScanDetach } from 'onscan.js'

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  onMounted(() => {
    onScanInit(document, {
      onScan: (sCode: string) => onScan(sCode),
      minLength: 3,
      scanTime: 50, // 50ms scan detection window
      preventDefault: true
    })
  })

  onUnmounted(() => {
    onScanDetach(document)
  })
}
```

**Alternatives Considered**:
- **Camera-based scanning** (QuaggaJS, ZXing): Rejected - requires camera permissions, slower, warehouse scanners are keyboard wedge
- **Manual input only**: Rejected - eliminates core value proposition (speed)

---

### 2. MySQL Client Library: mysql2

**Decision**: Use `mysql2` npm package for MySQL database connectivity via Nuxt server API routes.

**Rationale**:
- `mysql2` is the standard MySQL client for Node.js (78M weekly downloads)
- Native Promise/async-await support
- Prepared statement support prevents SQL injection
- Connection pooling built-in for performance
- Compatible with Nuxt's Nitro server engine

**Implementation Pattern**:
```typescript
// server/utils/database.ts
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// server/api/products/[barcode].get.ts
export default defineEventHandler(async (event) => {
  const barcode = getRouterParam(event, 'barcode')
  const [rows] = await pool.execute(
    'SELECT * FROM products WHERE barcode = ?',
    [barcode]
  )
  return rows[0] || null
})
```

**Alternatives Considered**:
- **Direct client-side MySQL**: Rejected - security risk (exposes credentials), not supported in browsers
- **Prisma ORM**: Deferred - adds complexity, overkill for simple queries
- **GraphQL layer**: Rejected - unnecessary abstraction for this scope

---

### 3. Session Persistence: Browser Storage API

**Decision**: Use browser `localStorage` for session persistence with IndexedDB fallback for large datasets.

**Rationale**:
- localStorage: 5-10MB limit, synchronous, simple API, sufficient for 10 sessions
- IndexedDB: Used if sessions exceed localStorage limits (unlikely)
- No server-side storage needed (reduces infrastructure complexity)
- Persists through browser close/refresh (FR-014)
- Per-device isolation matches warehouse worker workflow

**Implementation Pattern**:
```typescript
// composables/useSessionPersistence.ts
export function useSessionPersistence() {
  const STORAGE_KEY = 'picklist-sessions'

  const saveSessions = (sessions: ScanningSession[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    } catch (e) {
      // Quota exceeded - fallback to IndexedDB if needed
      console.error('localStorage full, implement IndexedDB fallback')
    }
  }

  const loadSessions = (): ScanningSession[] => {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  return { saveSessions, loadSessions }
}
```

**Alternatives Considered**:
- **Server-side session storage**: Rejected - adds backend complexity, requires auth, unnecessary for single-device workflow
- **Cookies**: Rejected - 4KB limit too small
- **sessionStorage**: Rejected - clears on tab close (violates FR-014)

---

### 4. CSV Generation: Client-Side Implementation

**Decision**: Generate CSV files client-side using native JavaScript `Blob` and download via anchor element.

**Rationale**:
- No server processing needed for CSV generation
- Instant download without network round-trip
- Simple implementation for structured tabular data
- Browser compatibility excellent (Blob API widely supported)

**Implementation Pattern**:
```typescript
// composables/usePicklistExport.ts
export function usePicklistExport() {
  const generateCSV = (session: ScanningSession): string => {
    const headers = ['Box Number', 'Box Style', 'Barcode', 'Product Name', 'SKU', 'Quantity']
    const rows = session.products.map(p => [
      session.boxNumber,
      session.boxStyle,
      p.barcode,
      p.name,
      p.sku,
      p.quantity.toString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return csvContent
  }

  const downloadCSV = (session: ScanningSession) => {
    const csv = generateCSV(session)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `picklist-${session.boxNumber}-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return { downloadCSV }
}
```

**CSV Format**:
```
Box Number,Box Style,Barcode,Product Name,SKU,Quantity
"BOX-001","Small Box","123456789012","Widget A","WID-001","3"
"BOX-001","Small Box","987654321098","Gadget B","GAD-002","1"
```

**Alternatives Considered**:
- **Server-side CSV generation**: Rejected - unnecessary network overhead
- **Excel format (XLSX)**: Rejected - binary format adds complexity, CSV sufficient
- **PDF format**: Rejected - not machine-readable for downstream systems

---

### 5. Testing Framework: Vitest + Vue Test Utils + Playwright

**Decision**: Use Vitest for unit/component tests, Playwright for E2E tests.

**Rationale**:
- **Vitest**: Nuxt's recommended test framework, Vite-native, fast, TypeScript support
- **Vue Test Utils**: Official Vue.js testing library for component tests
- **Playwright**: Cross-browser E2E testing, reliable, excellent DX

**Test Structure**:
```typescript
// tests/unit/composables/useScanning.test.ts
import { describe, it, expect } from 'vitest'
import { useScanning } from '~/composables/useScanning'

describe('useScanning', () => {
  it('increments quantity for duplicate barcodes', () => {
    const { session, addProduct } = useScanning()
    addProduct({ barcode: '123', name: 'Test', sku: 'T1', quantity: 1 })
    addProduct({ barcode: '123', name: 'Test', sku: 'T1', quantity: 1 })
    expect(session.value.products[0].quantity).toBe(2)
  })
})

// tests/e2e/scanning-workflow.spec.ts
import { test, expect } from '@playwright/test'

test('complete scanning workflow', async ({ page }) => {
  await page.goto('/')
  await page.fill('[data-testid="box-number"]', 'BOX-001')
  await page.selectOption('[data-testid="box-style"]', 'Small Box')
  await page.click('[data-testid="start-session"]')

  // Simulate barcode scan
  await page.keyboard.type('123456789012')
  await page.waitForSelector('[data-testid="product-item"]')

  expect(await page.locator('[data-testid="product-name"]').textContent()).toBeTruthy()
})
```

**Alternatives Considered**:
- **Jest**: Rejected - slower than Vitest, legacy CommonJS
- **Cypress**: Rejected - Playwright has better TypeScript support and multi-browser testing

---

### 6. State Management: Composables (No Pinia/Vuex)

**Decision**: Use Vue 3 Composition API composables for all state management. No external state library.

**Rationale**:
- Composable pattern sufficient for application scope (single page, local state)
- Follows Constitution Principle IV (Composable-First Logic)
- Simpler mental model, fewer dependencies
- Type safety with TypeScript interfaces
- Easy to test (pure functions)

**State Architecture**:
```typescript
// composables/useScanning.ts
export function useScanning() {
  const sessions = ref<ScanningSession[]>([])
  const currentSessionId = ref<string | null>(null)

  const currentSession = computed(() =>
    sessions.value.find(s => s.id === currentSessionId.value)
  )

  const createSession = (boxNumber: string, boxStyle: BoxStyle) => {
    const session: ScanningSession = {
      id: crypto.randomUUID(),
      boxNumber,
      boxStyle,
      products: [],
      createdAt: new Date()
    }
    sessions.value.push(session)
    currentSessionId.value = session.id
  }

  const addProduct = (product: Product) => {
    const session = currentSession.value
    if (!session) return

    const existing = session.products.find(p => p.barcode === product.barcode)
    if (existing) {
      existing.quantity += product.quantity
    } else {
      session.products.push(product)
    }
  }

  return {
    sessions: readonly(sessions),
    currentSession,
    createSession,
    addProduct
  }
}
```

**When to Reconsider**:
- If multi-tab synchronization becomes required → Consider Pinia with BroadcastChannel
- If state grows beyond composable scope → Refactor to Pinia store

---

### 7. Database Schema Assumptions

**Decision**: Assume existing MySQL `products` table with minimal required fields.

**Expected Schema**:
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_barcode (barcode)
);
```

**Rationale**:
- User indicated table structure exists in `@tables/tables.sql` (file not found, assuming standard structure)
- Barcode as indexed lookup key (FR-005 requires fast lookups)
- Basic product fields match Key Entities in spec
- Price field optional but common in warehouse systems

**Migration Strategy**:
- If actual schema differs, create database migration or view
- Add fields as needed for specific warehouse requirements
- Ensure barcode column exists and is indexed

---

## Performance Considerations

### Database Query Optimization
- **Index on barcode column**: Critical for <2s lookup (SC-002)
- **Connection pooling**: Reuse connections for multiple scans
- **Prepared statements**: Prevent SQL injection, improve performance

### Client-Side Optimization
- **Lazy loading**: Use `<LazySessionManager />` for P3 feature
- **Virtual scrolling**: If product list exceeds 100 items (unlikely in scanning workflow)
- **Debouncing**: Not needed for scanner input (single rapid burst)

### Network Resilience
- **Error handling**: Show clear error if MySQL unavailable (edge case)
- **Retry logic**: Single retry for transient network failures
- **Offline fallback**: Display error message, prompt user to check connectivity

---

## Security Considerations

### Database Access
- **Environment variables**: Store MySQL credentials in `.env` (never in code)
- **Prepared statements**: Prevent SQL injection via `mysql2` parameterized queries
- **Read-only access**: Application only needs SELECT on products table

### Input Validation
- **Barcode format validation**: Check length/format before database query
- **Box number sanitization**: Prevent XSS in CSV output
- **Rate limiting**: Not needed (physical scanner limitation)

---

## Dependencies

### Production Dependencies
```json
{
  "nuxt": "^4.1.3",
  "vue": "^3.5.22",
  "onscan.js": "^1.5.2",
  "mysql2": "^3.11.5"
}
```

### Development Dependencies
```json
{
  "@nuxt/test-utils": "^3.14.4",
  "@vue/test-utils": "^2.4.6",
  "@playwright/test": "^1.49.1",
  "vitest": "^2.1.8",
  "@vitest/ui": "^2.1.8",
  "happy-dom": "^15.11.7"
}
```

---

## Next Steps

This research phase is complete. Proceed to Phase 1:
1. Generate `data-model.md` with entity schemas
2. Create API contracts in `contracts/`
3. Write `quickstart.md` for development setup
4. Update agent context files
