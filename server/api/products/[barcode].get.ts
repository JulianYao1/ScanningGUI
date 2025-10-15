// server/api/products/[barcode].get.ts
// API endpoint for product lookup by barcode

import { defineEventHandler, getRouterParam, createError } from 'h3'
import { pool } from '../../utils/database'
import type { DatabaseProduct } from '../../types/database'
import type { RowDataPacket } from 'mysql2'

export default defineEventHandler(async (event) => {
  const barcode = getRouterParam(event, 'barcode')

  if (!barcode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Barcode Format',
      message: 'Barcode parameter is required',
      data: { barcode }
    })
  }

  // Basic validation
  if (barcode.length < 3 || barcode.length > 50) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Barcode Format',
      message: 'Barcode must be 3-50 alphanumeric characters',
      data: { barcode }
    })
  }

  try {
    const [rows] = await pool.execute<(DatabaseProduct & RowDataPacket)[]>(
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
  } catch (error: any) {
    if (error.statusCode) throw error // Re-throw H3 errors

    console.error('Database query error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Database Error',
      message: 'Unable to query product database'
    })
  }
})
