// NFL Team Color Definitions
// Users can select their favorite team to personalize the app's appearance

export interface TeamTheme {
  name: string;        // Display name
  primary: string;     // Main accent color (buttons, highlights)
  secondary: string;   // Secondary color
  background: string;  // Background color
  backgroundAlt: string; // Alternate background (cards, inputs)
  text: string;        // Primary text color
  textMuted: string;   // Secondary/muted text
}

/**
 * NFL team color themes.
 * Colors sourced from official team brand guidelines.
 */
export const TEAM_THEMES: Record<string, TeamTheme> = {
  // AFC East
  bills: {
    name: 'Buffalo Bills',
    primary: '#00338D',
    secondary: '#C60C30',
    background: '#00338D',
    backgroundAlt: '#002a75',
    text: '#FFFFFF',
    textMuted: '#B8C5D6',
  },
  dolphins: {
    name: 'Miami Dolphins',
    primary: '#008E97',
    secondary: '#FC4C02',
    background: '#008E97',
    backgroundAlt: '#007580',
    text: '#FFFFFF',
    textMuted: '#B8E5E8',
  },
  patriots: {
    name: 'New England Patriots',
    primary: '#C60C30',
    secondary: '#002244',
    background: '#002244',
    backgroundAlt: '#001a33',
    text: '#FFFFFF',
    textMuted: '#B0B7BD',
  },
  jets: {
    name: 'New York Jets',
    primary: '#125740',
    secondary: '#000000',
    background: '#125740',
    backgroundAlt: '#0e4532',
    text: '#FFFFFF',
    textMuted: '#A8C5B8',
  },

  // AFC North
  ravens: {
    name: 'Baltimore Ravens',
    primary: '#9E7C0C',
    secondary: '#241773',
    background: '#241773',
    backgroundAlt: '#1c1259',
    text: '#FFFFFF',
    textMuted: '#B5A8D4',
  },
  bengals: {
    name: 'Cincinnati Bengals',
    primary: '#FB4F14',
    secondary: '#000000',
    background: '#000000',
    backgroundAlt: '#1a1a1a',
    text: '#FFFFFF',
    textMuted: '#A0A0A0',
  },
  browns: {
    name: 'Cleveland Browns',
    primary: '#FF3C00',
    secondary: '#311D00',
    background: '#311D00',
    backgroundAlt: '#251600',
    text: '#FFFFFF',
    textMuted: '#C4A882',
  },
  steelers: {
    name: 'Pittsburgh Steelers',
    primary: '#FFB612',
    secondary: '#101820',
    background: '#101820',
    backgroundAlt: '#0a1015',
    text: '#FFFFFF',
    textMuted: '#A8ADB3',
  },

  // AFC South
  texans: {
    name: 'Houston Texans',
    primary: '#A71930',
    secondary: '#03202F',
    background: '#03202F',
    backgroundAlt: '#021825',
    text: '#FFFFFF',
    textMuted: '#9CAAB5',
  },
  colts: {
    name: 'Indianapolis Colts',
    primary: '#002C5F',
    secondary: '#A2AAAD',
    background: '#002C5F',
    backgroundAlt: '#00234a',
    text: '#FFFFFF',
    textMuted: '#A2AAAD',
  },
  jaguars: {
    name: 'Jacksonville Jaguars',
    primary: '#D7A22A',
    secondary: '#006778',
    background: '#006778',
    backgroundAlt: '#005260',
    text: '#FFFFFF',
    textMuted: '#A8C5CB',
  },
  titans: {
    name: 'Tennessee Titans',
    primary: '#4B92DB',
    secondary: '#0C2340',
    background: '#0C2340',
    backgroundAlt: '#091a30',
    text: '#FFFFFF',
    textMuted: '#9CAFC4',
  },

  // AFC West
  broncos: {
    name: 'Denver Broncos',
    primary: '#FB4F14',
    secondary: '#002244',
    background: '#002244',
    backgroundAlt: '#001a33',
    text: '#FFFFFF',
    textMuted: '#A8B5C2',
  },
  chiefs: {
    name: 'Kansas City Chiefs',
    primary: '#E31837',
    secondary: '#FFB81C',
    background: '#E31837',
    backgroundAlt: '#c5142f',
    text: '#FFFFFF',
    textMuted: '#FFD9A8',
  },
  raiders: {
    name: 'Las Vegas Raiders',
    primary: '#A5ACAF',
    secondary: '#000000',
    background: '#000000',
    backgroundAlt: '#1a1a1a',
    text: '#FFFFFF',
    textMuted: '#A5ACAF',
  },
  chargers: {
    name: 'Los Angeles Chargers',
    primary: '#FFC20E',
    secondary: '#0080C6',
    background: '#0080C6',
    backgroundAlt: '#006ba8',
    text: '#FFFFFF',
    textMuted: '#B8D8EC',
  },

  // NFC East
  cowboys: {
    name: 'Dallas Cowboys',
    primary: '#869397',
    secondary: '#003594',
    background: '#003594',
    backgroundAlt: '#002a75',
    text: '#FFFFFF',
    textMuted: '#B0BCC0',
  },
  giants: {
    name: 'New York Giants',
    primary: '#0B2265',
    secondary: '#A71930',
    background: '#0B2265',
    backgroundAlt: '#081a4f',
    text: '#FFFFFF',
    textMuted: '#A8B5D0',
  },
  eagles: {
    name: 'Philadelphia Eagles',
    primary: '#A5ACAF',
    secondary: '#004C54',
    background: '#004C54',
    backgroundAlt: '#003a40',
    text: '#FFFFFF',
    textMuted: '#A5ACAF',
  },
  commanders: {
    name: 'Washington Commanders',
    primary: '#FFB612',
    secondary: '#5A1414',
    background: '#5A1414',
    backgroundAlt: '#480f0f',
    text: '#FFFFFF',
    textMuted: '#D4A8A8',
  },

  // NFC North
  bears: {
    name: 'Chicago Bears',
    primary: '#C83803',
    secondary: '#0B162A',
    background: '#0B162A',
    backgroundAlt: '#081020',
    text: '#FFFFFF',
    textMuted: '#9CAAB8',
  },
  lions: {
    name: 'Detroit Lions',
    primary: '#B0B7BC',
    secondary: '#0076B6',
    background: '#0076B6',
    backgroundAlt: '#006098',
    text: '#FFFFFF',
    textMuted: '#B0B7BC',
  },
  packers: {
    name: 'Green Bay Packers',
    primary: '#FFB612',
    secondary: '#203731',
    background: '#203731',
    backgroundAlt: '#182a26',
    text: '#FFFFFF',
    textMuted: '#A8B5B0',
  },
  vikings: {
    name: 'Minnesota Vikings',
    primary: '#FFC62F',
    secondary: '#4F2683',
    background: '#4F2683',
    backgroundAlt: '#3d1e66',
    text: '#FFFFFF',
    textMuted: '#C4B0D8',
  },

  // NFC South
  falcons: {
    name: 'Atlanta Falcons',
    primary: '#A71930',
    secondary: '#000000',
    background: '#000000',
    backgroundAlt: '#1a1a1a',
    text: '#FFFFFF',
    textMuted: '#A0A0A0',
  },
  panthers: {
    name: 'Carolina Panthers',
    primary: '#0085CA',
    secondary: '#101820',
    background: '#101820',
    backgroundAlt: '#0a1015',
    text: '#FFFFFF',
    textMuted: '#A8D4EC',
  },
  saints: {
    name: 'New Orleans Saints',
    primary: '#D3BC8D',
    secondary: '#101820',
    background: '#101820',
    backgroundAlt: '#0a1015',
    text: '#FFFFFF',
    textMuted: '#D3BC8D',
  },
  buccaneers: {
    name: 'Tampa Bay Buccaneers',
    primary: '#D50A0A',
    secondary: '#34302B',
    background: '#34302B',
    backgroundAlt: '#282420',
    text: '#FFFFFF',
    textMuted: '#B8B4B0',
  },

  // NFC West
  cardinals: {
    name: 'Arizona Cardinals',
    primary: '#97233F',
    secondary: '#000000',
    background: '#97233F',
    backgroundAlt: '#7a1c33',
    text: '#FFFFFF',
    textMuted: '#D4A8B5',
  },
  rams: {
    name: 'Los Angeles Rams',
    primary: '#FFA300',
    secondary: '#003594',
    background: '#003594',
    backgroundAlt: '#002a75',
    text: '#FFFFFF',
    textMuted: '#A8B5D0',
  },
  '49ers': {
    name: 'San Francisco 49ers',
    primary: '#B3995D',
    secondary: '#AA0000',
    background: '#AA0000',
    backgroundAlt: '#8a0000',
    text: '#FFFFFF',
    textMuted: '#D4B8B8',
  },
  seahawks: {
    name: 'Seattle Seahawks',
    primary: '#33F200',
    secondary: '#00203B',
    background: '#00203B',
    backgroundAlt: '#001a30',
    text: '#FFFFFF',
    textMuted: '#9DA2A3',
  },
};

/**
 * Get a list of all team options for the theme picker.
 * Returns teams sorted alphabetically by name.
 */
export function getTeamOptions(): Array<{ id: string; name: string }> {
  return Object.entries(TEAM_THEMES)
    .map(([id, theme]) => ({ id, name: theme.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get team theme by ID.
 */
export function getTeamTheme(teamId: string): TeamTheme | undefined {
  return TEAM_THEMES[teamId.toLowerCase()];
}

/**
 * Default team theme (Seahawks).
 */
export const DEFAULT_TEAM_ID = 'seahawks';
