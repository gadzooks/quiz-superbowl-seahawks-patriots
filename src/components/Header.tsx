// Header.tsx

import { useEffect, useState } from 'react';

import { SoundManager } from '../sound/manager';
import { TEAM_THEMES } from '../theme/teams';
import type { Game, League } from '../types';

const BASE = import.meta.env.BASE_URL;

interface HeaderProps {
  game: Game | null;
  league: League | null;
  teamName: string;
  currentTeamId: string;
  progressPercentage: number;
  currentTab?: string;
  onReplayIntro: () => void;
}

// Convert hex color to RGB string (e.g., "#FF0000" -> "255, 0, 0")
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

export function Header({
  game,
  league,
  teamName,
  currentTeamId,
  progressPercentage,
  currentTab,
  onReplayIntro,
}: HeaderProps) {
  const isSeahawks = currentTeamId === 'seahawks';
  const team1Name = game?.team1 ?? 'Seahawks';
  const team2Name = game?.team2 ?? 'Patriots';
  const [animationKey, setAnimationKey] = useState(0);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  // Set CSS variables for team colors
  useEffect(() => {
    const team1Key = team1Name.toLowerCase();
    const team2Key = team2Name.toLowerCase();

    const team1Theme = TEAM_THEMES[team1Key];
    const team2Theme = TEAM_THEMES[team2Key];

    const root = document.documentElement;

    // Set left team (team1) colors
    // Use secondary as primary (dark) and primary as accent (bright)
    root.style.setProperty('--header-left-primary', team1Theme.secondary);
    root.style.setProperty('--header-left-accent', team1Theme.primary);
    root.style.setProperty('--header-left-accent-rgb', hexToRgb(team1Theme.primary));

    // Set right team (team2) colors
    root.style.setProperty('--header-right-primary', team2Theme.secondary);
    root.style.setProperty('--header-right-accent', team2Theme.primary);
    root.style.setProperty('--header-right-accent-rgb', hexToRgb(team2Theme.primary));
  }, [team1Name, team2Name]);

  // Trigger animation when tab changes
  useEffect(() => {
    if (currentTab) {
      setAnimationKey((prev) => prev + 1);
    }
  }, [currentTab]);

  // Hide header when scrolling down
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollThreshold = 100;

          // Hide header when scrolling down past threshold
          if (currentScrollY > scrollThreshold && currentScrollY > lastScrollY) {
            setIsHeaderHidden(true);
          }
          // Show header when scrolling up
          else if (currentScrollY < lastScrollY || currentScrollY <= scrollThreshold) {
            setIsHeaderHidden(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handlePlaySound = async () => {
    if (isSoundPlaying) return;
    setIsSoundPlaying(true);
    await SoundManager.playRandom();
    setIsSoundPlaying(false);
  };

  const handleReplayIntro = () => {
    onReplayIntro();
  };

  return (
    <>
      <header className={`app-header sticky top-0 z-50 ${isHeaderHidden ? 'header-hidden' : ''}`}>
        <div className="header-content">
          <div className="header-matchup-row">
            <div className="header-team header-team-left">
              <img
                key={`left-helmet-${animationKey}`}
                src={`${BASE}images/helmets/${team1Name.toLowerCase()}.png`}
                alt={`${team1Name} helmet`}
                className="team-helmet"
              />
              <span key={`left-name-${animationKey}`} className="team-name-small">
                {team1Name}
              </span>
            </div>
            <div className="header-center">
              <img
                src={`${BASE}images/superbowl-lx-logo.svg`}
                alt="Super Bowl LX"
                className="superbowl-logo"
              />
            </div>
            <div className="header-team header-team-right">
              <img
                key={`right-helmet-${animationKey}`}
                src={`${BASE}images/helmets/${team2Name.toLowerCase()}.png`}
                alt={`${team2Name} helmet`}
                className="team-helmet team-helmet-flipped"
              />
              <span key={`right-name-${animationKey}`} className="team-name-small">
                {team2Name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {league && teamName && (
        <div className={`league-team-info ${isHeaderHidden ? 'header-hidden' : ''}`}>
          <button
            className="intro-replay-btn-inline"
            onClick={handleReplayIntro}
            aria-label="Replay intro"
          >
            📷
          </button>
          <span className="league-team-text">
            {league.name} : {teamName}
          </span>
          {isSeahawks && (
            <button
              className="play-sound-btn-inline"
              onClick={() => void handlePlaySound()}
              disabled={isSoundPlaying}
              aria-label="Play sound"
            >
              🔊
            </button>
          )}
        </div>
      )}

      {progressPercentage > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
        </div>
      )}
    </>
  );
}
