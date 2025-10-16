// types/scanning.ts
// Core entity interfaces for scanning session management

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
