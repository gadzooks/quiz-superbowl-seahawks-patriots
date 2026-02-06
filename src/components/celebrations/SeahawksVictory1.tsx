// SeahawksVictory1.tsx - "12th Man Stadium Roar"
// Full screen celebration with crowd wave, confetti rain, and helmet parade

import React, { useEffect, useState } from 'react';

import './SeahawksVictory1.css';

interface SeahawksVictory1Props {
  onComplete: () => void;
  duration?: number; // milliseconds
}

export function SeahawksVictory1({ onComplete, duration = 5000 }: SeahawksVictory1Props) {
  const [phase, setPhase] = useState<'intro' | 'peak' | 'outro'>('intro');

  useEffect(() => {
    // Phase transitions
    const introTimer = setTimeout(() => setPhase('peak'), 800);
    const peakTimer = setTimeout(() => setPhase('outro'), duration - 1000);
    const completeTimer = setTimeout(onComplete, duration);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(peakTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className={`seahawks-victory-1 phase-${phase}`}>
      {/* Background with team colors pulse */}
      <div className="victory-background">
        <div className="color-wave wave-1"></div>
        <div className="color-wave wave-2"></div>
        <div className="color-wave wave-3"></div>
      </div>

      {/* Massive confetti explosion */}
      <div className="confetti-container">
        {Array.from({ length: 150 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={
              // eslint-disable-next-line no-restricted-syntax
              {
                '--x': Math.random(),
                '--y': Math.random(),
                '--rotation': Math.random() * 360,
                '--delay': Math.random() * 0.5,
                '--duration': 3 + Math.random() * 2,
                '--color': i % 3 === 0 ? '#002244' : i % 3 === 1 ? '#69BE28' : '#A5ACAF',
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Helmets flying from sides */}
      <div className="helmet-parade">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`flying-helmet helmet-${i % 2 === 0 ? 'left' : 'right'}`}
            style={
              // eslint-disable-next-line no-restricted-syntax
              {
                '--helmet-delay': `${i * 0.3}s`,
                '--helmet-y': `${20 + i * 10}%`,
              } as React.CSSProperties
            }
          >
            🏈
          </div>
        ))}
      </div>

      {/* Center victory message */}
      <div className="victory-content">
        <div className="victory-icon">
          <div className="trophy-bounce">🏆</div>
        </div>

        <h1 className="victory-title">
          <span className="word word-1">SEAHAWKS</span>
          <span className="word word-2">WIN!</span>
        </h1>

        <div className="victory-subtitle">
          <span className="flash-text">SUPER BOWL LX CHAMPIONS</span>
        </div>

        {/* Animated 12th Man banner */}
        <div className="twelfth-man-banner">
          <div className="banner-flag">
            <span>1️⃣2️⃣</span>
            <span className="banner-text">THE 12TH MAN</span>
          </div>
        </div>
      </div>

      {/* Stadium crowd wave effect at bottom */}
      <div className="crowd-wave">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="crowd-person"
            style={
              // eslint-disable-next-line no-restricted-syntax
              {
                '--person-delay': `${i * 0.05}s`,
                '--person-index': i,
              } as React.CSSProperties
            }
          >
            🙌
          </div>
        ))}
      </div>

      {/* Fireworks */}
      <div className="fireworks-display">
        <div className="firework fw-1"></div>
        <div className="firework fw-2"></div>
        <div className="firework fw-3"></div>
        <div className="firework fw-4"></div>
        <div className="firework fw-5"></div>
        <div className="firework fw-6"></div>
      </div>

      {/* Particle burst from center */}
      <div className="particle-burst">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={
              // eslint-disable-next-line no-restricted-syntax
              {
                '--angle': (i / 30) * 360,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
