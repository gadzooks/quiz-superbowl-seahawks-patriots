// TrophyProgress.tsx

import { useEffect, useState } from 'react';
import './TrophyProgress.css';

interface TrophyProgressProps {
  progressPercentage: number;
}

export function TrophyProgress({ progressPercentage }: TrophyProgressProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevProgress, setPrevProgress] = useState(0);

  useEffect(() => {
    if (progressPercentage === 100 && prevProgress < 100) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2500);
    }
    setPrevProgress(progressPercentage);
  }, [progressPercentage, prevProgress]);

  // Trophy height grows with progress
  const trophyHeight = 20 + (progressPercentage / 100) * 20; // 20px to 40px
  const trophyScale = 0.6 + (progressPercentage / 100) * 0.4; // 0.6 to 1.0

  return (
    <div className="trophy-progress-container">
      <div className="trophy-wrapper">
        <div
          className={`trophy ${showCelebration ? 'celebrate' : ''}`}
          style={{
            height: `${trophyHeight}px`,
            transform: `scale(${trophyScale})`,
          }}
        >
          {/* Lombardi Trophy SVG */}
          <svg viewBox="0 0 100 140" className="trophy-svg" xmlns="http://www.w3.org/2000/svg">
            {/* Trophy cup */}
            <ellipse cx="50" cy="25" rx="30" ry="8" fill="url(#trophyGradient)" />
            <path
              d="M 20 25 Q 20 45 35 50 L 35 80 Q 35 85 40 85 L 60 85 Q 65 85 65 80 L 65 50 Q 80 45 80 25"
              fill="url(#trophyGradient)"
              stroke="#B8860B"
              strokeWidth="1"
            />

            {/* Trophy handles */}
            <path
              d="M 20 28 Q 10 28 8 35 Q 8 40 15 42"
              fill="none"
              stroke="url(#trophyGradient)"
              strokeWidth="3"
            />
            <path
              d="M 80 28 Q 90 28 92 35 Q 92 40 85 42"
              fill="none"
              stroke="url(#trophyGradient)"
              strokeWidth="3"
            />

            {/* Trophy base */}
            <rect x="35" y="85" width="30" height="8" rx="2" fill="url(#trophyGradient)" />
            <rect x="25" y="93" width="50" height="12" rx="2" fill="url(#trophyGradient)" />
            <rect x="20" y="105" width="60" height="15" rx="3" fill="url(#trophyGradient)" />

            {/* Gradient definition */}
            <defs>
              <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#DAA520" />
              </linearGradient>
            </defs>
          </svg>

          {/* Sparkles */}
          {progressPercentage > 50 && (
            <>
              <div className="sparkle sparkle-1"></div>
              <div className="sparkle sparkle-2"></div>
              <div className="sparkle sparkle-3"></div>
            </>
          )}
        </div>
      </div>

      <div className="trophy-progress-bar">
        <div className="trophy-progress-fill" style={{ width: `${progressPercentage}%` }} />
      </div>

      <div className="trophy-progress-text">{progressPercentage}%</div>
    </div>
  );
}
