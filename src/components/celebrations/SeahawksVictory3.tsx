// SeahawksVictory3.tsx - "Matrix Rain Championship"
// Digital/hacker style with falling numbers, glitch effects, and terminal aesthetics

import React, { useEffect, useRef, useState } from 'react';

import './SeahawksVictory3.css';

interface SeahawksVictory3Props {
  onComplete: () => void;
  duration?: number;
}

export function SeahawksVictory3({ onComplete, duration = 5000 }: SeahawksVictory3Props) {
  const [glitchActive, setGlitchActive] = useState(false);
  const [typedText, setTypedText] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fullText = 'SEAHAWKS_SUPER_BOWL_LX_CHAMPIONS';

  // Matrix rain effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '12SEAHAWKS⚡🏈🏆🦅01';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#69BE28';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  // Typing effect
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, [fullText]);

  // Glitch effect
  useEffect(() => {
    const glitchIntervals = [800, 1600, 2400, 3200, 4000];
    const glitchTimers = glitchIntervals.map((delay) =>
      setTimeout(() => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 150);
      }, delay)
    );

    const completeTimer = setTimeout(onComplete, duration);

    return () => {
      glitchTimers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className={`seahawks-victory-3 ${glitchActive ? 'glitch-active' : ''}`}>
      {/* Matrix rain canvas */}
      <canvas ref={canvasRef} className="matrix-canvas" />

      {/* Scan line overlay */}
      <div className="crt-overlay"></div>
      <div className="crt-scanline"></div>

      {/* Terminal window */}
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-buttons">
            <span className="btn-close"></span>
            <span className="btn-minimize"></span>
            <span className="btn-maximize"></span>
          </div>
          <div className="terminal-title">seahawks_victory.exe</div>
        </div>

        <div className="terminal-body">
          {/* Boot sequence */}
          <div className="boot-sequence">
            <div className="boot-line">{'>'} Initializing Championship Protocol...</div>
            <div className="boot-line delay-1">{'>'} Loading Victory Data...</div>
            <div className="boot-line delay-2">{'>'} Compiling NFL Records...</div>
            <div className="boot-line delay-3">{'>'} SUPER BOWL LX: COMPLETE ✓</div>
          </div>

          {/* Main typed message */}
          <div className="typed-message">
            <span className="terminal-prompt">seahawks@superbowl:~$</span>
            <span className="typed-text">{typedText}</span>
            <span className="cursor-blink">▌</span>
          </div>

          {/* Stats display */}
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">STATUS</div>
              <div className="stat-value glow">CHAMPIONS</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">RING_COUNT</div>
              <div className="stat-value">++</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">12TH_MAN</div>
              <div className="stat-value glow">LEGENDARY</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">TROPHY</div>
              <div className="stat-value">🏆</div>
            </div>
          </div>

          {/* Progress bars */}
          <div className="progress-bars">
            <div className="progress-item">
              <div className="progress-label">[HYPE_LEVEL]</div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill bar-full"></div>
              </div>
              <span className="progress-value">100%</span>
            </div>
            <div className="progress-item">
              <div className="progress-label">[CELEBRATION]</div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill bar-full delay-1"></div>
              </div>
              <span className="progress-value">MAX</span>
            </div>
          </div>

          {/* Victory banner */}
          <div className="ascii-banner">
            <pre className="ascii-art">
              {`
╦ ╦╦╔╗╔╔╗╔╔═╗╦═╗╔═╗
║║║║║║║║║║║╣ ╠╦╝╚═╗
╚╩╝╩╝╚╝╝╚╝╚═╝╩╚═╚═╝
`}
            </pre>
          </div>
        </div>
      </div>

      {/* Floating code fragments */}
      <div className="code-fragments">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="code-fragment"
            style={
              // eslint-disable-next-line no-restricted-syntax
              {
                '--frag-x': Math.random() * 100,
                '--frag-y': Math.random() * 100,
                '--frag-delay': Math.random() * 3,
                '--frag-duration': 4 + Math.random() * 3,
              } as React.CSSProperties
            }
          >
            {i % 5 === 0
              ? 'WIN()'
              : i % 5 === 1
                ? '0x12'
                : i % 5 === 2
                  ? 'CHAMPS'
                  : i % 5 === 3
                    ? '>> 1'
                    : '🏆'}
          </div>
        ))}
      </div>

      {/* Glitch overlays */}
      {glitchActive && (
        <>
          <div className="glitch-overlay glitch-1"></div>
          <div className="glitch-overlay glitch-2"></div>
          <div className="glitch-overlay glitch-3"></div>
        </>
      )}

      {/* Binary rain on sides */}
      <div className="binary-rain binary-left">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="binary-column"
            style={
              // eslint-disable-next-line no-restricted-syntax
              {
                '--binary-delay': i * 0.2,
              } as React.CSSProperties
            }
          >
            {Array.from({ length: 30 }).map((_, j) => (
              <span key={j}>{Math.random() > 0.5 ? '1' : '0'}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="binary-rain binary-right">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="binary-column"
            style={
              // eslint-disable-next-line no-restricted-syntax
              {
                '--binary-delay': i * 0.15,
              } as React.CSSProperties
            }
          >
            {Array.from({ length: 30 }).map((_, j) => (
              <span key={j}>{Math.random() > 0.5 ? '1' : '0'}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Corner badges */}
      <div className="corner-badge badge-tl">
        <div className="badge-text">LX</div>
      </div>
      <div className="corner-badge badge-tr">
        <div className="badge-text">2026</div>
      </div>
    </div>
  );
}
