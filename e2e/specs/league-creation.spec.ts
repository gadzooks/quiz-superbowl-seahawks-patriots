import { test, expect } from '@playwright/test';

import { TEST_GAME_ID } from '../helpers/test-data';

/**
 * League Creation Flow Tests
 *
 * NOTE: These tests run against a REAL InstantDB instance.
 * Make sure VITE_INSTANTDB_APP_ID is set to a test database.
 */

test.describe('League Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up localStorage to bypass team picker and clear other data
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('supportedTeam', 'sea'); // Seahawks (key from theme/apply.ts)
    });
  });

  test('should show league creation form on game home', async ({ page }) => {
    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');

    // Should show league creation screen
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByPlaceholder(/league name/i)).toBeVisible();
  });

  test('should allow creating a new league', async ({ page }) => {
    const leagueName = `E2E Test ${Date.now()}`;

    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');

    // Wait for league creation form to be visible
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });

    // Fill in league name
    await page.getByPlaceholder(/league name/i).fill(leagueName);

    // Submit league creation
    await page.getByRole('button', { name: /create league/i }).click();

    // Should navigate to the new league
    await page.waitForURL(new RegExp(`/superbowl/${TEST_GAME_ID}/[^/]+`), { timeout: 10000 });

    // Should show team entry screen
    await expect(page.getByRole('heading', { name: /enter.*team name/i })).toBeVisible({
      timeout: 10000,
    });
  });
});
