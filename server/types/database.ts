// server/types/database.ts
// Database entity interfaces for MySQL product table

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
