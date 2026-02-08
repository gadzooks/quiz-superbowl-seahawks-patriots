import { test, expect } from '@playwright/test';

import { TEST_GAME_ID } from '../helpers/test-data';

/**
 * Theme and Team Picker Tests
 *
 * Tests team picker functionality and theme selection.
 * NOTE: These tests run against a REAL InstantDB instance.
 */

test.describe('Theme and Team Picker', () => {
  test('should show team picker on first visit', async ({ page }) => {
    // Don't set supportedTeam in localStorage - simulate first visit
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');

    // Should show team picker with welcome message
    await expect(page.locator('.team-picker-title')).toContainText('Welcome', {
      timeout: 10000,
    });
    await expect(page.locator('.team-picker-subtitle')).toContainText('Pick your favorite team');

    // Should show team options
    await expect(page.locator('.team-name').filter({ hasText: 'Seahawks' })).toBeVisible();
    await expect(page.locator('.team-name').filter({ hasText: 'Patriots' })).toBeVisible();
  });

  test('should set theme when selecting a team', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');

    // Wait for team picker
    await expect(page.locator('.team-picker-title')).toContainText('Welcome', {
      timeout: 10000,
    });

    // Select Seahawks by clicking on the team item
    await page.locator('.team-item').filter({ hasText: 'Seahawks' }).click();

    // Wait for selection to be visible
    await expect(page.locator('.team-item.selected')).toBeVisible();

    // Click Let's Go button
    await page.getByRole('button', { name: /let's go/i }).click();

    // Team picker should close and navigate to league creation
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });

    // Check that theme was applied (Seahawks primary color)
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).getPropertyValue('--color-primary');
    });

    // Seahawks color should be set
    expect(backgroundColor).toBeTruthy();
  });

  test('should persist team selection in localStorage', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');

    // Wait for team picker
    await expect(page.locator('.team-picker-title')).toContainText('Welcome', {
      timeout: 10000,
    });

    // Wait for teams to load
    await expect(page.locator('.team-item').first()).toBeVisible({ timeout: 5000 });

    // Select Patriots
    const patriotsTeam = page.locator('.team-item').filter({ hasText: 'Patriots' });
    await expect(patriotsTeam).toBeVisible({ timeout: 5000 });
    await patriotsTeam.click();

    // Wait for selection
    await expect(page.locator('.team-item.selected')).toBeVisible({ timeout: 3000 });

    // Click Let's Go button
    const letsGoBtn = page.getByRole('button', { name: /let's go/i });
    await expect(letsGoBtn).toBeEnabled({ timeout: 3000 });
    await letsGoBtn.click();

    // Wait for navigation
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });

    // Check localStorage
    const supportedTeam = await page.evaluate(() => localStorage.getItem('supportedTeam'));
    expect(supportedTeam).toBe('patriots');
  });

  test('should not show team picker on subsequent visits', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('supportedTeam', 'sea');
    });

    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');

    // Should NOT show team picker
    await expect(page.locator('.team-picker-overlay')).not.toBeVisible({ timeout: 2000 });

    // Should go directly to league creation
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should allow Skip button to select random theme', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');

    // Wait for team picker
    await expect(page.locator('.team-picker-title')).toContainText('Welcome', {
      timeout: 10000,
    });

    // Click Skip button
    await page.getByRole('button', { name: /skip/i }).click();

    // Should navigate to league creation
    await expect(page.getByRole('heading', { name: /create.*league/i })).toBeVisible({
      timeout: 10000,
    });

    // Theme should be set (random team)
    const supportedTeam = await page.evaluate(() => localStorage.getItem('supportedTeam'));
    expect(supportedTeam).toBeTruthy();
  });

  test('should show conference divisions in team picker', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
    });

    await page.goto(`/superbowl/${TEST_GAME_ID}`);
    await page.waitForLoadState('networkidle');

    // Wait for team picker
    await expect(page.locator('.team-picker-title')).toContainText('Welcome', {
      timeout: 10000,
    });

    // Wait for divisions to load
    await expect(page.locator('.division-header').first()).toBeVisible({ timeout: 5000 });

    // Should show conference divisions (check for at least one AFC and one NFC)
    const afcHeaders = page.locator('.division-header').filter({ hasText: /AFC/i });
    const nfcHeaders = page.locator('.division-header').filter({ hasText: /NFC/i });

    await expect(afcHeaders.first()).toBeVisible({ timeout: 3000 });
    await expect(nfcHeaders.first()).toBeVisible({ timeout: 3000 });
  });
});
