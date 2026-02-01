// Theme application utility
// Applies team colors via CSS custom properties for dynamic theming

import { getTeamTheme, DEFAULT_TEAM_ID, type TeamTheme } from './teams';
import { CSS_VAR_NAMES, calculateDerivedTokens, type ThemeTokens } from './tokens';
import { getTeamLogoUrl, NFL_SHIELD_LOGO } from './logos';
import { applyTeamBackground, applyGameTeamBackgrounds } from './backgrounds';
import { getTeamIds, type GameConfig } from '../config/games';
import { getCurrentGameConfig } from '../utils/game';

const STORAGE_KEY = 'supportedTeam';
const HEADER_LOGO_ID = 'team-logo';

/**
 * Apply a theme to the document by setting CSS custom properties.
 * Automatically calculates derived colors (hover states, input backgrounds, etc.)
 */
export function applyTheme(theme: TeamTheme): void {
  const root = document.documentElement;

  // Apply base theme colors
  root.style.setProperty(CSS_VAR_NAMES.primary, theme.primary);
  root.style.setProperty(CSS_VAR_NAMES.secondary, theme.secondary);
  root.style.setProperty(CSS_VAR_NAMES.background, theme.background);
  root.style.setProperty(CSS_VAR_NAMES.backgroundAlt, theme.backgroundAlt);
  root.style.setProperty(CSS_VAR_NAMES.text, theme.text);
  root.style.setProperty(CSS_VAR_NAMES.textMuted, theme.textMuted);

  // Calculate and apply derived colors
  const baseTokens: ThemeTokens = {
    primary: theme.primary,
    secondary: theme.secondary,
    background: theme.background,
    backgroundAlt: theme.backgroundAlt,
    text: theme.text,
    textMuted: theme.textMuted,
  };
  const derived = calculateDerivedTokens(baseTokens);

  root.style.setProperty(CSS_VAR_NAMES.inputBg, derived.inputBg);
  root.style.setProperty(CSS_VAR_NAMES.inputHover, derived.inputHover);
  root.style.setProperty(CSS_VAR_NAMES.primaryHover, derived.primaryHover);
  root.style.setProperty(CSS_VAR_NAMES.primaryRgb, derived.primaryRgb);
  root.style.setProperty(CSS_VAR_NAMES.surface, derived.surface);
  root.style.setProperty(CSS_VAR_NAMES.border, derived.border);

  // Update meta theme-color for mobile browsers
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
  updateHeaderLogo(teamId);
  applyTeamBackground(teamId, theme.primary, theme.background);
  return true;
}

/**
 * Apply header team colors based on game config.
 * Creates a split header/background with left team colors and right team colors.
 */
export function applyHeaderTeamColors(gameConfig: GameConfig): void {
  const root = document.documentElement;
  const [leftTeamId, rightTeamId] = getTeamIds(gameConfig);

  const leftTheme = getTeamTheme(leftTeamId);
  const rightTheme = getTeamTheme(rightTeamId);

  // Set CSS variables for accent colors (used by team names in header)
  if (leftTheme) {
    root.style.setProperty(CSS_VAR_NAMES.headerLeftBg, leftTheme.background);
    root.style.setProperty(CSS_VAR_NAMES.headerLeftAccent, leftTheme.primary);
  }

  if (rightTheme) {
    root.style.setProperty(CSS_VAR_NAMES.headerRightBg, rightTheme.background);
    root.style.setProperty(CSS_VAR_NAMES.headerRightAccent, rightTheme.primary);
  }

  // Apply split background to body and header (inline styles to override user theme)
  applyGameTeamBackgrounds(gameConfig);
}

/**
 * Update the team logo in the header.
 */
function updateHeaderLogo(teamId: string): void {
  const logoEl = document.getElementById(HEADER_LOGO_ID) as HTMLImageElement | null;
  if (!logoEl) return;

  const logoUrl = getTeamLogoUrl(teamId);
  if (logoUrl) {
    logoEl.src = logoUrl;
    logoEl.alt = `${teamId} logo`;
    logoEl.style.display = 'block';
  } else {
    // For neutral theme, show NFL shield or hide
    logoEl.src = NFL_SHIELD_LOGO;
    logoEl.alt = 'NFL';
    logoEl.style.display = 'block';
  }
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
 * Also applies header team colors from game config.
 */
export function initTheme(): string {
  const savedTeamId = getSavedTeamId();
  const teamId = savedTeamId || DEFAULT_TEAM_ID;

  if (!applyTeamTheme(teamId)) {
    // Fallback to default if saved team is invalid
    applyTeamTheme(DEFAULT_TEAM_ID);
  }

  // Apply header team colors (always show game teams, not user's theme)
  const gameConfig = getCurrentGameConfig();
  if (gameConfig) {
    applyHeaderTeamColors(gameConfig);
  }

  return teamId;
}

/**
 * Set a new team theme and save preference.
 * Also re-applies header team colors to ensure they're not overridden.
 */
export function setTeamTheme(teamId: string): boolean {
  if (applyTeamTheme(teamId)) {
    saveTeamPreference(teamId);
    // Re-apply header team colors (they should always show game teams, not user's theme)
    const gameConfig = getCurrentGameConfig();
    if (gameConfig) {
      applyHeaderTeamColors(gameConfig);
    }
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
