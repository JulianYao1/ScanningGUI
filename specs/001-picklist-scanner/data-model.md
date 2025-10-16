# Data Model: Picklist Scanner

**Feature**: 001-picklist-scanner
**Date**: 2025-10-15
**Purpose**: Entity schemas, relationships, validation rules, and state transitions

## Overview

This document defines the data structures for the picklist scanning application. The application uses three primary client-side entities (ScanningSession, Product, SessionProduct) and one server-side entity (DatabaseProduct). All TypeScript interfaces follow strict typing per Constitution Principle III.

---

## Core Entities

### 1. ScanningSession

Represents an active or completed scanning session for a single box.

**TypeScript Interface**:
```typescript
// types/scanning.ts
export interface ScanningSession {
  id: string                    // UUID v4
  boxNumber: string              // User-entered box identifier
  boxStyle: BoxStyle             // Selected box type
  products: SessionProduct[]     // Scanned products with quantities
  status: SessionStatus          // Current session state
  createdAt: Date               // Session creation timestamp
  updatedAt: Date               // Last modification timestamp
}

export enum SessionStatus {
  Active = 'active',            // Currently scanning
  Paused = 'paused',            // Saved but not active
  Completed = 'completed'       // Picklist downloaded
}

export enum BoxStyle {
  Envelope = 'Envelope',
  SmallBox = 'Small Box',
  MediumBox = 'Medium Box',
  LargeBox = 'Large Box',
  FlatRate = 'Flat Rate',
  Tube = 'Tube'
}
```

**Validation Rules**:
- `id`: Must be valid UUID v4 format
- `boxNumber`: Required, 1-50 characters, alphanumeric + hyphens/underscores
- `boxStyle`: Must be one of enum values
- `products`: Array, can be empty
- `status`: Must be one of enum values
- `createdAt`, `updatedAt`: Valid Date objects

**Relationships**:
- Has many `SessionProduct` (one-to-many)
- No foreign keys (client-side only)

**State Transitions**:
```
[New] → Active → Paused ↔ Active → Completed
         ↓                   ↓
      [Deleted]          [Deleted]
```

**Business Rules**:
- Only one session can be "Active" at a time per user
- Completed sessions cannot transition back to Active/Paused
- Sessions persist in localStorage until manually deleted

---

### 2. SessionProduct

Represents a product scanned within a session, including accumulated quantity.

**TypeScript Interface**:
```typescript
// types/scanning.ts
export interface SessionProduct {
  barcode: string               // Product barcode (primary key within session)
  name: string                  // Product display name
  sku: string                   // Stock keeping unit
  description?: string          // Optional product description
  price?: number                // Optional unit price (decimal)
  quantity: number              // Accumulated scan count
  firstScannedAt: Date         // Timestamp of first scan
  lastScannedAt: Date          // Timestamp of most recent scan
}
```

**Validation Rules**:
- `barcode`: Required, 3-50 characters, matches standard formats (UPC/EAN/Code128)
- `name`: Required, 1-255 characters
- `sku`: Required, 1-100 characters
- `description`: Optional, max 1000 characters
- `price`: Optional, positive decimal with 2 decimal places
- `quantity`: Required, positive integer >= 1
- `firstScannedAt`, `lastScannedAt`: Valid Date objects

**Relationships**:
- Belongs to `ScanningSession` (many-to-one)
- Derived from `DatabaseProduct` via barcode lookup

**Uniqueness**:
- `barcode` is unique within a `ScanningSession.products` array
- Duplicate barcode scans increment `quantity` instead of creating new entries (per clarification)

**Business Rules**:
- Quantity starts at 1 on first scan
- Each subsequent scan of same barcode: `quantity++`, `lastScannedAt = now()`
- Cannot have quantity < 1 (delete product instead of decrementing to 0)

---

### 3. DatabaseProduct (Server-Side)

Product record stored in MySQL database. Read-only from application perspective.

**MySQL Schema**:
```sql
-- Assumed schema (from research.md)
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

**TypeScript Interface** (Server API):
```typescript
// server/types/database.ts
export interface DatabaseProduct {
  id: number
  barcode: string
  name: string
  sku: string
  description: string | null
  price: number | null
  created_at: Date
  updated_at: Date
}
```

**Validation Rules**:
- `barcode`: Indexed for fast lookups, unique constraint
- `name`, `sku`: NOT NULL in database
- `description`, `price`: Nullable

**Query Patterns**:
```typescript
// Lookup by barcode (primary use case)
SELECT id, barcode, name, sku, description, price
FROM products
WHERE barcode = ?
LIMIT 1;
```

**Transformation**:
```typescript
// Convert DatabaseProduct → SessionProduct
function toSessionProduct(dbProduct: DatabaseProduct): SessionProduct {
  return {
    barcode: dbProduct.barcode,
    name: dbProduct.name,
    sku: dbProduct.sku,
    description: dbProduct.description || undefined,
    price: dbProduct.price || undefined,
    quantity: 1,                  // Initial quantity
    firstScannedAt: new Date(),
    lastScannedAt: new Date()
  }
}
```

---

## Derived Entities

### 4. PicklistExport (CSV Format)

Generated output when user downloads a picklist. Not stored as an entity.

**CSV Structure**:
```csv
Box Number,Box Style,Barcode,Product Name,SKU,Quantity,Total Price
"BOX-001","Small Box","123456789012","Widget A","WID-001",3,"29.97"
"BOX-001","Small Box","987654321098","Gadget B","GAD-002",1,"15.99"
```

**TypeScript Type**:
```typescript
// types/export.ts
export interface PicklistRow {
  boxNumber: string
  boxStyle: BoxStyle
  barcode: string
  productName: string
  sku: string
  quantity: number
  totalPrice?: string  // Formatted currency string
}

export interface PicklistExport {
  session: ScanningSession
  rows: PicklistRow[]
  generatedAt: Date
  filename: string
}
```

**Generation Logic**:
```typescript
function generatePicklistRows(session: ScanningSession): PicklistRow[] {
  return session.products.map(product => ({
    boxNumber: session.boxNumber,
    boxStyle: session.boxStyle,
    barcode: product.barcode,
    productName: product.name,
    sku: product.sku,
    quantity: product.quantity,
    totalPrice: product.price
      ? (product.price * product.quantity).toFixed(2)
      : undefined
  }))
}
```

---

## State Management

### Client-Side Storage Schema (localStorage)

**Storage Key**: `picklist-sessions`

**Stored Value**:
```typescript
interface StoredSessions {
  version: number              // Schema version for migrations
  sessions: ScanningSession[]
  lastUpdated: string         // ISO 8601 timestamp
}
```

**Example localStorage Value**:
```json
{
  "version": 1,
  "lastUpdated": "2025-10-15T14:30:00.000Z",
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "boxNumber": "BOX-001",
      "boxStyle": "Small Box",
      "status": "active",
      "products": [
        {
          "barcode": "123456789012",
          "name": "Widget A",
          "sku": "WID-001",
          "quantity": 3,
          "price": 9.99,
          "firstScannedAt": "2025-10-15T14:25:00.000Z",
          "lastScannedAt": "2025-10-15T14:28:00.000Z"
        }
      ],
      "createdAt": "2025-10-15T14:20:00.000Z",
      "updatedAt": "2025-10-15T14:28:00.000Z"
    }
  ]
}
```

**Size Estimation**:
- Average session: ~2KB (10 products)
- 10 concurrent sessions: ~20KB
- Well within localStorage 5MB limit

---

## Validation Functions

### Barcode Validation
```typescript
// utils/barcodeValidator.ts
export function isValidBarcode(barcode: string): boolean {
  // UPC-A: 12 digits
  // EAN-13: 13 digits
  // Code128: 3-50 alphanumeric
  return /^[\d]{12,13}$/.test(barcode) || /^[\w-]{3,50}$/.test(barcode)
}

export function sanitizeBarcode(barcode: string): string {
  return barcode.trim().toUpperCase()
}
```

### Box Number Validation
```typescript
// utils/validators.ts
export function isValidBoxNumber(boxNumber: string): boolean {
  return /^[\w-]{1,50}$/.test(boxNumber.trim())
}

export function sanitizeBoxNumber(boxNumber: string): string {
  // Prevent XSS in CSV output
  return boxNumber.trim().replace(/[<>"]/g, '')
}
```

---

## Error Handling

### Error Types
```typescript
// types/errors.ts
export enum ErrorCode {
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_BARCODE = 'INVALID_BARCODE',
  STORAGE_FULL = 'STORAGE_FULL',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

export interface AppError {
  code: ErrorCode
  message: string
  barcode?: string
  timestamp: Date
}
```

### Error Response Examples
```typescript
// Product not found (FR-011)
{
  code: 'PRODUCT_NOT_FOUND',
  message: 'Barcode "999999999999" not found in database',
  barcode: '999999999999',
  timestamp: new Date()
}

// Database connection failure
{
  code: 'DATABASE_ERROR',
  message: 'Unable to connect to product database',
  timestamp: new Date()
}
```

---

## Data Migrations

### Version 1 (Initial)
- All fields as specified above
- No migrations needed yet

### Future Migration Strategy
```typescript
// utils/migrations.ts
function migrateStoredSessions(data: any): StoredSessions {
  if (!data.version) {
    // Migrate from unversioned to v1
    return {
      version: 1,
      sessions: data.sessions || [],
      lastUpdated: new Date().toISOString()
    }
  }
  return data
}
```

---

## Indexes & Performance

### Database Indexes
- **Primary**: `id` (auto-increment)
- **Unique**: `barcode` (enforces uniqueness, enables fast lookup)
- **Query Performance**: O(log n) lookup via B-tree index on barcode

### Client-Side Lookups
- **Session by ID**: `O(n)` linear search (acceptable for ≤10 sessions)
- **Product in session**: `O(n)` linear search (acceptable for <100 products per session)
- **No additional indexes needed** at current scale

---

## Data Flow Diagram

```
User Scan → onscan.js → useBarcodeScanner()
                              ↓
                        useProductLookup()
                              ↓
                    /api/products/[barcode] (Nitro API)
                              ↓
                        MySQL Query
                              ↓
                    DatabaseProduct → SessionProduct
                              ↓
                        useScanning.addProduct()
                              ↓
                    Update ScanningSession
                              ↓
                    useSessionPersistence.save()
                              ↓
                        localStorage
```

---

## Next Steps

Data model complete. Proceed to:
1. Create API contracts in `contracts/` directory
2. Generate `quickstart.md` for development setup
