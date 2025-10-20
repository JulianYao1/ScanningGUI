/**
 * Picklist Export Composable
 *
 * Handles TXT generation and download for scanning sessions
 * Implements FR-013: Download picklist file capability
 */

import type { ScanningSession } from '~/types/scanning'
import { generateTxt, generateFilename } from '~/utils/csvFormatter'

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
   * Generates TXT content from a session
   */
  const generateTxtContent = (session: ScanningSession): string => {
    return generateTxt(session)
  }

  /**
   * Triggers browser download of TXT file
   * Uses Blob API and anchor element download
   */
  const downloadTxt = (session: ScanningSession): void => {
    try {
      state.isExporting = true
      state.error = null

      // Generate TXT content
      const txtContent = generateTxtContent(session)

      // Create Blob with TXT content
      const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' })

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
      console.error('Failed to download TXT:', error)
      state.error = error instanceof Error ? error.message : 'Failed to download TXT'
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
   * Gets a preview of TXT content (first 15 rows)
   * Useful for testing or showing preview to user
   */
  const previewTxt = (session: ScanningSession, maxRows: number = 15): string => {
    const txtContent = generateTxtContent(session)
    const lines = txtContent.split('\n')
    const previewLines = lines.slice(0, maxRows)
    return previewLines.join('\n')
  }

  return {
    state: readonly(state),
    isExporting: computed(() => state.isExporting),
    error: computed(() => state.error),
    generateTxtContent,
    downloadTxt,
    canExport,
    previewTxt
  }
}
