// Team-specific background patterns
// Each NFL team gets a unique motif pattern

const PATTERN_OPACITY = 0.06;
const PATTERN_SIZE = 120;

/**
 * SVG path/shape definitions for each team's motif
 */
const TEAM_MOTIFS: Record<string, (color: string) => string> = {
  // AFC East
  bills: (c) => `<path d="M30 20 L50 40 L30 60 L10 40 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M90 70 L110 90 L90 110 L70 90 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  dolphins: (
    c
  ) => `<ellipse cx="35" cy="35" rx="20" ry="12" fill="${c}" opacity="${PATTERN_OPACITY}" transform="rotate(-30 35 35)"/>
    <ellipse cx="95" cy="85" rx="20" ry="12" fill="${c}" opacity="${PATTERN_OPACITY}" transform="rotate(-30 95 85)"/>`,

  jets: (c) =>
    `<polygon points="20,50 50,35 50,45 80,45 80,55 50,55 50,65" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  patriots: (
    c
  ) => `<path d="M35 15 L45 15 L50 5 L55 15 L65 15 L65 35 L60 45 L55 35 L45 35 L40 45 L35 35 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M75 65 L85 65 L90 55 L95 65 L105 65 L105 85 L100 95 L95 85 L85 85 L80 95 L75 85 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  // AFC North
  ravens: (
    c
  ) => `<text x="20" y="50" font-family="Arial Black, sans-serif" font-size="40" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">B</text>
    <text x="70" y="100" font-family="Arial Black, sans-serif" font-size="40" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">B</text>`,

  bengals: (
    c
  ) => `<line x1="10" y1="20" x2="50" y2="20" stroke="${c}" stroke-width="8" opacity="${PATTERN_OPACITY}"/>
    <line x1="15" y1="35" x2="55" y2="35" stroke="${c}" stroke-width="8" opacity="${PATTERN_OPACITY}"/>
    <line x1="20" y1="50" x2="60" y2="50" stroke="${c}" stroke-width="8" opacity="${PATTERN_OPACITY}"/>
    <line x1="70" y1="75" x2="110" y2="75" stroke="${c}" stroke-width="8" opacity="${PATTERN_OPACITY}"/>
    <line x1="65" y1="90" x2="105" y2="90" stroke="${c}" stroke-width="8" opacity="${PATTERN_OPACITY}"/>
    <line x1="60" y1="105" x2="100" y2="105" stroke="${c}" stroke-width="8" opacity="${PATTERN_OPACITY}"/>`,

  browns: (
    c
  ) => `<rect x="15" y="25" width="40" height="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <rect x="15" y="35" width="40" height="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <rect x="15" y="45" width="40" height="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <rect x="65" y="75" width="40" height="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <rect x="65" y="85" width="40" height="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <rect x="65" y="95" width="40" height="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  steelers: (
    c
  ) => `<circle cx="40" cy="40" r="25" fill="none" stroke="${c}" stroke-width="3" opacity="${PATTERN_OPACITY}"/>
    <path d="M40 20 L45 35 L40 30 L35 35 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M60 40 L45 45 L50 40 L45 35 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M40 60 L35 45 L40 50 L45 45 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="90" cy="90" r="20" fill="none" stroke="${c}" stroke-width="3" opacity="${PATTERN_OPACITY}"/>`,

  // AFC South
  texans: (
    c
  ) => `<polygon points="35,15 40,30 55,30 43,40 48,55 35,45 22,55 27,40 15,30 30,30" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <polygon points="85,65 90,80 105,80 93,90 98,105 85,95 72,105 77,90 65,80 80,80" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  colts: (
    c
  ) => `<path d="M20 20 C20 5, 50 5, 50 20 L50 50 C50 55, 45 55, 45 50 L45 25 C45 15, 25 15, 25 25 L25 50 C25 55, 20 55, 20 50 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M70 70 C70 55, 100 55, 100 70 L100 100 C100 105, 95 105, 95 100 L95 75 C95 65, 75 65, 75 75 L75 100 C75 105, 70 105, 70 100 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  jaguars: (c) => `<circle cx="25" cy="25" r="8" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="50" cy="35" r="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="35" cy="50" r="7" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="85" cy="75" r="8" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="95" cy="95" r="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="70" cy="90" r="7" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  titans: (
    c
  ) => `<polygon points="35,10 45,10 45,40 55,40 40,60 25,40 35,40" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <polygon points="85,60 95,60 95,90 105,90 90,110 75,90 85,90" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  // AFC West
  broncos: (
    c
  ) => `<path d="M25 15 C15 15, 10 25, 10 35 C10 50, 25 55, 25 55 L25 15" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M45 15 C55 15, 60 25, 60 35 C60 50, 45 55, 45 55 L45 15" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M75 65 C65 65, 60 75, 60 85 C60 100, 75 105, 75 105 L75 65" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M95 65 C105 65, 110 75, 110 85 C110 100, 95 105, 95 105 L95 65" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  chiefs: (
    c
  ) => `<polygon points="40,10 50,50 40,40 30,50" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <polygon points="90,60 100,100 90,90 80,100" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  raiders: (
    c
  ) => `<polygon points="35,15 50,25 50,55 35,45 20,55 20,25" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <line x1="25" y1="30" x2="45" y2="30" stroke="${c}" stroke-width="2" opacity="${PATTERN_OPACITY}"/>
    <line x1="25" y1="40" x2="45" y2="40" stroke="${c}" stroke-width="2" opacity="${PATTERN_OPACITY}"/>
    <polygon points="85,65 100,75 100,105 85,95 70,105 70,75" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  chargers: (
    c
  ) => `<polygon points="30,10 45,10 35,55 20,55" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <polygon points="80,60 95,60 85,105 70,105" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  // NFC East
  cowboys: (
    c
  ) => `<polygon points="40,5 44,18 58,18 47,27 51,40 40,31 29,40 33,27 22,18 36,18" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <polygon points="90,55 94,68 108,68 97,77 101,90 90,81 79,90 83,77 72,68 86,68" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  giants: (
    c
  ) => `<text x="15" y="45" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="${c}" opacity="${PATTERN_OPACITY}">ny</text>
    <text x="65" y="95" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="${c}" opacity="${PATTERN_OPACITY}">ny</text>`,

  eagles: (
    c
  ) => `<path d="M20 40 Q35 20, 50 35 Q45 40, 50 45 Q35 60, 20 40" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M70 90 Q85 70, 100 85 Q95 90, 100 95 Q85 110, 70 90" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  commanders: (
    c
  ) => `<text x="15" y="50" font-family="Arial Black, sans-serif" font-size="45" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">W</text>
    <text x="65" y="100" font-family="Arial Black, sans-serif" font-size="45" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">W</text>`,

  // NFC North
  bears: (
    c
  ) => `<text x="20" y="55" font-family="Arial, sans-serif" font-size="50" font-weight="700" fill="${c}" opacity="${PATTERN_OPACITY}">C</text>
    <text x="70" y="105" font-family="Arial, sans-serif" font-size="50" font-weight="700" fill="${c}" opacity="${PATTERN_OPACITY}">C</text>`,

  lions: (
    c
  ) => `<path d="M25 25 Q35 15, 45 25 L55 35 Q50 45, 40 45 L30 50 Q20 45, 20 35 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M75 75 Q85 65, 95 75 L105 85 Q100 95, 90 95 L80 100 Q70 95, 70 85 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  packers: (
    c
  ) => `<text x="18" y="52" font-family="Arial Black, sans-serif" font-size="48" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">G</text>
    <text x="68" y="102" font-family="Arial Black, sans-serif" font-size="48" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">G</text>`,

  vikings: (
    c
  ) => `<path d="M25 15 L25 45 Q25 55, 35 55" fill="none" stroke="${c}" stroke-width="6" opacity="${PATTERN_OPACITY}"/>
    <path d="M55 15 L55 45 Q55 55, 45 55" fill="none" stroke="${c}" stroke-width="6" opacity="${PATTERN_OPACITY}"/>
    <polygon points="20,10 25,20 30,10" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <polygon points="50,10 55,20 60,10" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M75 65 L75 95 Q75 105, 85 105" fill="none" stroke="${c}" stroke-width="6" opacity="${PATTERN_OPACITY}"/>
    <path d="M105 65 L105 95 Q105 105, 95 105" fill="none" stroke="${c}" stroke-width="6" opacity="${PATTERN_OPACITY}"/>`,

  // NFC South
  falcons: (
    c
  ) => `<text x="20" y="50" font-family="Arial Black, sans-serif" font-size="45" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">F</text>
    <text x="70" y="100" font-family="Arial Black, sans-serif" font-size="45" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">F</text>`,

  panthers: (c) => `<circle cx="30" cy="30" r="8" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="50" cy="30" r="8" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="40" cy="45" r="10" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="25" cy="55" r="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="55" cy="55" r="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="85" cy="85" r="8" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <circle cx="95" cy="95" r="6" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  saints: (
    c
  ) => `<path d="M40 15 L40 25 L30 30 L40 30 L40 55 L35 55 L35 30 L25 30 L40 15" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M40 15 L40 25 L50 30 L40 30 L40 55 L45 55 L45 30 L55 30 L40 15" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M90 65 L90 75 L80 80 L90 80 L90 105 L85 105 L85 80 L75 80 L90 65" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M90 65 L90 75 L100 80 L90 80 L90 105 L95 105 L95 80 L105 80 L90 65" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  buccaneers: (c) => `<circle cx="40" cy="30" r="15" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <rect x="35" y="45" width="10" height="15" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <line x1="25" y1="35" x2="15" y2="25" stroke="${c}" stroke-width="4" opacity="${PATTERN_OPACITY}"/>
    <line x1="55" y1="35" x2="65" y2="25" stroke="${c}" stroke-width="4" opacity="${PATTERN_OPACITY}"/>
    <circle cx="90" cy="80" r="12" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <rect x="86" y="92" width="8" height="12" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  // NFC West
  cardinals: (
    c
  ) => `<path d="M35 50 L35 25 Q35 15, 45 20 L55 30 L45 35 L45 50 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>
    <path d="M85 100 L85 75 Q85 65, 95 70 L105 80 L95 85 L95 100 Z" fill="${c}" opacity="${PATTERN_OPACITY}"/>`,

  fortyniners: (
    c
  ) => `<text x="10" y="45" font-family="Arial Black, sans-serif" font-size="32" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">49</text>
    <text x="65" y="100" font-family="Arial Black, sans-serif" font-size="32" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">49</text>`,

  rams: (
    c
  ) => `<path d="M25 50 Q15 35, 25 20 Q35 10, 45 25" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" opacity="${PATTERN_OPACITY}"/>
    <path d="M55 50 Q65 35, 55 20 Q45 10, 35 25" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" opacity="${PATTERN_OPACITY}"/>
    <path d="M75 100 Q65 85, 75 70 Q85 60, 95 75" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" opacity="${PATTERN_OPACITY}"/>
    <path d="M105 100 Q115 85, 105 70 Q95 60, 85 75" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" opacity="${PATTERN_OPACITY}"/>`,

  seahawks: (
    c
  ) => `<text x="10" y="45" font-family="Arial Black, sans-serif" font-size="36" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">12</text>
    <text x="70" y="100" font-family="Arial Black, sans-serif" font-size="36" font-weight="900" fill="${c}" opacity="${PATTERN_OPACITY}">12</text>`,
};

/**
 * Generate an SVG pattern for a specific team
 */
function createTeamPattern(teamId: string, primaryColor: string): string | null {
  const motifFn = TEAM_MOTIFS[teamId];
  if (!motifFn) return null;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${PATTERN_SIZE}" height="${PATTERN_SIZE}" viewBox="0 0 ${PATTERN_SIZE} ${PATTERN_SIZE}">
      ${motifFn(primaryColor)}
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
  const patternUrl = createTeamPattern(teamId, primaryColor);

  if (patternUrl) {
    // Team has a custom motif pattern
    return `url("${patternUrl}"), linear-gradient(180deg, ${backgroundColor} 0%, ${adjustBrightness(backgroundColor, -10)} 100%)`;
  }

  // Fallback: subtle gradient only (for neutral theme or unknown teams)
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
