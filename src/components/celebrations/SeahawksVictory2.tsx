// SeahawksVictory2.tsx - "Boom Tower Shake"
// Mobile-first earthquake celebration with screen shake, explosions, and rising elements

import React, { useEffect, useState } from 'react';

import './SeahawksVictory2.css';

interface SeahawksVictory2Props {
  onComplete: () => void;
  duration?: number;
}

export function SeahawksVictory2({ onComplete, duration = 5000 }: SeahawksVictory2Props) {
  const [shake, setShake] = useState(false);
  const [explosionCount, setExplosionCount] = useState(0);

  useEffect(() => {
    // Shake sequence
    const shakeIntervals = [500, 1200, 1900, 2600, 3300];
    const shakeTimers = shakeIntervals.map((delay) =>
      setTimeout(() => {
        setShake(true);
        setTimeout(() => setShake(false), 300);
      }, delay)
    );

    // Explosions sequence
    const explosionTimer = setInterval(() => {
      setExplosionCount((prev) => prev + 1);
    }, 600);

    // Complete
    const completeTimer = setTimeout(() => {
      clearInterval(explosionTimer);
      onComplete();
    }, duration);

    return () => {
      shakeTimers.forEach(clearTimeout);
      clearInterval(explosionTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className={`seahawks-victory-2 ${shake ? 'shake-screen' : ''}`}>
      {/* Dynamic gradient background */}
      <div className="gradient-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Explosive particles from bottom */}
      <div className="explosion-particles">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="explosion-particle"
            style={
              // eslint-disable-next-line no-restricted-syntax
              {
                '--particle-x': Math.random(),
                '--particle-delay': Math.random() * 2,
                '--particle-speed': 2 + Math.random() * 3,
                '--particle-size': 4 + Math.random() * 8,
                '--particle-color':
                  i % 4 === 0
                    ? '#69BE28'
                    : i % 4 === 1
                      ? '#002244'
                      : i % 4 === 2
                        ? '#FFD700'
                        : '#fff',
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Rising seahawks logos/icons */}
      <div className="rising-icons">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="rising-icon"
            style={
              // eslint-disable-next-line no-restricted-syntax
              {
                '--icon-x': 10 + i * 7,
                '--icon-delay': i * 0.3,
                '--icon-duration': 4 + Math.random() * 2,
              } as React.CSSProperties
            }
          >
            {i % 4 === 0 ? '🦅' : i % 4 === 1 ? '💚' : i % 4 === 2 ? '⭐' : '🏆'}
          </div>
        ))}
      </div>

      {/* Main content stack */}
      <div className="victory-stack">
        {/* Massive W that builds */}
        <div className="giant-w">
          <div className="w-letter">W</div>
          <div className="w-shadow"></div>
        </div>

        {/* Stacked text elements that slide in */}
        <div className="text-stack">
          <div className="stack-item item-1">
            <span className="item-label">CHAMPIONS</span>
          </div>
          <div className="stack-item item-2">
            <span className="item-label glow-green">SEAHAWKS</span>
          </div>
          <div className="stack-item item-3">
            <span className="item-label">SUPER BOWL LX</span>
          </div>
        </div>

        {/* Expanding rings */}
        <div className="rings-container">
          <div className="expansion-ring ring-1"></div>
          <div className="expansion-ring ring-2"></div>
          <div className="expansion-ring ring-3"></div>
        </div>

        {/* Score/stats ticker at bottom */}
        <div className="victory-ticker">
          <div className="ticker-content">
            🏆 WORLD CHAMPIONS 🏆 12TH MAN FOREVER 🏆 SEATTLE PRIDE 🏆 WORLD CHAMPIONS 🏆
          </div>
        </div>
      </div>

      {/* Corner explosions */}
      {explosionCount > 0 && (
        <>
          {[...Array(Math.min(explosionCount, 8))].map((_, i) => (
            <div
              key={i}
              className="corner-explosion"
              style={
                // eslint-disable-next-line no-restricted-syntax
                {
                  '--explosion-x': i % 2 === 0 ? '10%' : '90%',
                  '--explosion-y': i < 4 ? '15%' : '85%',
                  '--explosion-delay': (i % 4) * 0.1,
                } as React.CSSProperties
              }
            >
              💥
            </div>
          ))}
        </>
      )}

      {/* Lens flare effect */}
      <div className="lens-flare">
        <div className="flare-1"></div>
        <div className="flare-2"></div>
        <div className="flare-3"></div>
      </div>

      {/* Scan lines for retro effect */}
      <div className="scan-lines"></div>
    </div>
  );
}
