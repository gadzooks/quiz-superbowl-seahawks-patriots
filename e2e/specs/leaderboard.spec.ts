import { test, expect } from '@playwright/test';

import { waitForAndDismissIntro } from '../helpers/intro-helper';
import { TEST_GAME_ID } from '../helpers/test-data';

/**
 * Leaderboard Tests
 *
 * Tests leaderboard display and tab navigation.
 * NOTE: These tests run against a REAL InstantDB instance.
 *
 * CURRENTLY SKIPPED: Leaderboard data loading has timing/sync issues
 * in the test environment. Database queries may not complete quickly enough
 * for the strict timeouts in these tests.
 */

test.describe.skip('Leaderboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('supportedTeam', 'sea'); // Seahawks
    });
  });

  test('should show leaderboard tab', async ({ page }) => {
    const leagueName = `Leaderboard Test ${Date.now()}`;
    const teamName = 'Test Team';

    // Create league and enter team name
    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /league name/i }).fill(leagueName);
    await page.getByRole('button', { name: /create league/i }).click();

    await expect(page.getByRole('heading', { name: /enter.*team name/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /team name/i }).fill(teamName);
    await page.getByRole('button', { name: /continue/i }).click();

    // Wait for the questions tab to be visible (indicates predictions form loaded)
    await expect(page.getByRole('tab', { name: /questions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay
    await waitForAndDismissIntro(page);

    // Click Scores tab (which contains the leaderboard)
    await page.getByRole('tab', { name: /scores/i }).click();

    // Should show leaderboard with rank column
    await expect(page.getByText(/rank/i)).toBeVisible({ timeout: 5000 });
    // Team should appear in leaderboard (within a leaderboard row)
    await expect(
      page.locator('.leaderboard-row, tr, .score-row').filter({ hasText: teamName })
    ).toBeVisible({
      timeout: 5000,
    });
  });

  test('should navigate between tabs', async ({ page }) => {
    const leagueName = `Tab Test ${Date.now()}`;
    const teamName = 'Test Team';

    // Create league and enter team name
    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /league name/i }).fill(leagueName);
    await page.getByRole('button', { name: /create league/i }).click();

    await expect(page.getByRole('heading', { name: /enter.*team name/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /team name/i }).fill(teamName);
    await page.getByRole('button', { name: /continue/i }).click();

    // Wait for the questions tab to be visible (indicates predictions form loaded)
    await expect(page.getByRole('tab', { name: /questions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay
    await waitForAndDismissIntro(page);

    // Navigate to leaderboard (Scores tab)
    await page.getByRole('tab', { name: /scores/i }).click();
    await expect(page.getByText(/rank/i)).toBeVisible({ timeout: 5000 });

    // Note: "All Predictions" is shown within the Questions tab when submissions are closed
    // For now, just verify we can navigate between Questions and Scores

    // Navigate back to predictions (Questions tab)
    await page.getByRole('tab', { name: /questions/i }).click();
    await expect(page.locator('input[type="radio"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show participant count in leaderboard', async ({ page }) => {
    const leagueName = `Participant Count Test ${Date.now()}`;
    const teamName = 'Test Team';

    // Create league and enter team name
    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /league name/i }).fill(leagueName);
    await page.getByRole('button', { name: /create league/i }).click();

    await expect(page.getByRole('heading', { name: /enter.*team name/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /team name/i }).fill(teamName);
    await page.getByRole('button', { name: /continue/i }).click();

    // Wait for the questions tab to be visible (indicates predictions form loaded)
    await expect(page.getByRole('tab', { name: /questions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay
    await waitForAndDismissIntro(page);

    // Navigate to leaderboard (Scores tab)
    await page.getByRole('tab', { name: /scores/i }).click();

    // Should show "1 participant" since we just created one team
    await expect(page.getByText(/1 participant/i)).toBeVisible({ timeout: 5000 });
  });

  test('should highlight current user in leaderboard', async ({ page }) => {
    const leagueName = `Highlight Test ${Date.now()}`;
    const teamName = 'Test Team';

    // Create league and enter team name
    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /league name/i }).fill(leagueName);
    await page.getByRole('button', { name: /create league/i }).click();

    await expect(page.getByRole('heading', { name: /enter.*team name/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole('textbox', { name: /team name/i }).fill(teamName);
    await page.getByRole('button', { name: /continue/i }).click();

    // Wait for the questions tab to be visible (indicates predictions form loaded)
    await expect(page.getByRole('tab', { name: /questions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay
    await waitForAndDismissIntro(page);

    // Navigate to leaderboard (Scores tab)
    await page.getByRole('tab', { name: /scores/i }).click();

    // The current user's row should have the 'current-user' class or be highlighted
    const currentUserRow = page
      .locator('.leaderboard-row.current-user, tr.current-user, .score-row.current-user')
      .first();
    await expect(currentUserRow).toBeVisible({ timeout: 5000 });
    await expect(currentUserRow).toContainText(teamName);
  });
});
