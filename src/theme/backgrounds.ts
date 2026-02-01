// Team-specific background patterns using team logos
// Shows faint repeating team logos as background

import { getTeamLogoUrl, NFL_SHIELD_LOGO } from './logos';

const LOGO_OPACITY = 0.04; // Very faint
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
 * Apply background to document body
 */
export function applyTeamBackground(
  teamId: string,
  primaryColor: string,
  backgroundColor: string
): void {
  const background = getTeamBackground(teamId, primaryColor, backgroundColor);

  // Apply to body
  document.body.style.background = background;
  document.body.style.backgroundColor = backgroundColor;
  document.body.style.backgroundSize = `${LOGO_SIZE}px ${LOGO_SIZE}px`;
  document.body.style.backgroundAttachment = 'fixed';

  // Apply to header
  applyHeaderBackground(teamId, backgroundColor);
}

/**
 * Apply background to header section
 */
function applyHeaderBackground(teamId: string, backgroundColor: string): void {
  const header = document.querySelector('.app-header') as HTMLElement | null;
  if (!header) return;

  const logoUrl = getTeamLogoUrl(teamId) || NFL_SHIELD_LOGO;

  // Darken the background color slightly for header
  const headerBg = adjustBrightness(backgroundColor, -5);

  header.style.background = `
    linear-gradient(135deg, ${headerBg}f5 0%, ${headerBg}f0 50%, ${headerBg}f5 100%),
    url("${logoUrl}")
  `.trim();
  header.style.backgroundSize = `100% 100%, 80px 80px`;
  header.style.backgroundPosition = `center, center`;
  header.style.backgroundColor = headerBg;
}

/**
 * Adjust brightness of a hex color
 */
function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(2.55 * percent)));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + Math.round(2.55 * percent)));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + Math.round(2.55 * percent)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Export for backwards compatibility
export { LOGO_OPACITY, LOGO_SIZE };
