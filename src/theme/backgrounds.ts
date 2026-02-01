// Team-specific background patterns
// Seahawks get the special "12s" pattern, others get subtle gradients

/**
 * Generate an SVG data URL for the Seahawks "12" pattern
 */
function createSeahawks12Pattern(primaryColor: string): string {
  // Create subtle repeating "12" pattern
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <defs>
        <pattern id="twelves" patternUnits="userSpaceOnUse" width="120" height="120">
          <text x="10" y="45" font-family="Arial Black, sans-serif" font-size="36" font-weight="900" fill="${primaryColor}" opacity="0.06">12</text>
          <text x="70" y="100" font-family="Arial Black, sans-serif" font-size="36" font-weight="900" fill="${primaryColor}" opacity="0.06">12</text>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#twelves)"/>
    </svg>
  `.trim();

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Generate background CSS for a team
 */
export function getTeamBackground(
  teamId: string,
  primaryColor: string,
  backgroundColor: string
): string {
  // Seahawks get the special "12s" pattern
  if (teamId === 'seahawks') {
    const patternUrl = createSeahawks12Pattern(primaryColor);
    return `url("${patternUrl}"), linear-gradient(180deg, ${backgroundColor} 0%, ${adjustBrightness(backgroundColor, -10)} 100%)`;
  }

  // All other teams get a subtle gradient
  return `linear-gradient(180deg, ${backgroundColor} 0%, ${adjustBrightness(backgroundColor, -8)} 100%)`;
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

/**
 * Apply background to document body
 */
export function applyTeamBackground(
  teamId: string,
  primaryColor: string,
  backgroundColor: string
): void {
  const background = getTeamBackground(teamId, primaryColor, backgroundColor);
  document.body.style.background = background;
  document.body.style.backgroundAttachment = 'fixed';
}
