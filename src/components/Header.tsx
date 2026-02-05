import { SoundManager } from '../sound/manager';
import { getTeamLogoUrl, NFL_SHIELD_LOGO } from '../theme/logos';
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

  const handlePlaySound = () => {
    SoundManager.playRandom();
  };

  const handleReplayIntro = () => {
    onReplayIntro();
  };

  return (
    <header className="app-header sticky top-0 z-50">
      <img
        src={getTeamLogoUrl(currentTeamId) ?? NFL_SHIELD_LOGO}
        alt="Team logo"
        className="team-logo-header"
        onError={(e) => {
          if (e.target instanceof HTMLImageElement) {
            e.target.src = NFL_SHIELD_LOGO;
          }
        }}
      />

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
            <span className="team-name-large">{team1Name}</span>
          </div>
          <img
            src={`${BASE}images/superbowl-lx-logo.svg`}
            alt="Super Bowl LX"
            className="superbowl-logo"
          />
          <div className="header-team header-team-right">
            <span className="team-name-large">{team2Name}</span>
          </div>
        </div>

        {league && (
          <div className="team-name-display">
            <span>{teamName}</span>
            <span className="league-name-header">{league.name}</span>
          </div>
        )}
      </div>

      {progressPercentage > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }} />
        </div>
      )}
    </header>
  );
}
