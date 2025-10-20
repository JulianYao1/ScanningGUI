/**
 * TXT Formatter Utility
 *
 * Generates TXT files for picklist exports.
 * Per FR-013: Text format with columns: Box Number, Box Style, Barcode,
 * Product Name, SKU, Quantity, Unit Price, Total Price
 */

import type { ScanningSession, SessionProduct } from '~/types/scanning'

export interface PicklistRow {
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
 * Formats a number as currency string (2 decimal places)
 */
export function formatPrice(price: number | undefined): string {
  if (price === undefined || price === null) {
    return ''
  }
  return price.toFixed(2)
}

/**
 * Converts a session to picklist row objects
 */
export function sessionToPicklistRows(session: ScanningSession): PicklistRow[] {
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
 * Generates TXT content from session data
 * Creates a formatted text file with tab-separated values
 */
export function generateTxt(session: ScanningSession): string {
  const rows = sessionToPicklistRows(session)

  // Build text lines
  const txtLines: string[] = []

  // Add header
  txtLines.push('PICKLIST')
  txtLines.push('=' .repeat(80))
  txtLines.push('')
  txtLines.push(`Box Number: ${session.boxNumber}`)
  txtLines.push(`Box Style: ${session.boxStyle}`)
  txtLines.push(`Date: ${new Date().toLocaleString()}`)
  txtLines.push(`Total Products: ${session.products.length}`)
  txtLines.push('')
  txtLines.push('=' .repeat(80))
  txtLines.push('')

  // Add column headers
  txtLines.push('Barcode\t\tProduct Name\t\tSKU\t\tQty\tUnit Price\tTotal Price')
  txtLines.push('-' .repeat(80))

  // Add data rows
  rows.forEach(row => {
    const line = `${row.barcode}\t\t${row.productName}\t\t${row.sku}\t\t${row.quantity}\t${row.unitPrice}\t${row.totalPrice}`
    txtLines.push(line)
  })

  // Add footer
  txtLines.push('')
  txtLines.push('=' .repeat(80))

  // Calculate totals
  const totalItems = rows.reduce((sum, row) => sum + row.quantity, 0)
  const totalPrice = rows.reduce((sum, row) => {
    const price = parseFloat(row.totalPrice) || 0
    return sum + price
  }, 0)

  txtLines.push(`Total Items: ${totalItems}`)
  if (totalPrice > 0) {
    txtLines.push(`Total Price: $${totalPrice.toFixed(2)}`)
  }
  txtLines.push('=' .repeat(80))

  return txtLines.join('\n')
}

/**
 * Generates filename for picklist download
 * Format: picklist_BOX-NUMBER_YYYY-MM-DD_HH-MM-SS.txt
 */
export function generateFilename(session: ScanningSession): string {
  const timestamp = new Date().toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .split('.')[0] // Remove milliseconds

  const sanitizedBoxNumber = session.boxNumber.replace(/[^a-zA-Z0-9-_]/g, '_')

  return `picklist_${sanitizedBoxNumber}_${timestamp}.txt`
}
