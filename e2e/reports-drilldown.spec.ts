import { test, expect } from '@playwright/test';

/**
 * Reports Page KPI Drilldown E2E Tests
 *
 * Tests the Reports page structure and KPI drilldown functionality.
 * Verifies SnapshotKPIs click → dialog workflow on the Reports page.
 */

test.describe('Reports Page Drilldown', () => {
  // Set a reasonable timeout for API-dependent tests
  test.setTimeout(15000);

  test.beforeEach(async ({ page }) => {
    // Navigate to reports page before each test
    await page.goto('/reports');
    // Wait for the page to fully load
    await expect(page.locator('main')).toBeVisible();
  });

  test.describe('Reports Page Structure', () => {
    test('Reports page loads with Pipeline header', async ({ page }) => {
      // Verify main header
      await expect(page.locator('h1:has-text("Pipeline")')).toBeVisible();
      await expect(page.locator('text=Produktions-Insights')).toBeVisible();
    });

    test('Reports page has DateRangePicker', async ({ page }) => {
      // DateRangePicker should be visible with some date text
      // It's a button/popover with date range display
      const dateRangePicker = page.locator('button').filter({
        hasText: /\d{2}\.\d{2}\.\d{4}/,
      });
      await expect(dateRangePicker.first()).toBeVisible();
    });

    test('FunnelChart and StageDistributionChart are visible', async ({ page }) => {
      // Wait for loading to complete (charts load from API)
      // Look for chart containers or chart elements
      await expect(page.locator('text=Aktueller Stand').first()).toBeVisible({ timeout: 10000 });

      // After loading, charts should be visible
      // Both charts are in the same section
      const chartSection = page.locator('.grid.grid-cols-1.lg\\:grid-cols-2').first();
      await expect(chartSection).toBeVisible();
    });

    test('SnapshotKPIs section is visible with all 4 KPIs', async ({ page }) => {
      // Wait for SnapshotKPIs section header
      await expect(page.locator('h3:has-text("Aktueller Stand")')).toBeVisible({ timeout: 10000 });

      // Verify all 4 SnapshotKPIs are visible
      await expect(page.locator('text=Offene Aufträge').first()).toBeVisible();
      await expect(page.locator('text=Problem-Aufträge').first()).toBeVisible();
      await expect(page.locator('text=Ältester Auftrag').first()).toBeVisible();
      await expect(page.locator('text=Morgen fällig').first()).toBeVisible();
    });

    test('ThroughputChart section is visible', async ({ page }) => {
      // Look for the throughput chart header
      await expect(page.locator('text=Durchfluss Zeitreihe')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Aufträge pro Tag')).toBeVisible();
    });

    test('PLZ-Verteilung section is visible', async ({ page }) => {
      // Look for the PLZ chart header
      await expect(page.locator('text=PLZ-Verteilung')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=Top 10 Lieferregionen')).toBeVisible();
    });

    test('Completed orders collapsible section exists', async ({ page }) => {
      // Look for the collapsible section
      await expect(page.locator('text=Abgeschlossene Aufträge')).toBeVisible();
      await expect(page.locator('text=Alle versendeten Aufträge')).toBeVisible();
    });
  });

  test.describe('SnapshotKPIs Drilldown', () => {
    test('Clicking "Offene Aufträge" KPI opens dialog', async ({ page }) => {
      // Wait for KPIs to load
      await expect(page.locator('h3:has-text("Aktueller Stand")')).toBeVisible({ timeout: 10000 });

      // Find and click the "Offene Aufträge" KPI card (has role="button")
      const offeneKpiCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Offene Aufträge'),
      });
      await offeneKpiCard.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Verify dialog title
      await expect(dialog.locator('text=Offene Aufträge')).toBeVisible();
    });

    test('Clicking "Problem-Aufträge" KPI opens dialog', async ({ page }) => {
      // Wait for KPIs to load
      await expect(page.locator('h3:has-text("Aktueller Stand")')).toBeVisible({ timeout: 10000 });

      // Find and click the "Problem-Aufträge" KPI card
      const problemKpiCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Problem-Aufträge'),
      });
      await problemKpiCard.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Verify dialog title
      await expect(dialog.locator('text=Problem-Aufträge')).toBeVisible();
    });

    test('Clicking "Ältester Auftrag" KPI opens dialog', async ({ page }) => {
      // Wait for KPIs to load
      await expect(page.locator('h3:has-text("Aktueller Stand")')).toBeVisible({ timeout: 10000 });

      // Find and click the "Ältester Auftrag" KPI card
      const oldestKpiCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Ältester Auftrag'),
      });
      await oldestKpiCard.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Verify dialog title contains "Älteste"
      await expect(dialog.locator('text=Älteste Aufträge')).toBeVisible();
    });

    test('Clicking "Morgen fällig" KPI opens dialog', async ({ page }) => {
      // Wait for KPIs to load
      await expect(page.locator('h3:has-text("Aktueller Stand")')).toBeVisible({ timeout: 10000 });

      // Find and click the "Morgen fällig" KPI card
      const tomorrowKpiCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Morgen fällig'),
      });
      await tomorrowKpiCard.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Verify dialog title
      await expect(dialog.locator('text=Morgen fällig')).toBeVisible();
    });

    test('Dialog shows loading state then content', async ({ page }) => {
      // Wait for KPIs to load
      await expect(page.locator('h3:has-text("Aktueller Stand")')).toBeVisible({ timeout: 10000 });

      // Click on a KPI card
      const problemKpiCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Problem-Aufträge'),
      });
      await problemKpiCard.click();

      // Verify dialog opens
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Check for loading, table, or empty message
      const loadingIndicator = dialog.locator('text=Lädt...');
      const table = dialog.locator('table');
      // Use exact match for "Keine Aufträge" to avoid matching the description text
      const emptyMessage = dialog.getByText('Keine Aufträge', { exact: true });

      // Initially one of these should be visible
      await expect(loadingIndicator.or(table).or(emptyMessage)).toBeVisible({ timeout: 5000 });

      // After loading completes, should show either table or empty message
      await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 });
      await expect(table.or(emptyMessage)).toBeVisible({ timeout: 5000 });
    });

    test('Dialog can be closed with Escape key', async ({ page }) => {
      // Wait for KPIs to load
      await expect(page.locator('h3:has-text("Aktueller Stand")')).toBeVisible({ timeout: 10000 });

      // Open dialog
      const offeneKpiCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Offene Aufträge'),
      });
      await offeneKpiCard.click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Press Escape to close
      await page.keyboard.press('Escape');

      // Verify dialog is closed
      await expect(dialog).not.toBeVisible({ timeout: 2000 });
    });

    test('Dialog shows order list when orders exist', async ({ page }) => {
      // Wait for KPIs to load
      await expect(page.locator('h3:has-text("Aktueller Stand")')).toBeVisible({ timeout: 10000 });

      // Open dialog for Offene Aufträge (most likely to have orders)
      const offeneKpiCard = page.locator('[role="button"]').filter({
        has: page.locator('text=Offene Aufträge'),
      });
      await offeneKpiCard.click();

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

  test.describe('Collapsible Section', () => {
    test('Completed orders section can be expanded', async ({ page }) => {
      // Find the collapsible header button
      const collapsibleHeader = page.locator('button').filter({
        has: page.locator('text=Abgeschlossene Aufträge'),
      });
      await expect(collapsibleHeader).toBeVisible();

      // Before expanding, check the chevron icon direction (ChevronDown when collapsed)
      const chevronDown = collapsibleHeader.locator('svg.lucide-chevron-down');
      await expect(chevronDown).toBeVisible();

      // Click to expand
      await collapsibleHeader.click();

      // After expanding, the chevron should change to up (ChevronUp when expanded)
      const chevronUp = collapsibleHeader.locator('svg.lucide-chevron-up');
      await expect(chevronUp).toBeVisible({ timeout: 3000 });
    });

    test('Completed orders section can be collapsed', async ({ page }) => {
      // Find the collapsible header button
      const collapsibleHeader = page.locator('button').filter({
        has: page.locator('text=Abgeschlossene Aufträge'),
      });
      await expect(collapsibleHeader).toBeVisible();

      // Click to expand first
      await collapsibleHeader.click();

      // Wait for chevron to change to up (expanded state)
      const chevronUp = collapsibleHeader.locator('svg.lucide-chevron-up');
      await expect(chevronUp).toBeVisible({ timeout: 3000 });

      // Click again to collapse
      await collapsibleHeader.click();

      // Chevron should change back to down (collapsed state)
      const chevronDown = collapsibleHeader.locator('svg.lucide-chevron-down');
      await expect(chevronDown).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe('DateRangePicker Interaction', () => {
    test('DateRangePicker opens popover on click', async ({ page }) => {
      // Find the DateRangePicker button
      const dateButton = page
        .locator('button')
        .filter({
          hasText: /\d{2}\.\d{2}\.\d{4}/,
        })
        .first();
      await expect(dateButton).toBeVisible();

      // Click to open popover
      await dateButton.click();

      // Popover should open with calendar or date options
      // Look for popover content or calendar elements
      const popover = page.locator('[role="dialog"], [data-radix-popper-content-wrapper]');
      await expect(popover.first()).toBeVisible({ timeout: 2000 });
    });
  });
});
