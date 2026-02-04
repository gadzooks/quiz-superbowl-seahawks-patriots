// Team-specific background patterns using team logos
// Shows faint repeating team logos as background

import { getTeamIds, type GameConfig } from '../config/games';
import { logger } from '../utils/logger';

import { getTeamLogoUrl, NFL_SHIELD_LOGO } from './logos';
import { getTeamTheme } from './teams';

const LOGO_SIZE = 120; // Size of each logo in the pattern

/**
 * Generate background CSS for a team using their logo
 */
export function getTeamBackground(
  teamId: string,
  _primaryColor: string,
  backgroundColor: string
): string {
  const logoUrl = getTeamLogoUrl(teamId);

  if (logoUrl) {
    // Team has a logo - show repeating pattern
    return `
      linear-gradient(${backgroundColor}e6, ${backgroundColor}e6),
      url("${logoUrl}")
    `.trim();
  }

  // Neutral theme: use NFL shield or just gradient
  return `
    linear-gradient(${backgroundColor}f0, ${backgroundColor}f0),
    url("${NFL_SHIELD_LOGO}")
  `.trim();
}

/**
 * Apply background to document body (no-op, uses CSS variables now)
 * @deprecated Background is now controlled via CSS custom properties
 */
export function applyTeamBackground(
  _teamId: string,
  _primaryColor: string,
  _backgroundColor: string
): void {
  // No-op: background is now controlled by CSS variables set in applyGameTeamBackgrounds
  // This function is kept for backwards compatibility
}

/**
 * Blend a color with a tint color at a given opacity.
 * Creates a subtle tinted version of the base color.
 */
function blendWithTint(baseHex: string, tintHex: string, tintOpacity: number): string {
  const base = hexToRgb(baseHex);
  const tint = hexToRgb(tintHex);

  const r = Math.round(base.r * (1 - tintOpacity) + tint.r * tintOpacity);
  const g = Math.round(base.g * (1 - tintOpacity) + tint.g * tintOpacity);
  const b = Math.round(base.b * (1 - tintOpacity) + tint.b * tintOpacity);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Parse hex color to RGB components.
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  };
}

/**
 * Apply split background colors to HEADER ONLY based on game config teams.
 * Left side shows first team's colors, right side shows second team's colors.
 * Body background follows the user's selected theme.
 */
export function applyGameTeamBackgrounds(gameConfig: GameConfig): void {
  const [leftTeamId, rightTeamId] = getTeamIds(gameConfig);
  const leftTheme = getTeamTheme(leftTeamId);
  const rightTheme = getTeamTheme(rightTeamId);

  if (!leftTheme || !rightTheme) {
    console.warn('Could not find themes for game teams:', leftTeamId, rightTeamId);
    return;
  }

  // Blend background with primary color to create a tinted version (15% tint)
  const leftBg = blendWithTint(leftTheme.background, leftTheme.primary, 0.15);
  const rightBg = blendWithTint(rightTheme.background, rightTheme.primary, 0.15);

  logger.debug('Applying header split background:', { leftBg, rightBg, leftTeamId, rightTeamId });

  // Apply split gradient to header ONLY
  applyHeaderSplitBackground(leftBg, rightBg);
}

/**
 * Apply split background to header section
 */
function applyHeaderSplitBackground(leftBg: string, rightBg: string): void {
  const header = document.querySelector('.app-header') as HTMLElement | null;
  if (!header) {
    logger.warn('Header element .app-header not found');
    return;
  }

  // Simple split gradient for header
  const gradient = `linear-gradient(to right, ${leftBg} 0%, ${leftBg} 45%, ${rightBg} 55%, ${rightBg} 100%)`;
  header.style.setProperty('background', gradient, 'important');

  // Clear any other background properties that might interfere
  header.style.backgroundSize = '';
  header.style.backgroundPosition = '';
  header.style.backgroundRepeat = '';
  header.style.backgroundColor = '';

  logger.debug('Applied header split background:', gradient);
}

// Export for tests
export { LOGO_SIZE };
