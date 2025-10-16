// types/errors.ts
// Application error types and codes

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
  retryable?: boolean
}
