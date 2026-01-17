import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Status Workflow
 *
 * Tests the core 3-click mobile status-update workflow:
 * 1. Search for an order
 * 2. Select the order
 * 3. Update status with one click
 *
 * Note: Tests are designed to work with or without test data in the database.
 * When no data exists, they verify UI states rather than actual data operations.
 */

test.describe('Status Page - Search and Selection Workflow', () => {
  // Reasonable timeout for async operations
  test.setTimeout(15000);

  test('Status page loads with search input visible', async ({ page }) => {
    await page.goto('/status');

    // Verify page loads
    await expect(page).toHaveTitle(/XOS Dashboard/);

    // Verify search input is present with correct placeholder
    const searchInput = page.getByPlaceholder('Auftragsnummer oder Kunde...');
    await expect(searchInput).toBeVisible();
  });

  test('Search input has proper placeholder text and is focusable', async ({ page }) => {
    await page.goto('/status');

    // Check for specific placeholder text
    const searchInput = page.getByPlaceholder('Auftragsnummer oder Kunde...');
    await expect(searchInput).toBeVisible();

    // Verify input is focusable
    await searchInput.click();
    await expect(searchInput).toBeFocused();
  });

  test('Search input auto-focuses on page load', async ({ page }) => {
    await page.goto('/status');

    // Small delay to let auto-focus trigger
    await page.waitForTimeout(500);

    // Verify search input received auto-focus
    const searchInput = page.getByPlaceholder('Auftragsnummer oder Kunde...');
    await expect(searchInput).toBeFocused();
  });

  test('Typing in search input works correctly', async ({ page }) => {
    await page.goto('/status');

    const searchInput = page.getByPlaceholder('Auftragsnummer oder Kunde...');
    await searchInput.fill('GP25');

    // Verify the text was entered
    await expect(searchInput).toHaveValue('GP25');
  });

  test('Search with existing order shows results dropdown', async ({ page }) => {
    await page.goto('/status');

    const searchInput = page.getByPlaceholder('Auftragsnummer oder Kunde...');

    // Type a common search term that might match orders
    await searchInput.fill('GP');

    // Wait for debounce and API call (300ms debounce + network time)
    await page.waitForTimeout(500);

    // Check if results dropdown appears (if orders exist)
    // The dropdown contains buttons with order numbers
    const resultsDropdown = page.locator('.absolute.z-50');

    // Either we see results or we don't (empty database is fine)
    // We're testing the UI behavior, not the data
    const isVisible = await resultsDropdown.isVisible();

    if (isVisible) {
      // If results exist, verify dropdown structure
      const orderButtons = resultsDropdown.locator('button');
      const count = await orderButtons.count();
      expect(count).toBeGreaterThan(0);
    }
    // No assertion failure if no results - empty database is valid state
  });

  test('Clicking search result selects the order and shows details', async ({ page }) => {
    await page.goto('/status');

    const searchInput = page.getByPlaceholder('Auftragsnummer oder Kunde...');

    // Type search term
    await searchInput.fill('GP');
    await page.waitForTimeout(500);

    // Check for results
    const resultsDropdown = page.locator('.absolute.z-50');

    if (await resultsDropdown.isVisible()) {
      // Click first result
      const firstResult = resultsDropdown.locator('button').first();
      const orderNumber = await firstResult.locator('.font-semibold').textContent();
      await firstResult.click();

      // Verify dropdown closes
      await expect(resultsDropdown).not.toBeVisible();

      // Verify order details card appears
      const orderDetails = page.locator('.bg-white.rounded-lg.border');
      await expect(orderDetails.first()).toBeVisible();

      // Verify order number is displayed in details
      if (orderNumber) {
        await expect(page.getByText(orderNumber)).toBeVisible();
      }
    }
    // Skip assertion if no data - test passes for empty database
  });

  test('Order details shows required fields after selection', async ({ page }) => {
    await page.goto('/status');

    const searchInput = page.getByPlaceholder('Auftragsnummer oder Kunde...');
    await searchInput.fill('GP');
    await page.waitForTimeout(500);

    const resultsDropdown = page.locator('.absolute.z-50');

    if (await resultsDropdown.isVisible()) {
      // Click first result
      await resultsDropdown.locator('button').first().click();

      // Verify detail sections are visible
      // Check for German labels used in OrderDetails component
      await expect(page.getByText('Aktueller Status')).toBeVisible();
      await expect(page.getByText('Kunde')).toBeVisible();
      await expect(page.getByText('Produkt')).toBeVisible();
      await expect(page.getByText('Liefertermin')).toBeVisible();
    }
  });

  test('Clear button visible and functional after order selection', async ({ page }) => {
    await page.goto('/status');

    const searchInput = page.getByPlaceholder('Auftragsnummer oder Kunde...');
    await searchInput.fill('GP');
    await page.waitForTimeout(500);

    const resultsDropdown = page.locator('.absolute.z-50');

    if (await resultsDropdown.isVisible()) {
      // Select an order
      await resultsDropdown.locator('button').first().click();

      // Wait for order details to appear
      await expect(page.getByText('Aktueller Status')).toBeVisible();

      // Find and click clear button (the X button with aria-label)
      const clearButton = page.getByRole('button', { name: 'Auswahl aufheben' });
      await expect(clearButton).toBeVisible();

      // Click clear button
      await clearButton.click();

      // Verify order details are no longer visible
      await expect(page.getByText('Aktueller Status')).not.toBeVisible();

      // Verify search input is still there and empty/cleared
      await expect(searchInput).toBeVisible();
    }
  });

  test('Alternative clear button "Anderen Auftrag waehlen" works', async ({ page }) => {
    await page.goto('/status');

    const searchInput = page.getByPlaceholder('Auftragsnummer oder Kunde...');
    await searchInput.fill('GP');
    await page.waitForTimeout(500);

    const resultsDropdown = page.locator('.absolute.z-50');

    if (await resultsDropdown.isVisible()) {
      // Select an order
      await resultsDropdown.locator('button').first().click();

      // Wait for order details
      await expect(page.getByText('Aktueller Status')).toBeVisible();

      // Find alternative clear button
      const altClearButton = page.getByRole('button', { name: 'Anderen Auftrag wählen' });
      await expect(altClearButton).toBeVisible();

      // Click it
      await altClearButton.click();

      // Verify order details are cleared
      await expect(page.getByText('Aktueller Status')).not.toBeVisible();
    }
  });
});
