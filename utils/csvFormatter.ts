/**
 * CSV Formatter Utility
 *
 * Generates CSV files with proper escaping and Excel compatibility.
 * Per FR-013: CSV format with columns: Box Number, Box Style, Barcode,
 * Product Name, SKU, Quantity, Unit Price, Total Price
 */

import type { ScanningSession, SessionProduct } from '~/types/scanning'

export interface CsvRow {
  boxNumber: string
  boxStyle: string
  barcode: string
  productName: string
  sku: string
  quantity: number
  unitPrice: string
  totalPrice: string
}

/**
 * Escapes a field value for CSV format
 * - Wraps in quotes if contains comma, quote, or newline
 * - Doubles any internal quotes
 */
export function escapeCsvField(value: string | number): string {
  const str = String(value)

  // Check if escaping is needed
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    // Double any existing quotes and wrap in quotes
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Formats a number as currency string (2 decimal places)
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) {
    return ''
  }
  return price.toFixed(2)
}

/**
 * Converts a session to CSV row objects
 */
export function sessionToCsvRows(session: ScanningSession): CsvRow[] {
  return session.products.map((product: SessionProduct) => {
    const unitPrice = product.price ?? 0
    const totalPrice = product.price ? product.price * product.quantity : 0

    return {
      boxNumber: session.boxNumber,
      boxStyle: session.boxStyle,
      barcode: product.barcode,
      productName: product.name,
      sku: product.sku,
      quantity: product.quantity,
      unitPrice: formatPrice(product.price),
      totalPrice: formatPrice(product.price ? totalPrice : undefined)
    }
  })
}

/**
 * Generates CSV content from session data
 * Includes UTF-8 BOM for Excel compatibility
 */
export function generateCsv(session: ScanningSession): string {
  const rows = sessionToCsvRows(session)

  // CSV header
  const headers = [
    'Box Number',
    'Box Style',
    'Barcode',
    'Product Name',
    'SKU',
    'Quantity',
    'Unit Price',
    'Total Price'
  ]

  // Build CSV lines
  const csvLines: string[] = []

  // Add header row
  csvLines.push(headers.map(escapeCsvField).join(','))

  // Add data rows
  rows.forEach(row => {
    const line = [
      escapeCsvField(row.boxNumber),
      escapeCsvField(row.boxStyle),
      escapeCsvField(row.barcode),
      escapeCsvField(row.productName),
      escapeCsvField(row.sku),
      escapeCsvField(row.quantity),
      escapeCsvField(row.unitPrice),
      escapeCsvField(row.totalPrice)
    ].join(',')

    csvLines.push(line)
  })

  // Join with newlines
  const csvContent = csvLines.join('\n')

  // Add UTF-8 BOM for Excel compatibility (per T030)
  return '\ufeff' + csvContent
}

/**
 * Generates filename for picklist download
 * Format: picklist_BOX-NUMBER_YYYY-MM-DD_HH-MM-SS.csv
 */
export function generateFilename(session: ScanningSession): string {
  const timestamp = new Date().toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .split('.')[0] // Remove milliseconds

  const sanitizedBoxNumber = session.boxNumber.replace(/[^a-zA-Z0-9-_]/g, '_')

  return `picklist_${sanitizedBoxNumber}_${timestamp}.csv`
}
