/**
 * Date Formatter Utility
 *
 * Provides consistent date and time formatting for the application
 */

/**
 * Formats a date as a readable string (e.g., "Jan 15, 2025")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Formats a date and time as a readable string (e.g., "Jan 15, 2025 2:30 PM")
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Formats a time as a readable string (e.g., "2:30 PM")
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Formats a date as a relative time string (e.g., "2 minutes ago", "just now")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 10) {
    return 'just now'
  } else if (diffSec < 60) {
    return `${diffSec} seconds ago`
  } else if (diffMin < 60) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`
  } else if (diffHour < 24) {
    return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`
  } else if (diffDay < 7) {
    return diffDay === 1 ? '1 day ago' : `${diffDay} days ago`
  } else {
    return formatDate(d)
  }
}

/**
 * Formats a date as an ISO string for API requests
 */
export function formatISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString()
}

/**
 * Formats a date for file names (e.g., "2025-01-15_14-30-00")
 */
export function formatForFilename(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}
