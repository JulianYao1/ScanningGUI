# Quickstart Guide: Picklist Scanner

**Feature**: 001-picklist-scanner
**Date**: 2025-10-15
**Purpose**: Developer setup and implementation guide

## Overview

This guide helps developers quickly set up and implement the picklist scanner feature. Follow these steps to get the development environment running and understand the implementation workflow.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v18.x or v20.x LTS
- **npm**: v9.x or later (comes with Node.js)
- **MySQL**: v8.0 or later
- **Keyboard wedge barcode scanner** (for testing physical hardware)
- **Git**: For version control

Optional:
- **VS Code** with Vue/Volar extension
- **MySQL Workbench** or other database GUI

---

## Environment Setup

### 1. Clone and Install

```bash
# Navigate to project root
cd D:\GitHub\ScanningGUI

# Ensure you're on the feature branch
git checkout 001-picklist-scanner

# Install dependencies
npm install

# Install additional dependencies for this feature
npm install onscan.js mysql2
npm install -D @nuxt/test-utils @vue/test-utils @playwright/test vitest happy-dom
```

### 2. Database Setup

**Create Database**:
```sql
CREATE DATABASE warehouse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE warehouse;
```

**Create Products Table**:
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  barcode VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Seed Test Data**:
```sql
INSERT INTO products (barcode, name, sku, description, price) VALUES
('123456789012', 'Widget A', 'WID-001', 'Standard widget for general use', 9.99),
('987654321098', 'Gadget B', 'GAD-002', 'Premium gadget with advanced features', 15.99),
('555555555555', 'Tool C', 'TOOL-003', 'Essential tool for assembly', 24.50),
('111111111111', 'Part D', 'PART-004', 'Replacement part', 5.25),
('222222222222', 'Component E', 'COMP-005', 'Electronic component', 12.00);
```

**Create Database User**:
```sql
CREATE USER 'picklist_reader'@'localhost' IDENTIFIED BY 'dev_password';
GRANT SELECT ON warehouse.products TO 'picklist_reader'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Environment Configuration

Create `.env` file in project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=picklist_reader
DB_PASSWORD=dev_password
DB_NAME=warehouse

# Nuxt Configuration
NUXT_DEVTOOLS=true
```

**Add to `.gitignore`**:
```
.env
.env.*
!.env.example
```

Create `.env.example` for team reference:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=warehouse
```

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

Server starts at `http://localhost:3000`

### 2. Project Structure

Implement features following this structure:

```
app/
└── app.vue                          # Update root component

pages/
└── index.vue                        # Main scanning interface (CREATE)

components/
├── BoxSetupForm.vue                 # CREATE
├── BarcodeScanner.vue               # CREATE
├── ProductList.vue                  # CREATE
├── ProductListItem.vue              # CREATE
├── SessionManager.vue               # CREATE (P3)
└── PicklistDownload.vue             # CREATE

composables/
├── useScanning.ts                   # CREATE
├── useBarcodeScanner.ts             # CREATE
├── useProductLookup.ts              # CREATE
├── useSessionPersistence.ts         # CREATE
└── usePicklistExport.ts             # CREATE

utils/
├── barcodeValidator.ts              # CREATE
├── csvFormatter.ts                  # CREATE
└── dateFormatter.ts                 # CREATE

types/
├── scanning.ts                      # CREATE (interfaces/enums)
└── boxStyles.ts                     # CREATE

server/
└── api/
    └── products/
        └── [barcode].get.ts         # CREATE (Nitro API route)

server/utils/
└── database.ts                      # CREATE (MySQL pool)

tests/
├── unit/                            # CREATE test files
├── component/                       # CREATE test files
└── e2e/                             # CREATE test files
```

### 3. Implementation Order

Follow this sequence for optimal development:

**Phase 1: Core Infrastructure** (P1 - MVP)
1. Create types/interfaces (`types/scanning.ts`, `types/boxStyles.ts`)
2. Setup database connection (`server/utils/database.ts`)
3. Create product API endpoint (`server/api/products/[barcode].get.ts`)
4. Implement product lookup composable (`composables/useProductLookup.ts`)
5. Test API endpoint with curl/Postman

**Phase 2: Scanning Session Logic** (P1 - MVP)
6. Implement scanning composable (`composables/useScanning.ts`)
7. Implement barcode scanner wrapper (`composables/useBarcodeScanner.ts`)
8. Add session persistence (`composables/useSessionPersistence.ts`)
9. Write unit tests for composables

**Phase 3: UI Components** (P1 - MVP)
10. Create Box Setup Form (`components/BoxSetupForm.vue`)
11. Create Barcode Scanner component (`components/BarcodeScanner.vue`)
12. Create Product List (`components/ProductList.vue`, `ProductListItem.vue`)
13. Build main page (`pages/index.vue`)
14. Test full P1 workflow

**Phase 4: CSV Export** (P2)
15. Implement picklist export (`composables/usePicklistExport.ts`)
16. Create download button (`components/PicklistDownload.vue`)
17. Test CSV generation and download
18. Write E2E tests for P1+P2

**Phase 5: Multi-Session Management** (P3 - Optional)
19. Create session manager UI (`components/SessionManager.vue`)
20. Add session switching logic
21. Test with multiple concurrent sessions

---

## Testing

### Unit Tests

```bash
# Run all unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- tests/unit/composables/useScanning.test.ts

# Run tests in watch mode
npm run test:unit -- --watch

# Generate coverage report
npm run test:unit -- --coverage
```

**Example Test**:
```typescript
// tests/unit/composables/useScanning.test.ts
import { describe, it, expect } from 'vitest'
import { useScanning } from '~/composables/useScanning'

describe('useScanning', () => {
  it('creates new scanning session', () => {
    const { createSession, currentSession } = useScanning()

    createSession('BOX-001', 'Small Box')

    expect(currentSession.value).toMatchObject({
      boxNumber: 'BOX-001',
      boxStyle: 'Small Box',
      products: []
    })
  })

  it('increments quantity for duplicate barcodes', () => {
    const { createSession, addProduct, currentSession } = useScanning()

    createSession('BOX-001', 'Small Box')

    addProduct({
      barcode: '123',
      name: 'Test Product',
      sku: 'TEST-001',
      quantity: 1,
      firstScannedAt: new Date(),
      lastScannedAt: new Date()
    })

    addProduct({
      barcode: '123',
      name: 'Test Product',
      sku: 'TEST-001',
      quantity: 1,
      firstScannedAt: new Date(),
      lastScannedAt: new Date()
    })

    expect(currentSession.value!.products).toHaveLength(1)
    expect(currentSession.value!.products[0].quantity).toBe(2)
  })
})
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:e2e -- --ui

# Run specific test file
npm run test:e2e -- tests/e2e/scanning-workflow.spec.ts
```

**Example E2E Test**:
```typescript
// tests/e2e/scanning-workflow.spec.ts
import { test, expect } from '@playwright/test'

test('complete scanning workflow', async ({ page }) => {
  await page.goto('/')

  // Step 1: Enter box details
  await page.fill('[data-testid="box-number"]', 'BOX-001')
  await page.selectOption('[data-testid="box-style"]', 'Small Box')
  await page.click('[data-testid="start-session"]')

  // Step 2: Scan first product
  await page.keyboard.type('123456789012')
  await page.waitForSelector('[data-testid="product-item"]')

  const productName = await page.locator('[data-testid="product-name"]').first()
  await expect(productName).toHaveText('Widget A')

  // Step 3: Scan same product again (quantity increment)
  await page.keyboard.type('123456789012')
  await page.waitForTimeout(100) // Wait for quantity update

  const quantity = await page.locator('[data-testid="product-quantity"]').first()
  await expect(quantity).toHaveText('2')

  // Step 4: Download picklist
  const downloadPromise = page.waitForEvent('download')
  await page.click('[data-testid="download-picklist"]')
  const download = await downloadPromise

  expect(download.suggestedFilename()).toMatch(/^picklist-BOX-001-\d+\.csv$/)
})
```

### Type Checking

```bash
# Run TypeScript type checking
npm run typecheck

# Or use Nuxt's built-in check
npx nuxi typecheck
```

---

## Barcode Scanner Setup

### Physical Scanner Configuration

1. **Connect Scanner**: Plug USB barcode scanner into computer
2. **Test Input**: Scanner should act as keyboard (HID device)
3. **Verify Settings**:
   - Suffix: Enter key (default)
   - Prefix: None (or configure as needed)
   - Character set: ASCII

### Testing Without Physical Scanner

**Option 1: Manual Keyboard Input**
- Type barcode quickly (within 50ms window)
- Press Enter key
- onscan.js will detect rapid input pattern

**Option 2: Browser DevTools**
```javascript
// Simulate scan event in browser console
document.dispatchEvent(new KeyboardEvent('keypress', {
  key: '1', code: 'Digit1'
}))
// Repeat for each character, then send 'Enter'
```

**Option 3: Test Utility Function**
```typescript
// utils/testScan.ts (dev only)
export function simulateScan(barcode: string) {
  const chars = barcode.split('')
  chars.forEach((char, i) => {
    setTimeout(() => {
      document.dispatchEvent(new KeyboardEvent('keypress', {
        key: char, code: `Digit${char}`
      }))
    }, i * 10) // 10ms between chars (fast enough for detection)
  })

  setTimeout(() => {
    document.dispatchEvent(new KeyboardEvent('keypress', {
      key: 'Enter', code: 'Enter'
    }))
  }, chars.length * 10 + 20)
}

// Usage in browser console:
// simulateScan('123456789012')
```

---

## Debugging

### Database Connection Issues

**Check Connection**:
```bash
# Test MySQL connection
mysql -h localhost -u picklist_reader -p warehouse
# Enter password: dev_password

# Verify table exists
SHOW TABLES;
DESC products;
```

**Common Issues**:
- **Error: ER_ACCESS_DENIED_ERROR**: Check username/password in `.env`
- **Error: ER_BAD_DB_ERROR**: Database doesn't exist, run CREATE DATABASE
- **Error: ECONNREFUSED**: MySQL server not running, start with `mysql.server start` or Windows Services

### API Endpoint Testing

**Test with curl**:
```bash
# Test product lookup
curl http://localhost:3000/api/products/123456789012

# Expected response:
# {"id":1,"barcode":"123456789012","name":"Widget A","sku":"WID-001",...}

# Test 404
curl http://localhost:3000/api/products/999999999999
# Expected: 404 Not Found
```

**Test with browser DevTools**:
```javascript
// In browser console on localhost:3000
fetch('/api/products/123456789012')
  .then(r => r.json())
  .then(console.log)
```

### localStorage Inspection

**View stored sessions**:
```javascript
// Browser console
const sessions = JSON.parse(localStorage.getItem('picklist-sessions') || '{}')
console.log(sessions)
```

**Clear sessions**:
```javascript
localStorage.removeItem('picklist-sessions')
```

### onscan.js Debugging

**Enable debug mode**:
```typescript
onScanInit(document, {
  onScan: (sCode) => console.log('Scanned:', sCode),
  minLength: 3,
  scanTime: 50,
  preventDefault: true,
  onKeyDetect: (iKeyCode) => console.log('Key detected:', iKeyCode), // Debug
  onPaste: (sCode) => console.log('Pasted:', sCode) // Debug paste events
})
```

---

## Performance Optimization

### Database Query Performance

**Verify index usage**:
```sql
EXPLAIN SELECT * FROM products WHERE barcode = '123456789012';
```

Expected output should show:
- `type: ref`
- `key: idx_barcode`
- `rows: 1`

### Browser Performance

**Monitor performance**:
- Open Chrome DevTools → Performance tab
- Record scanning session
- Look for long tasks (>50ms)

**Check bundle size**:
```bash
npm run build
# Review .output/public/_nuxt/ file sizes
```

**Optimize if needed**:
- Lazy load SessionManager component (P3)
- Code split large libraries
- Enable Nuxt's auto-import tree-shaking

---

## Troubleshooting

### Common Issues

**Issue**: Barcode scanner not detected
- **Solution**: Check scanner acts as HID keyboard, test in text editor first
- **Solution**: Adjust `scanTime` in onscan.js config (increase to 100ms)

**Issue**: Product lookup returns 404 but barcode exists
- **Solution**: Check barcode format (leading zeros, case sensitivity)
- **Solution**: Query database directly to verify data

**Issue**: CSV download not working
- **Solution**: Check browser allows downloads (not blocked)
- **Solution**: Verify Blob API support (all modern browsers)

**Issue**: Session data lost after refresh
- **Solution**: Check localStorage quota not exceeded
- **Solution**: Verify no browser privacy mode (incognito clears storage)

---

## Next Steps

After completing quickstart setup:

1. **Review Implementation Plan**: `plan.md` for architecture overview
2. **Study Data Model**: `data-model.md` for entity schemas
3. **Read API Contracts**: `contracts/api-spec.md` for endpoint details
4. **Run `/speckit.tasks`**: Generate detailed task breakdown
5. **Start Implementation**: Follow Phase 1 → Phase 2 → Phase 3 sequence

---

## Resources

- **Nuxt 4 Docs**: https://nuxt.com/docs
- **Vue 3 Docs**: https://vuejs.org/guide/introduction.html
- **onscan.js GitHub**: https://github.com/axenox/onscan.js/
- **mysql2 Docs**: https://github.com/sidorares/node-mysql2
- **Vitest Docs**: https://vitest.dev/
- **Playwright Docs**: https://playwright.dev/

---

## Support

For questions or issues:
- Check `CLAUDE.md` for AI assistant guidance
- Review feature spec: `spec.md`
- Consult constitution: `.specify/memory/constitution.md`
