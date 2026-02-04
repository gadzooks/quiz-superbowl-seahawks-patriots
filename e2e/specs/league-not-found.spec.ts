import { test, expect } from '@playwright/test';

import { TEST_GAME_ID } from '../helpers/test-data';

/**
 * League Not Found Tests
 *
 * NOTE: These tests run against a REAL InstantDB instance.
 * The tests use a non-existent league slug that should never exist in the database.
 */

test.describe('League Not Found', () => {
  test.beforeEach(async ({ page }) => {
    // Set up localStorage to bypass team picker
    // The app shows a team picker on first visit, we need to skip it for testing
    await page.addInitScript(() => {
      localStorage.setItem('supportedTeam', 'sea'); // Seahawks (key from theme/apply.ts)
    });
  });

  test('should show "League Not Found" screen for non-existent league', async ({ page }) => {
    const gameId = TEST_GAME_ID;
    // Use a highly unlikely slug that won't exist in test database
    const nonExistentSlug = `nonexistent-league-${Date.now()}`;

    // Navigate to non-existent league
    await page.goto(`/superbowl/${gameId}/${nonExistentSlug}`);

    // Wait for the page to finish loading and check what screen is shown
    await page.waitForLoadState('networkidle');

    // Verify league not found screen appears
    await expect(page.getByRole('heading', { name: /league not found/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(nonExistentSlug)).toBeVisible();

    // Verify loading spinner is not visible
    await expect(page.locator('.loading-spinner')).not.toBeVisible();
  });

  test('should navigate to game home when clicking "Create a New League"', async ({ page }) => {
    const gameId = TEST_GAME_ID;
    const nonExistentSlug = `nonexistent-league-${Date.now()}`;

    await page.goto(`/superbowl/${gameId}/${nonExistentSlug}`);
    await page.waitForLoadState('networkidle');

    // Wait for not found screen
    await expect(page.getByRole('heading', { name: /league not found/i })).toBeVisible({
      timeout: 15000,
    });

    // Click "Create a New League"
    await page.getByRole('button', { name: /create.*new league/i }).click();

    // Should navigate to game home and show league creation form
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should clear localStorage when league is not found', async ({ page }) => {
    const gameId = TEST_GAME_ID;
    const nonExistentSlug = `nonexistent-league-${Date.now()}`;

    // Pre-populate localStorage with stale league (add to init script)
    await page.addInitScript((slug) => {
      localStorage.setItem('currentLeagueSlug', slug);
    }, nonExistentSlug);

    // Navigate to non-existent league
    await page.goto(`/superbowl/${gameId}/${nonExistentSlug}`);
    await page.waitForLoadState('networkidle');

    // Verify not found screen appears
    await expect(page.getByRole('heading', { name: /league not found/i })).toBeVisible({
      timeout: 15000,
    });

    // Verify localStorage was cleared
    const storedSlug = await page.evaluate(() => localStorage.getItem('currentLeagueSlug'));
    expect(storedSlug).toBeNull();
  });

  test('should show correct slug in error message', async ({ page }) => {
    const gameId = TEST_GAME_ID;
    const nonExistentSlug = `test-missing-league-${Date.now()}`;

    await page.goto(`/superbowl/${gameId}/${nonExistentSlug}`);
    await page.waitForLoadState('networkidle');

    // Verify the error message contains the correct slug
    await expect(page.getByRole('heading', { name: /league not found/i })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(nonExistentSlug)).toBeVisible();
  });
});
