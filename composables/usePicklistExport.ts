/**
 * Picklist Export Composable
 *
 * Handles CSV generation and download for scanning sessions
 * Implements FR-013: Download picklist file capability
 */

import type { ScanningSession } from '~/types/scanning'
import { generateCsv, generateFilename } from '~/utils/csvFormatter'

export interface ExportState {
  isExporting: boolean
  error: string | null
}

export function usePicklistExport() {
  const state = reactive<ExportState>({
    isExporting: false,
    error: null
  })

  /**
   * Generates CSV content from a session
   */
  const generateCsvContent = (session: ScanningSession): string => {
    return generateCsv(session)
  }

  /**
   * Triggers browser download of CSV file
   * Uses Blob API and anchor element download
   */
  const downloadCsv = (session: ScanningSession): void => {
    try {
      state.isExporting = true
      state.error = null

      // Generate CSV content
      const csvContent = generateCsvContent(session)

      // Create Blob with CSV content
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

      // Generate filename
      const filename = generateFilename(session)

      // Create download link
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download CSV:', error)
      state.error = error instanceof Error ? error.message : 'Failed to download CSV'
    } finally {
      state.isExporting = false
    }
  }

  /**
   * Validates if a session can be exported
   * - Must have at least one product
   * - Must have box number and style
   */
  const canExport = (session: ScanningSession | null): boolean => {
    if (!session) return false
    if (!session.boxNumber || !session.boxStyle) return false
    if (!session.products || session.products.length === 0) return false
    return true
  }

  /**
   * Gets a preview of CSV content (first 5 rows)
   * Useful for testing or showing preview to user
   */
  const previewCsv = (session: ScanningSession, maxRows: number = 5): string => {
    const csvContent = generateCsvContent(session)
    const lines = csvContent.split('\n')
    const previewLines = lines.slice(0, maxRows + 1) // +1 for header
    return previewLines.join('\n')
  }

  return {
    state: readonly(state),
    isExporting: computed(() => state.isExporting),
    error: computed(() => state.error),
    generateCsvContent,
    downloadCsv,
    canExport,
    previewCsv
  }
}
