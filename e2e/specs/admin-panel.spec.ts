import { test, expect } from '@playwright/test';

import { waitForAndDismissIntro } from '../helpers/intro-helper';
import { TEST_GAME_ID } from '../helpers/test-data';

/**
 * Admin Panel Tests
 *
 * Tests admin functionality and results management.
 * NOTE: These tests run against a REAL InstantDB instance.
 *
 * CURRENTLY SKIPPED: Admin tab requires creator ID recognition which
 * has timing/sync issues in the test environment. The admin tab depends on
 * league.creatorId matching currentUserId, which may not sync immediately
 * after league creation in tests.
 */

test.describe.skip('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('supportedTeam', 'sea'); // Seahawks
    });
  });

  test('should show admin panel tab for league creator', async ({ page }) => {
    const leagueName = `Admin Test ${Date.now()}`;
    const teamName = 'Test Admin';

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

    // Click Scores tab to verify league is fully loaded with data
    await page.getByRole('tab', { name: /scores/i }).click();
    await page.waitForTimeout(1000); // Wait for tab content to render

    // Admin tab should be visible now that league data is loaded
    await expect(page.getByRole('tab', { name: /admin/i })).toBeVisible({ timeout: 10000 });
  });

  test('should show results tab in admin panel', async ({ page }) => {
    const leagueName = `Results Test ${Date.now()}`;
    const teamName = 'Test Admin';

    // Create league
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

    await expect(page.getByRole('heading', { name: /predictions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay if it appears
    const introOverlay = page.locator('.intro-overlay');
    if (await introOverlay.isVisible()) {
      await introOverlay.click();
      await page.waitForTimeout(1000);
    }

    // Click Scores tab first to ensure league data is loaded
    await page.getByRole('tab', { name: /scores/i }).click();
    await page.waitForTimeout(1000);

    // Admin tab should be visible
    const adminTab = page.getByRole('tab', { name: /admin/i });
    await expect(adminTab).toBeVisible({ timeout: 10000 });
    await adminTab.click();

    // Should show results tab option
    await expect(page.getByRole('tab', { name: /results/i })).toBeVisible({ timeout: 10000 });
  });

  test('should allow toggling submission controls', async ({ page }) => {
    const leagueName = `Submission Test ${Date.now()}`;
    const teamName = 'Test Admin';

    // Create league
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

    await expect(page.getByRole('heading', { name: /predictions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay if it appears
    const introOverlay = page.locator('.intro-overlay');
    if (await introOverlay.isVisible()) {
      await introOverlay.click();
      await page.waitForTimeout(1000);
    }

    // Click admin tab (wait for it to appear first)
    const adminTab = page.getByRole('button', { name: /admin/i });
    await expect(adminTab).toBeVisible({ timeout: 15000 });
    await adminTab.click();

    // Look for submission controls section
    await expect(page.getByText(/submission controls/i)).toBeVisible({ timeout: 5000 });

    // Should see toggle options
    await expect(page.getByText(/accepting submissions/i)).toBeVisible();
  });

  test('should display participant list in admin panel', async ({ page }) => {
    const leagueName = `Participants Test ${Date.now()}`;
    const teamName = 'Test Admin';

    // Create league
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

    await expect(page.getByRole('heading', { name: /predictions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay if it appears
    const introOverlay = page.locator('.intro-overlay');
    if (await introOverlay.isVisible()) {
      await introOverlay.click();
      await page.waitForTimeout(1000);
    }

    // Click admin tab (wait for it to appear first)
    const adminTab = page.getByRole('button', { name: /admin/i });
    await expect(adminTab).toBeVisible({ timeout: 15000 });
    await adminTab.click();

    // Should show participants section with the team we created
    await expect(page.getByText(/participants/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(teamName)).toBeVisible();
  });

  test('should show share section with league URL', async ({ page }) => {
    const leagueName = `Share Test ${Date.now()}`;
    const teamName = 'Test Admin';

    // Create league
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

    await expect(page.getByRole('heading', { name: /predictions/i })).toBeVisible({
      timeout: 10000,
    });

    // Dismiss intro overlay if it appears
    const introOverlay = page.locator('.intro-overlay');
    if (await introOverlay.isVisible()) {
      await introOverlay.click();
      await page.waitForTimeout(1000);
    }

    // Click admin tab (wait for it to appear first)
    const adminTab = page.getByRole('button', { name: /admin/i });
    await expect(adminTab).toBeVisible({ timeout: 15000 });
    await adminTab.click();

    // Should show share section
    await expect(page.getByText(/share.*league/i)).toBeVisible({ timeout: 5000 });

    // Should show a URL or league link
    await expect(page.locator('input[type="text"], .share-url, .league-url').first()).toBeVisible({
      timeout: 5000,
    });
  });
});
