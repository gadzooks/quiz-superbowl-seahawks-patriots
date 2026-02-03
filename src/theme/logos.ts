// NFL Team Logo URLs
// Self-hosted logos in public/images/logos/

/**
 * NFL team abbreviations used by ESPN.
 */
export const TEAM_ABBREVIATIONS: Record<string, string> = {
  // AFC East
  bills: 'buf',
  dolphins: 'mia',
  patriots: 'ne',
  jets: 'nyj',

  // AFC North
  ravens: 'bal',
  bengals: 'cin',
  browns: 'cle',
  steelers: 'pit',

  // AFC South
  texans: 'hou',
  colts: 'ind',
  jaguars: 'jax',
  titans: 'ten',

  // AFC West
  broncos: 'den',
  chiefs: 'kc',
  raiders: 'lv',
  chargers: 'lac',

  // NFC East
  cowboys: 'dal',
  giants: 'nyg',
  eagles: 'phi',
  commanders: 'wsh',

  // NFC North
  bears: 'chi',
  lions: 'det',
  packers: 'gb',
  vikings: 'min',

  // NFC South
  falcons: 'atl',
  panthers: 'car',
  saints: 'no',
  buccaneers: 'tb',

  // NFC West
  cardinals: 'ari',
  rams: 'lar',
  '49ers': 'sf',
  seahawks: 'sea',
};

/**
 * Get the logo URL for a team.
 * @param teamId - The team ID (e.g., 'seahawks', 'patriots')
 * @returns The logo URL or null if no logo available
 */
export function getTeamLogoUrl(teamId: string): string | null {
  const abbr = TEAM_ABBREVIATIONS[teamId.toLowerCase()];
  if (!abbr) {
    return null; // Neutral theme or invalid team
  }
  return `${import.meta.env.BASE_URL}images/logos/${abbr}.png`;
}

/**
 * Generic NFL shield logo for neutral theme.
 */
export const NFL_SHIELD_LOGO = `${import.meta.env.BASE_URL}images/logos/nfl.png`;
