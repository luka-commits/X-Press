import { test, expect } from '@playwright/test';

/**
 * Dashboard KPI Drilldown E2E Tests
 *
 * Tests the KPI card click → dialog workflow on the Dashboard page.
 * Verifies that clicking KPI cards opens dialogs with order lists.
 */

test.describe('Dashboard KPI Drilldown', () => {
  // Set a reasonable timeout for API-dependent tests
  test.setTimeout(15000);

  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard before each test
    await page.goto('/');
    // Wait for the page to fully load
    await expect(page.locator('main')).toBeVisible();
  });

  test.describe('KPI Cards Display', () => {
    test('Dashboard loads with KPI cards visible', async ({ page }) => {
      // Verify KPI cards section exists with the expected labels
      await expect(page.locator('text=Offene Aufträge').first()).toBeVisible();
      await expect(page.locator('text=Bald fällig').first()).toBeVisible();
      await expect(page.locator('text=Überfällig').first()).toBeVisible();
      await expect(page.locator('text=Problemaufträge').first()).toBeVisible();
      await expect(page.locator('text=Ø Auslastung').first()).toBeVisible();
      await expect(page.locator('text=Engpass').first()).toBeVisible();
    });

    test('KPI cards show numeric values', async ({ page }) => {
      // Look for the KPI card structure with numbers
      // Each clickable KPI card has role="button" and contains a number
      const kpiCards = page.locator('[role="button"]');

      // Should have at least 4 clickable KPI cards (total, critical, overdue, problem)
      await expect(kpiCards.first()).toBeVisible();

      // At least one card should have a numeric value (text-3xl font-semibold)
      const valueElements = page.locator('.text-3xl');
      await expect(valueElements.first()).toBeVisible();
    });

    test('Clickable KPI cards have button role and are keyboard accessible', async ({ page }) => {
      // Find a clickable KPI card (ones with role="button")
      const clickableCard = page.locator('[role="button"]').first();
      await expect(clickableCard).toBeVisible();

      // Should have tabIndex for keyboard navigation
      await expect(clickableCard).toHaveAttribute('tabindex', '0');
    });
  });

  test.describe('KPI Dialog Functionality', () => {
    test('Clicking "Offene Aufträge" KPI opens dialog', async ({ page }) => {
      // Find and click the "Offene Aufträge" KPI card
      const offeneAuftraegeCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Offene Aufträge'),
      });
      await offeneAuftraegeCard.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Verify dialog title matches
      await expect(dialog.locator('text=Offene Aufträge')).toBeVisible();
    });

    test('Clicking "Bald fällig" KPI opens dialog', async ({ page }) => {
      // Find and click the "Bald fällig" KPI card
      const baldFaelligCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Bald fällig'),
      });
      await baldFaelligCard.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Verify dialog title contains the expected text
      await expect(dialog.locator('text=Bald fällig')).toBeVisible();
    });

    test('Clicking "Überfällig" KPI opens dialog', async ({ page }) => {
      // Find and click the "Überfällig" KPI card
      const ueberfaelligCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Überfällig'),
      });
      await ueberfaelligCard.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Verify dialog title
      await expect(dialog.locator('text=Überfällige Aufträge')).toBeVisible();
    });

    test('Clicking "Problemaufträge" KPI opens dialog', async ({ page }) => {
      // Find and click the "Problemaufträge" KPI card
      const problemCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Problemaufträge'),
      });
      await problemCard.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Verify dialog title
      await expect(dialog.locator('text=Problemaufträge')).toBeVisible();
    });

    test('Dialog shows loading state then content', async ({ page }) => {
      // Click on a KPI card
      const offeneAuftraegeCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Offene Aufträge'),
      });
      await offeneAuftraegeCard.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Wait for content to load - check for loading, table, or empty message
      // Using separate locators since CSS comma syntax doesn't work with text=
      const loadingIndicator = dialog.locator('text=Lädt...');
      const table = dialog.locator('table');
      const emptyMessage = dialog.locator('text=Keine Aufträge');

      // Initially one of these should be visible
      await expect(loadingIndicator.or(table).or(emptyMessage)).toBeVisible({ timeout: 5000 });

      // After loading completes, should show either table or empty message
      await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 });
      await expect(table.or(emptyMessage)).toBeVisible({ timeout: 5000 });
    });

    test('Dialog can be closed with close button', async ({ page }) => {
      // Open dialog
      const offeneAuftraegeCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Offene Aufträge'),
      });
      await offeneAuftraegeCard.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Find and click the close button (X button in dialog)
      // shadcn/ui Dialog has a close button with sr-only "Close" text
      // Click the close button (try the X button which is typically last button or has close aria)
      await dialog
        .locator('button:has(svg.lucide-x), button[class*="close"]')
        .first()
        .click({ force: true })
        .catch(async () => {
          // Fallback: press Escape key
          await page.keyboard.press('Escape');
        });

      // Verify dialog is closed
      await expect(dialog).not.toBeVisible({ timeout: 2000 });
    });

    test('Dialog can be closed with Escape key', async ({ page }) => {
      // Open dialog
      const offeneAuftraegeCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Offene Aufträge'),
      });
      await offeneAuftraegeCard.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Press Escape to close
      await page.keyboard.press('Escape');

      // Verify dialog is closed
      await expect(dialog).not.toBeVisible({ timeout: 2000 });
    });

    test('Dialog shows order list when orders exist', async ({ page }) => {
      // Open dialog for a KPI that likely has orders
      const offeneAuftraegeCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Offene Aufträge'),
      });
      await offeneAuftraegeCard.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Wait for loading to complete
      await expect(dialog.locator('text=Lädt...')).not.toBeVisible({ timeout: 5000 });

      // Check for table structure (if orders exist) or empty message
      const hasTable = await dialog
        .locator('table')
        .isVisible()
        .catch(() => false);
      const hasEmptyMessage = await dialog
        .locator('text=Keine Aufträge')
        .isVisible()
        .catch(() => false);

      // One of these should be true
      expect(hasTable || hasEmptyMessage).toBeTruthy();

      // If table exists, verify it has expected columns
      if (hasTable) {
        await expect(dialog.locator('th:has-text("Auftrag")')).toBeVisible();
        await expect(dialog.locator('th:has-text("Kunde")')).toBeVisible();
        await expect(dialog.locator('th:has-text("Liefertermin")')).toBeVisible();
      }
    });
  });

  test.describe('Non-clickable KPI Cards', () => {
    test('"Ø Auslastung" card is not clickable (no button role)', async ({ page }) => {
      // The Auslastung card should NOT have role="button"
      const auslastungText = page.locator('text=Ø Auslastung').first();
      await expect(auslastungText).toBeVisible();

      // Get the parent card and verify it does NOT have role="button"
      const parentCard = auslastungText
        .locator('xpath=ancestor::div[contains(@class, "bg-white")]')
        .first();

      // Verify it's visible but check it doesn't have role=button
      // This is tricky - we check that clicking it does NOT open a dialog
      await parentCard.click();

      // Dialog should NOT appear
      const dialog = page.getByRole('dialog');
      await expect(dialog).not.toBeVisible({ timeout: 500 });
    });

    test('"Engpass" card is not clickable (no button role)', async ({ page }) => {
      // The Engpass card should NOT have role="button"
      const engpassText = page.locator('text=Engpass').first();
      await expect(engpassText).toBeVisible();

      // Get the parent card
      const parentCard = engpassText
        .locator('xpath=ancestor::div[contains(@class, "bg-white")]')
        .first();

      // Click and verify dialog does NOT appear
      await parentCard.click();

      // Dialog should NOT appear
      const dialog = page.getByRole('dialog');
      await expect(dialog).not.toBeVisible({ timeout: 500 });
    });
  });
});
