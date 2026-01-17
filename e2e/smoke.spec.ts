import { test, expect } from '@playwright/test';

/**
 * Smoke Tests for XOS Dashboard
 *
 * These tests verify that all main pages load correctly.
 * They do not test functionality in depth, only that pages are accessible
 * and render key elements.
 */

test.describe('Smoke Tests', () => {
  // Set a reasonable timeout for page loads
  test.setTimeout(10000);

  test('Dashboard (/) loads with KPI cards and title', async ({ page }) => {
    await page.goto('/');

    // Verify page title
    await expect(page).toHaveTitle(/XOS Dashboard/);

    // Verify main layout is rendered (KPI section or week statistics)
    // Look for the dashboard content - either KPI cards or week statistics header
    await expect(page.locator('main')).toBeVisible();

    // Check for week statistics section (shows "Woche X" or "Aufträge")
    const dashboardContent = page.locator('text=/Woche|Aufträge/');
    await expect(dashboardContent.first()).toBeVisible();
  });

  test('Status (/status) loads with search input', async ({ page }) => {
    await page.goto('/status');

    // Verify page loads
    await expect(page).toHaveTitle(/XOS Dashboard/);

    // Verify search input is present
    const searchInput = page.locator(
      'input[placeholder*="Auftragsnummer"], input[placeholder*="Kunde"]'
    );
    await expect(searchInput).toBeVisible();

    // Verify search input is focusable
    await searchInput.click();
    await expect(searchInput).toBeFocused();
  });

  test('Orders (/orders) loads with table or list', async ({ page }) => {
    await page.goto('/orders');

    // Verify page loads
    await expect(page).toHaveTitle(/XOS Dashboard/);

    // Verify main layout is rendered
    await expect(page.locator('main')).toBeVisible();

    // Look for the search input in orders page
    const searchInput = page.locator('input[type="text"]');
    await expect(searchInput.first()).toBeVisible();

    // Look for filter elements or table structure
    const tableOrFilters = page.locator('table, [data-testid="order-filters"], select');
    await expect(tableOrFilters.first()).toBeVisible();
  });

  test('Versand (/versand) loads with shipping overview', async ({ page }) => {
    await page.goto('/versand');

    // Verify page loads
    await expect(page).toHaveTitle(/XOS Dashboard/);

    // Verify main layout is rendered
    await expect(page.locator('main')).toBeVisible();

    // Check for Versand-specific header text
    const versandHeader = page.locator('text=Versand');
    await expect(versandHeader.first()).toBeVisible();
  });

  test('Reports (/reports) loads with reports dashboard', async ({ page }) => {
    await page.goto('/reports');

    // Verify page loads
    await expect(page).toHaveTitle(/XOS Dashboard/);

    // Verify main layout is rendered
    await expect(page.locator('main')).toBeVisible();

    // Check for Reports header text
    const reportsHeader = page.locator('text=Reports');
    await expect(reportsHeader.first()).toBeVisible();
  });
});
