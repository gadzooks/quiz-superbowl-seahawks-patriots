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
