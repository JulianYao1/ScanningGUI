// utils/barcodeValidator.ts
// Barcode validation and sanitization utilities

/**
 * Validates barcode format
 * Supports UPC-A (12 digits), EAN-13 (13 digits), and Code128 (3-50 alphanumeric)
 */
export function isValidBarcode(barcode: string): boolean {
  if (!barcode || typeof barcode !== 'string') {
    return false
  }

  const trimmed = barcode.trim()

  // UPC-A: 12 digits
  // EAN-13: 13 digits
  if (/^\d{12,13}$/.test(trimmed)) {
    return true
  }

  // Code128: 3-50 alphanumeric characters
  if (/^[\w-]{3,50}$/.test(trimmed)) {
    return true
  }

  return false
}

/**
 * Sanitizes barcode input by trimming whitespace and normalizing case
 */
export function sanitizeBarcode(barcode: string): string {
  return barcode.trim().toUpperCase()
}
