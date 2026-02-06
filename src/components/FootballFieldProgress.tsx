// FootballFieldProgress.tsx

import { useEffect, useRef, useState } from 'react';
import './FootballFieldProgress.css';

interface FootballFieldProgressProps {
  progressPercentage: number;
}

export function FootballFieldProgress({ progressPercentage }: FootballFieldProgressProps) {
  const [showTouchdown, setShowTouchdown] = useState(false);
  const prevProgressRef = useRef(0);

  useEffect(() => {
    if (progressPercentage === 100 && prevProgressRef.current < 100) {
      setShowTouchdown(true);
      setTimeout(() => setShowTouchdown(false), 3000);
    }
    prevProgressRef.current = progressPercentage;
  }, [progressPercentage]);

  // Calculate football position (0-100 yards)
  const ballPosition = progressPercentage;

  // Show different yard markers
  const yardMarkers = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <div className="football-field-container">
      <div className="field-wrapper">
        {/* Football field */}
        <div className="football-field">
          {/* Yard lines */}
          <div className="yard-lines">
            {yardMarkers.map((yard) => (
              <div
                key={yard}
                className={`yard-marker ${yard === 0 || yard === 100 ? 'endzone' : ''}`}
                style={{ left: `${yard}%` }}
              >
                <div className="yard-line" />
                {yard % 10 === 0 && (
                  <div className="yard-number">
                    {yard === 100 ? '🏁' : yard === 50 ? '50' : yard > 50 ? 100 - yard : yard}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress fill (like team advancing) */}
          <div className="field-progress" style={{ width: `${ballPosition}%` }} />

          {/* Football */}
          <div
            className={`football ${showTouchdown ? 'touchdown' : ''}`}
            style={{ left: `${ballPosition}%` }}
          >
            🏈
          </div>

          {/* Touchdown celebration */}
          {showTouchdown && (
            <>
              <div className="touchdown-text">TOUCHDOWN!</div>
              <div className="confetti-burst confetti-1"></div>
              <div className="confetti-burst confetti-2"></div>
              <div className="confetti-burst confetti-3"></div>
              <div className="confetti-burst confetti-4"></div>
            </>
          )}
        </div>
      </div>

      <div className="field-stats">
        <span className="yard-display">{Math.floor(ballPosition)} yds</span>
      </div>
    </div>
  );
}
