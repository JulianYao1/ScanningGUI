# API Specification: Picklist Scanner

**Feature**: 001-picklist-scanner
**Date**: 2025-10-15
**Purpose**: API contracts, endpoints, request/response schemas, error handling

## Overview

This document defines the API contracts for the picklist scanner application. The application uses Nuxt's Nitro server engine to create serverless API routes that query the MySQL database.

---

## API Endpoints

### GET /api/products/:barcode

Lookup product information by barcode.

**Purpose**: Retrieve product details from MySQL database when a barcode is scanned (FR-005).

**Method**: `GET`
**Path**: `/api/products/:barcode`
**Authentication**: None (internal app, warehouse network)

**Path Parameters**:
| Parameter | Type   | Required | Description                    | Example          |
|-----------|--------|----------|--------------------------------|------------------|
| barcode   | string | Yes      | Product barcode to lookup      | `123456789012`   |

**Query Parameters**: None

**Request Headers**:
```http
Accept: application/json
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "barcode": "123456789012",
  "name": "Widget A",
  "sku": "WID-001",
  "description": "Standard widget for general use",
  "price": 9.99
}
```

**Response Schema**:
```typescript
interface ProductResponse {
  id: number
  barcode: string
  name: string
  sku: string
  description: string | null
  price: number | null
}
```

**Error Response** (404 Not Found):
```json
{
  "statusCode": 404,
  "statusMessage": "Product Not Found",
  "message": "No product found with barcode: 123456789012",
  "barcode": "123456789012"
}
```

**Error Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "statusMessage": "Invalid Barcode Format",
  "message": "Barcode must be 3-50 alphanumeric characters",
  "barcode": "ab"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "statusCode": 500,
  "statusMessage": "Database Error",
  "message": "Unable to query product database"
}
```

**Performance Requirements**:
- 95th percentile response time: <2 seconds (SC-002)
- Database connection pooling enabled
- Prepared statement for SQL injection prevention

**Example Implementation**:
```typescript
// server/api/products/[barcode].get.ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { pool } from '~/server/utils/database'
import { isValidBarcode } from '~/utils/barcodeValidator'

export default defineEventHandler(async (event) => {
  const barcode = getRouterParam(event, 'barcode')

  if (!barcode || !isValidBarcode(barcode)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Barcode Format',
      message: 'Barcode must be 3-50 alphanumeric characters',
      data: { barcode }
    })
  }

  try {
    const [rows] = await pool.execute<any[]>(
      'SELECT id, barcode, name, sku, description, price FROM products WHERE barcode = ? LIMIT 1',
      [barcode]
    )

    if (rows.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product Not Found',
        message: `No product found with barcode: ${barcode}`,
        data: { barcode }
      })
    }

    return rows[0]
  } catch (error) {
    if (error.statusCode) throw error // Re-throw H3 errors

    console.error('Database query error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Database Error',
      message: 'Unable to query product database'
    })
  }
})
```

**Caching Strategy**:
- No caching (product data may change frequently)
- If performance issues arise, implement short-lived cache (30-60 seconds)

**Rate Limiting**:
- Not required (physical scanner limitation)
- If abuse detected, implement per-IP rate limiting in production

---

## Client-Side API Usage

### Composable Pattern

```typescript
// composables/useProductLookup.ts
export function useProductLookup() {
  const lookupProduct = async (barcode: string): Promise<SessionProduct | null> => {
    try {
      const product = await $fetch(`/api/products/${barcode}`)

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
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null // Product not found
      }
      throw error // Re-throw other errors
    }
  }

  return { lookupProduct }
}
```

**Error Handling in Component**:
```vue
<script setup lang="ts">
const { lookupProduct } = useProductLookup()
const { addProduct } = useScanning()
const errorMessage = ref<string | null>(null)

const handleScan = async (barcode: string) => {
  errorMessage.value = null

  try {
    const product = await lookupProduct(barcode)

    if (!product) {
      // FR-011: Show error message with barcode
      errorMessage.value = `Product not found: ${barcode}`
      return
    }

    addProduct(product)
  } catch (error: any) {
    errorMessage.value = error.data?.message || 'Unable to lookup product'
  }
}
</script>
```

---

## CSV Export Format

### Picklist File Structure

**File Naming Convention**:
```
picklist-{boxNumber}-{timestamp}.csv
```

**Example Filename**:
```
picklist-BOX-001-1729008000000.csv
```

**CSV Headers**:
```
Box Number,Box Style,Barcode,Product Name,SKU,Quantity,Unit Price,Total Price
```

**CSV Row Format**:
```csv
"BOX-001","Small Box","123456789012","Widget A","WID-001",3,"9.99","29.97"
"BOX-001","Small Box","987654321098","Gadget B","GAD-002",1,"15.99","15.99"
```

**Field Specifications**:
| Field        | Type   | Format                | Notes                          |
|--------------|--------|-----------------------|--------------------------------|
| Box Number   | string | Quoted alphanumeric   | User-entered box identifier    |
| Box Style    | string | Quoted enum value     | One of 6 predefined styles     |
| Barcode      | string | Quoted alphanumeric   | Product barcode                |
| Product Name | string | Quoted text           | Escaped quotes doubled         |
| SKU          | string | Quoted alphanumeric   | Stock keeping unit             |
| Quantity     | number | Unquoted integer      | Scan count                     |
| Unit Price   | string | Quoted decimal        | Price per unit (nullable)      |
| Total Price  | string | Quoted decimal        | Quantity × Unit Price          |

**CSV Encoding**:
- Character set: UTF-8 with BOM
- Line ending: CRLF (`\r\n`)
- Quote escaping: Double quotes (`""`)

**Example Generation**:
```typescript
// composables/usePicklistExport.ts
export function usePicklistExport() {
  const generateCSV = (session: ScanningSession): string => {
    const headers = [
      'Box Number', 'Box Style', 'Barcode', 'Product Name',
      'SKU', 'Quantity', 'Unit Price', 'Total Price'
    ]

    const rows = session.products.map(product => {
      const unitPrice = product.price?.toFixed(2) || ''
      const totalPrice = product.price
        ? (product.price * product.quantity).toFixed(2)
        : ''

      return [
        session.boxNumber,
        session.boxStyle,
        product.barcode,
        product.name.replace(/"/g, '""'), // Escape quotes
        product.sku,
        product.quantity.toString(),
        unitPrice,
        totalPrice
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell =>
        /[,"\r\n]/.test(cell) ? `"${cell}"` : cell
      ).join(','))
    ].join('\r\n')

    return '\uFEFF' + csvContent // Add UTF-8 BOM
  }

  return { generateCSV }
}
```

**CSV Validation**:
- All required fields present
- Quantity always > 0
- Prices formatted to 2 decimal places
- Special characters properly escaped

---

## Error Codes Reference

### Application Error Codes

| Code                | HTTP Status | Description                        | User Action                    |
|---------------------|-------------|------------------------------------|--------------------------------|
| PRODUCT_NOT_FOUND   | 404         | Barcode not in database            | Verify barcode, retry scan     |
| DATABASE_ERROR      | 500         | MySQL connection/query failed      | Check network, retry           |
| INVALID_BARCODE     | 400         | Barcode format invalid             | Re-scan with valid barcode     |
| STORAGE_FULL        | N/A         | localStorage quota exceeded        | Delete old sessions            |
| NETWORK_ERROR       | N/A         | Client network connectivity        | Check connection, retry        |

**Error Handling Pattern**:
```typescript
interface AppError {
  code: ErrorCode
  message: string
  barcode?: string
  timestamp: Date
  retryable: boolean
}

function handleError(error: any): AppError {
  if (error.statusCode === 404) {
    return {
      code: 'PRODUCT_NOT_FOUND',
      message: error.data?.message || 'Product not found',
      barcode: error.data?.barcode,
      timestamp: new Date(),
      retryable: true
    }
  }

  if (error.statusCode === 500) {
    return {
      code: 'DATABASE_ERROR',
      message: 'Database temporarily unavailable',
      timestamp: new Date(),
      retryable: true
    }
  }

  return {
    code: 'NETWORK_ERROR',
    message: 'Network error occurred',
    timestamp: new Date(),
    retryable: true
  }
}
```

---

## Security Considerations

### Database Connection Security

**Environment Variables** (.env):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=picklist_reader
DB_PASSWORD=secure_password_here
DB_NAME=warehouse
```

**Connection Pool Configuration**:
```typescript
// server/utils/database.ts
import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})
```

**SQL Injection Prevention**:
- ✅ Use prepared statements (parameterized queries)
- ✅ Never concatenate user input into SQL strings
- ✅ Validate barcode format before query

**Database User Permissions**:
```sql
-- Read-only user for application
CREATE USER 'picklist_reader'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT ON warehouse.products TO 'picklist_reader'@'%';
FLUSH PRIVILEGES;
```

**Input Sanitization**:
- Barcode: Validate format, max length
- Box number: Remove special characters before CSV export
- Product data: Escape quotes in CSV output

---

## Performance Optimization

### Database Query Performance

**Index Usage**:
```sql
-- Ensure index exists on barcode column
CREATE INDEX idx_barcode ON products(barcode);

-- Verify index is used
EXPLAIN SELECT * FROM products WHERE barcode = '123456789012';
-- Should show "type: ref" and "key: idx_barcode"
```

**Connection Pooling Benefits**:
- Reuse connections across requests
- Reduce connection overhead
- Handle concurrent scans efficiently

**Query Timeout**:
```typescript
// Set query timeout to prevent hanging
const [rows] = await pool.execute({
  sql: 'SELECT * FROM products WHERE barcode = ?',
  values: [barcode],
  timeout: 2000 // 2 second timeout
})
```

---

## Testing Contracts

### Unit Tests for API Endpoint

```typescript
// tests/unit/api/products.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createEvent } from 'h3'

describe('/api/products/:barcode', () => {
  it('returns product for valid barcode', async () => {
    const event = createEvent('/api/products/123456789012', {})
    const response = await handler(event)

    expect(response).toMatchObject({
      barcode: '123456789012',
      name: expect.any(String),
      sku: expect.any(String)
    })
  })

  it('returns 404 for unknown barcode', async () => {
    const event = createEvent('/api/products/999999999999', {})

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 404
    })
  })

  it('returns 400 for invalid barcode format', async () => {
    const event = createEvent('/api/products/ab', {})

    await expect(handler(event)).rejects.toMatchObject({
      statusCode: 400
    })
  })
})
```

### E2E Tests for Full Flow

```typescript
// tests/e2e/product-lookup.spec.ts
import { test, expect } from '@playwright/test'

test('product lookup integration', async ({ page }) => {
  await page.goto('/')

  // Intercept API call
  await page.route('/api/products/*', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        barcode: '123456789012',
        name: 'Test Product',
        sku: 'TEST-001',
        price: 10.00
      })
    })
  })

  // Simulate barcode scan
  await page.keyboard.type('123456789012')

  // Verify product appears
  await expect(page.locator('[data-testid="product-name"]')).toHaveText('Test Product')
})
```

---

## API Versioning

**Current Version**: v1 (implicit, no version prefix)

**Future Versioning Strategy**:
- If breaking changes needed: `/api/v2/products/:barcode`
- Maintain v1 for backwards compatibility
- Deprecation notices in response headers

---

## Next Steps

API contracts complete. Proceed to:
1. Generate `quickstart.md` for development setup instructions
2. Update agent context files with technology stack
