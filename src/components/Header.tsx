// Header.tsx

import { useEffect } from 'react';

import { SoundManager } from '../sound/manager';
import type { Game, League } from '../types';

const BASE = import.meta.env.BASE_URL;

interface HeaderProps {
  game: Game | null;
  league: League | null;
  teamName: string;
  currentTeamId: string;
  progressPercentage: number;
  onReplayIntro: () => void;
}

// Team color mappings
const TEAM_COLORS: Record<
  string,
  { primary: string; primaryRgb: string; accent: string; accentRgb: string }
> = {
  seahawks: {
    primary: '#002244',
    primaryRgb: '0, 34, 68',
    accent: '#69BE28',
    accentRgb: '105, 190, 40',
  },
  patriots: {
    primary: '#002244',
    primaryRgb: '0, 34, 68',
    accent: '#C60C30',
    accentRgb: '198, 12, 48',
  },
  buccaneers: {
    primary: '#0d3349',
    primaryRgb: '13, 51, 73',
    accent: '#D50A0A',
    accentRgb: '213, 10, 10',
  },
  chiefs: {
    primary: '#E31837',
    primaryRgb: '227, 24, 55',
    accent: '#FFB612',
    accentRgb: '255, 182, 18',
  },
  eagles: {
    primary: '#004C54',
    primaryRgb: '0, 76, 84',
    accent: '#A5ACAF',
    accentRgb: '165, 172, 175',
  },
  '49ers': {
    primary: '#AA0000',
    primaryRgb: '170, 0, 0',
    accent: '#B3995D',
    accentRgb: '179, 153, 93',
  },
  rams: {
    primary: '#003594',
    primaryRgb: '0, 53, 148',
    accent: '#FFA300',
    accentRgb: '255, 163, 0',
  },
  bengals: {
    primary: '#FB4F14',
    primaryRgb: '251, 79, 20',
    accent: '#000000',
    accentRgb: '0, 0, 0',
  },
  // Add more teams as needed
};

export function Header({
  game,
  league,
  teamName,
  currentTeamId,
  progressPercentage,
  onReplayIntro,
}: HeaderProps) {
  const isSeahawks = currentTeamId === 'seahawks';
  const team1Name = game?.team1 ?? 'Seahawks';
  const team2Name = game?.team2 ?? 'Patriots';

  // Set CSS variables for team colors
  useEffect(() => {
    const team1Key = team1Name.toLowerCase();
    const team2Key = team2Name.toLowerCase();

    const team1Colors = TEAM_COLORS[team1Key];
    const team2Colors = TEAM_COLORS[team2Key];

    const root = document.documentElement;

    // Set left team (team1) colors
    root.style.setProperty('--header-left-primary', team1Colors.primary);
    root.style.setProperty('--header-left-accent', team1Colors.accent);
    root.style.setProperty('--header-left-accent-rgb', team1Colors.accentRgb);

    // Set right team (team2) colors
    root.style.setProperty('--header-right-primary', team2Colors.primary);
    root.style.setProperty('--header-right-accent', team2Colors.accent);
    root.style.setProperty('--header-right-accent-rgb', team2Colors.accentRgb);
  }, [team1Name, team2Name]);

  const handlePlaySound = () => {
    SoundManager.playRandom();
  };

  const handleReplayIntro = () => {
    onReplayIntro();
  };

  return (
    <header className="app-header sticky top-0 z-50">
      {isSeahawks && (
        <button className="play-sound-btn" onClick={handlePlaySound} aria-label="Play sound">
          🔊
        </button>
      )}
      {isSeahawks && teamName && (
        <button className="intro-replay-btn" onClick={handleReplayIntro} aria-label="Replay intro">
          📷
        </button>
      )}
      <div className="header-content">
        <div className="header-matchup-row">
          <div className="header-team header-team-left">
            <img
              src={`${BASE}images/helmets/${team1Name.toLowerCase()}.png`}
              alt={`${team1Name} helmet`}
              className="team-helmet"
            />
            <span className="team-name-small">{team1Name}</span>
          </div>
          <div className="header-center">
            <img
              src={`${BASE}images/superbowl-lx-logo.svg`}
              alt="Super Bowl LX"
              className="superbowl-logo"
            />
            {league && (
              <div className="league-name-display">
                <span className="league-name-header">{league.name}</span>
              </div>
            )}
          </div>
          <div className="header-team header-team-right">
            <img
              src={`${BASE}images/helmets/${team2Name.toLowerCase()}.png`}
              alt={`${team2Name} helmet`}
              className="team-helmet team-helmet-flipped"
            />
            <span className="team-name-small">{team2Name}</span>
          </div>
        </div>
      </div>
      {progressPercentage > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
        </div>
      )}
    </header>
  );
}
