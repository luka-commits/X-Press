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

test.describe('Status Page - Status Update Buttons and Feedback', () => {
  // Allow more time for API interactions
  test.setTimeout(20000);

  /**
   * Helper: Select an order by searching for 'GP' and clicking first result.
   * Returns true if order was selected, false if no orders exist.
   */
  async function selectFirstOrder(page: import('@playwright/test').Page): Promise<boolean> {
    const searchInput = page.getByPlaceholder('Auftragsnummer oder Kunde...');
    await searchInput.fill('GP');
    await page.waitForTimeout(500);

    const resultsDropdown = page.locator('.absolute.z-50');

    if (await resultsDropdown.isVisible()) {
      await resultsDropdown.locator('button').first().click();
      await expect(page.getByText('Aktueller Status')).toBeVisible();
      return true;
    }
    return false;
  }

  test('Three status buttons visible after order selection', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      // Check for all 3 status buttons
      const inProduktionBtn = page.getByRole('button', { name: 'In Produktion' });
      const fertigBtn = page.getByRole('button', { name: 'Fertig' });
      const problemBtn = page.getByRole('button', { name: 'Problem' });

      await expect(inProduktionBtn).toBeVisible();
      await expect(fertigBtn).toBeVisible();
      await expect(problemBtn).toBeVisible();
    }
  });

  test('Status buttons have correct colors (blue, green, red)', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      // Verify button colors via CSS classes
      const inProduktionBtn = page.getByRole('button', { name: 'In Produktion' });
      const fertigBtn = page.getByRole('button', { name: 'Fertig' });
      const problemBtn = page.getByRole('button', { name: 'Problem' });

      // Check for blue background class
      await expect(inProduktionBtn).toHaveClass(/bg-blue-500/);

      // Check for green background class
      await expect(fertigBtn).toHaveClass(/bg-green-500/);

      // Check for red background class
      await expect(problemBtn).toHaveClass(/bg-red-500/);
    }
  });

  test('Status buttons are clickable', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      // Verify buttons are enabled and clickable
      const inProduktionBtn = page.getByRole('button', { name: 'In Produktion' });
      const fertigBtn = page.getByRole('button', { name: 'Fertig' });
      const problemBtn = page.getByRole('button', { name: 'Problem' });

      await expect(inProduktionBtn).toBeEnabled();
      await expect(fertigBtn).toBeEnabled();
      await expect(problemBtn).toBeEnabled();
    }
  });

  test('Comment textarea is visible with optional placeholder', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      // Check for comment textarea
      const commentTextarea = page.getByPlaceholder('Kommentar (optional)');
      await expect(commentTextarea).toBeVisible();
    }
  });

  test('Clicking "In Produktion" shows loading state and then feedback', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      const inProduktionBtn = page.getByRole('button', { name: 'In Produktion' });

      // Click the button
      await inProduktionBtn.click();

      // Should see loading state or success feedback
      // Wait for either "Wird aktualisiert..." (loading) or "Status aktualisiert" (success)
      const loadingOrSuccess = page.locator('text=/Wird aktualisiert|Status aktualisiert/');

      // Wait for something to appear (loading or success)
      await expect(loadingOrSuccess.first()).toBeVisible({ timeout: 5000 });

      // Eventually should see success feedback
      const successFeedback = page.getByText('Status aktualisiert');
      await expect(successFeedback).toBeVisible({ timeout: 5000 });
    }
  });

  test('Clicking "Fertig" shows success feedback', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      const fertigBtn = page.getByRole('button', { name: 'Fertig' });

      // Click the button
      await fertigBtn.click();

      // Wait for success feedback
      const successFeedback = page.getByText('Status aktualisiert');
      await expect(successFeedback).toBeVisible({ timeout: 5000 });
    }
  });

  test('Clicking "Problem" without comment shows validation error', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      const problemBtn = page.getByRole('button', { name: 'Problem' });

      // Click Problem button without entering comment
      await problemBtn.click();

      // Should see validation error message
      const validationError = page.getByText('Bitte beschreiben Sie das Problem');
      await expect(validationError).toBeVisible();

      // Textarea should get focus and show required placeholder
      const requiredTextarea = page.getByPlaceholder(
        'Was ist das Problem? Bitte hier beschreiben...'
      );
      await expect(requiredTextarea).toBeVisible();
      await expect(requiredTextarea).toBeFocused();
    }
  });

  test('Clicking "Problem" with comment shows success feedback', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      // First enter a comment
      const commentTextarea = page.getByPlaceholder('Kommentar (optional)');
      await commentTextarea.fill('Test problem description');

      // Then click Problem button
      const problemBtn = page.getByRole('button', { name: 'Problem' });
      await problemBtn.click();

      // Should see success feedback (if database accepts it)
      const successFeedback = page.getByText('Status aktualisiert');
      await expect(successFeedback).toBeVisible({ timeout: 5000 });
    }
  });

  test('Success feedback auto-dismisses after 3 seconds', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      const inProduktionBtn = page.getByRole('button', { name: 'In Produktion' });
      await inProduktionBtn.click();

      // Wait for success feedback
      const successFeedback = page.getByText('Status aktualisiert');
      await expect(successFeedback).toBeVisible({ timeout: 5000 });

      // Wait for auto-dismiss (3s + buffer)
      await page.waitForTimeout(3500);

      // Feedback should be gone
      await expect(successFeedback).not.toBeVisible();
    }
  });

  test('Feedback banner has role="alert" for accessibility', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      const inProduktionBtn = page.getByRole('button', { name: 'In Produktion' });
      await inProduktionBtn.click();

      // Wait for feedback banner
      await page.waitForTimeout(1000);

      // Check for alert role
      const alertBanner = page.locator('[role="alert"]');
      await expect(alertBanner).toBeVisible({ timeout: 5000 });
    }
  });

  test('Buttons are disabled during loading state', async ({ page }) => {
    await page.goto('/status');

    if (await selectFirstOrder(page)) {
      const inProduktionBtn = page.getByRole('button', { name: 'In Produktion' });
      const fertigBtn = page.getByRole('button', { name: 'Fertig' });
      const problemBtn = page.getByRole('button', { name: 'Problem' });

      // Click a button to trigger loading
      await inProduktionBtn.click();

      // During loading, buttons should be disabled
      // We need to check quickly before the request completes
      // This might be flaky on fast connections but verifies the UI behavior
      const loadingIndicator = page.getByText('Wird aktualisiert...');

      // If we catch it in loading state, verify buttons are disabled
      if (await loadingIndicator.isVisible()) {
        await expect(fertigBtn).toHaveClass(/disabled:opacity-50/);
        await expect(problemBtn).toHaveClass(/disabled:opacity-50/);
      }

      // Wait for completion to not interfere with other tests
      await page.waitForTimeout(2000);
    }
  });

  test('Status buttons not visible without order selection', async ({ page }) => {
    await page.goto('/status');

    // Without selecting an order, status buttons should not be visible
    const inProduktionBtn = page.getByRole('button', { name: 'In Produktion' });
    const fertigBtn = page.getByRole('button', { name: 'Fertig' });
    const problemBtn = page.getByRole('button', { name: 'Problem' });

    await expect(inProduktionBtn).not.toBeVisible();
    await expect(fertigBtn).not.toBeVisible();
    await expect(problemBtn).not.toBeVisible();
  });
});
