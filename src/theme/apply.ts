// Theme application utility
// Applies team colors via CSS custom properties for dynamic theming

import { getTeamTheme, DEFAULT_TEAM_ID, type TeamTheme } from './teams';

const STORAGE_KEY = 'supportedTeam';

/**
 * CSS custom property names used throughout the app.
 */
const CSS_VARS = {
  primary: '--color-primary',
  secondary: '--color-secondary',
  background: '--color-background',
  backgroundAlt: '--color-background-alt',
  text: '--color-text',
  textMuted: '--color-text-muted',
} as const;

/**
 * Apply a theme to the document by setting CSS custom properties.
 */
export function applyTheme(theme: TeamTheme): void {
  const root = document.documentElement;

  root.style.setProperty(CSS_VARS.primary, theme.primary);
  root.style.setProperty(CSS_VARS.secondary, theme.secondary);
  root.style.setProperty(CSS_VARS.background, theme.background);
  root.style.setProperty(CSS_VARS.backgroundAlt, theme.backgroundAlt);
  root.style.setProperty(CSS_VARS.text, theme.text);
  root.style.setProperty(CSS_VARS.textMuted, theme.textMuted);

  // Also update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme.background);
  }
}

/**
 * Apply theme by team ID.
 */
export function applyTeamTheme(teamId: string): boolean {
  const theme = getTeamTheme(teamId);
  if (!theme) {
    console.warn(`Unknown team ID: ${teamId}, using default`);
    return false;
  }

  applyTheme(theme);
  return true;
}

/**
 * Get the user's saved team preference from localStorage.
 */
export function getSavedTeamId(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * Save the user's team preference to localStorage.
 */
export function saveTeamPreference(teamId: string): void {
  localStorage.setItem(STORAGE_KEY, teamId);
}

/**
 * Clear the user's team preference.
 */
export function clearTeamPreference(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Initialize theme on app load.
 * Uses saved preference, falls back to default.
 */
export function initTheme(): string {
  const savedTeamId = getSavedTeamId();
  const teamId = savedTeamId || DEFAULT_TEAM_ID;

  if (!applyTeamTheme(teamId)) {
    // Fallback to default if saved team is invalid
    applyTeamTheme(DEFAULT_TEAM_ID);
    return DEFAULT_TEAM_ID;
  }

  return teamId;
}

/**
 * Set a new team theme and save preference.
 */
export function setTeamTheme(teamId: string): boolean {
  if (applyTeamTheme(teamId)) {
    saveTeamPreference(teamId);
    return true;
  }
  return false;
}

/**
 * Get the current team ID (from localStorage or default).
 */
export function getCurrentTeamId(): string {
  return getSavedTeamId() || DEFAULT_TEAM_ID;
}
