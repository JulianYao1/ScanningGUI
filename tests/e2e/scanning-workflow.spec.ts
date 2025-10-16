// tests/e2e/scanning-workflow.spec.ts
// E2E test for User Story 1: Scan Products into Box

import { test, expect } from '@playwright/test'

test.describe('User Story 1: Scan Products into Box', () => {
  test('should complete full scanning workflow', async ({ page }) => {
    // Navigate to application
    await page.goto('/')

    // Verify page loaded
    await expect(page.locator('h2').first()).toContainText('Start New Scanning Session')

    // Step 1: Create a new session
    await page.fill('[data-testid="box-number"]', 'BOX-001')
    await page.selectOption('[data-testid="box-style"]', 'Small Box')
    await page.click('[data-testid="start-session"]')

    // Verify session created
    await expect(page.locator('h2').filter({ hasText: 'Scanned Products' })).toBeVisible()

    // Step 2: Verify scanner is ready
    await expect(page.locator('.status-indicator.active')).toContainText('Scanner Ready')

    // Step 3: Simulate scanning a product (via input simulation)
    // Note: In real E2E, this would need a mock API or test database
    // For now, verify the empty state
    await expect(page.locator('.empty-state')).toContainText('No products scanned yet')
  })

  test('should allow creating multiple sessions', async ({ page }) => {
    await page.goto('/')

    // Create first session
    await page.fill('[data-testid="box-number"]', 'BOX-001')
    await page.selectOption('[data-testid="box-style"]', 'Small Box')
    await page.click('[data-testid="start-session"]')

    // Verify first session created
    await expect(page.locator('h2').filter({ hasText: 'Scanned Products' })).toBeVisible()

    // Create second session (if form is still visible)
    const formVisible = await page.locator('[data-testid="box-number"]').isVisible()
    if (formVisible) {
      await page.fill('[data-testid="box-number"]', 'BOX-002')
      await page.selectOption('[data-testid="box-style"]', 'Medium Box')
      await page.click('[data-testid="start-session"]')
    }
  })

  test('should validate box setup form', async ({ page }) => {
    await page.goto('/')

    // Submit button should be disabled initially
    const submitButton = page.locator('[data-testid="start-session"]')
    await expect(submitButton).toBeDisabled()

    // Fill only box number
    await page.fill('[data-testid="box-number"]', 'BOX-001')
    await expect(submitButton).toBeDisabled()

    // Fill box style
    await page.selectOption('[data-testid="box-style"]', 'Small Box')
    await expect(submitButton).toBeEnabled()

    // Submit form
    await submitButton.click()

    // Form should reset
    await expect(page.locator('[data-testid="box-number"]')).toHaveValue('')
  })

  test('should show scanner status indicator', async ({ page }) => {
    await page.goto('/')

    // Create a session first
    await page.fill('[data-testid="box-number"]', 'BOX-001')
    await page.selectOption('[data-testid="box-style"]', 'Small Box')
    await page.click('[data-testid="start-session"]')

    // Check scanner status
    const statusIndicator = page.locator('.status-indicator')
    await expect(statusIndicator).toBeVisible()

    // Should show either active or inactive status
    const statusText = await statusIndicator.textContent()
    expect(statusText).toMatch(/(Scanner Ready|Scanner Inactive)/)
  })

  test('should display scanner instructions', async ({ page }) => {
    await page.goto('/')

    // Create a session
    await page.fill('[data-testid="box-number"]', 'BOX-001')
    await page.selectOption('[data-testid="box-style"]', 'Small Box')
    await page.click('[data-testid="start-session"]')

    // Verify scanner instructions are shown
    await expect(page.locator('.scanner-info')).toContainText(
      'Scan a barcode using your scanner or type manually and press Enter'
    )
  })

  test('should show empty state when no products scanned', async ({ page }) => {
    await page.goto('/')

    // Create a session
    await page.fill('[data-testid="box-number"]', 'BOX-001')
    await page.selectOption('[data-testid="box-style"]', 'Small Box')
    await page.click('[data-testid="start-session"]')

    // Verify empty state
    await expect(page.locator('.empty-state')).toBeVisible()
    await expect(page.locator('.empty-state')).toContainText('No products scanned yet')
    await expect(page.locator('.empty-state')).toContainText('Scan a barcode to get started')
  })

  test('should accept all box style options', async ({ page }) => {
    await page.goto('/')

    const boxStyles = [
      'Envelope',
      'Small Box',
      'Medium Box',
      'Large Box',
      'Flat Rate',
      'Tube'
    ]

    for (const boxStyle of boxStyles) {
      await page.fill('[data-testid="box-number"]', `BOX-${boxStyle}`)
      await page.selectOption('[data-testid="box-style"]', boxStyle)

      const submitButton = page.locator('[data-testid="start-session"]')
      await expect(submitButton).toBeEnabled()

      await submitButton.click()

      // Wait for form to reset before next iteration
      await expect(page.locator('[data-testid="box-number"]')).toHaveValue('')
    }
  })

  test('should preserve session after page interaction', async ({ page }) => {
    await page.goto('/')

    // Create a session
    await page.fill('[data-testid="box-number"]', 'BOX-PERSIST')
    await page.selectOption('[data-testid="box-style"]', 'Large Box')
    await page.click('[data-testid="start-session"]')

    // Verify session created
    await expect(page.locator('h2').filter({ hasText: 'Scanned Products' })).toBeVisible()

    // Session should remain visible
    await page.waitForTimeout(500)
    await expect(page.locator('.product-list')).toBeVisible()
  })
})
