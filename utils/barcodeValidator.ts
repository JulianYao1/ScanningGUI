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

  // UPC-A: exactly 12 digits
  if (/^\d{12}$/.test(trimmed)) {
    return true
  }

  // EAN-13: exactly 13 digits
  if (/^\d{13}$/.test(trimmed)) {
    return true
  }

  // Code128: 3-50 alphanumeric characters (but not purely numeric as those are handled above)
  if (/^[\w-]{3,50}$/.test(trimmed) && !/^\d+$/.test(trimmed)) {
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
