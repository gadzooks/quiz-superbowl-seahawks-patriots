// IntroPage.tsx

import { useState, useEffect } from 'react';

import { INTRO } from '../constants/timing';
import { SoundManager } from '../sound/manager';
import { getCurrentTeamId } from '../theme/apply';

import { useConfetti } from './Celebration';
import '../styles/features/IntroPage.css';

const BASE = import.meta.env.BASE_URL;

const INTRO_IMAGES: Record<string, string[]> = {
  seahawks: [
    `${BASE}images/seahawks-1.png`,
    `${BASE}images/seahawks-2.jpg`,
    `${BASE}images/seahawks-3.png`,
    `${BASE}images/seahawks-4.jpg`,
    `${BASE}images/seahawks-5.jpg`,
    `${BASE}images/seahawks-6.jpg`,
    `${BASE}images/seahawks-7.png`,
  ],
  default: [`${BASE}images/intro/default/superbowl-logo.svg`],
};

interface IntroOverlayProps {
  teamName: string;
  onComplete: () => void;
}

/**
 * Intro overlay component shown after team registration
 * Displays animated Super Bowl experience with stadium effects
 */
export function IntroOverlay({ teamName, onComplete }: IntroOverlayProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { triggerConfetti } = useConfetti();
  const teamId = getCurrentTeamId();
  const images = INTRO_IMAGES[teamId] ?? INTRO_IMAGES.default;

  useEffect(() => {
    // Trigger confetti on mount
    triggerConfetti();

    // Play intro sound for Seahawks
    if (teamId === 'seahawks') {
      SoundManager.playIntro();
    }
  }, [teamId, triggerConfetti]);

  useEffect(() => {
    // Generate floating particles
    const particlesContainer = document.getElementById('intro-particles');
    if (!particlesContainer) return;

    const particleCount = 30;
    particlesContainer.innerHTML = ''; // Clear existing particles

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'intro-particle';

      particle.style.left = Math.random() * 100 + '%';
      particle.style.setProperty('--drift', (Math.random() - 0.5) * 200 + 'px');
      particle.style.animationDuration = Math.random() * 5 + 3 + 's';
      particle.style.animationDelay = Math.random() * 3 + 's';

      const size = Math.random() * 3 + 1;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';

      particlesContainer.appendChild(particle);
    }
  }, []);

  useEffect(() => {
    // Slideshow timer (if images are available)
    if (images.length > 0) {
      const totalDuration = images.length * INTRO.IMAGE_DURATION;
      const imageInterval = setInterval(() => {
        setCurrentImageIndex((prev) => {
          const next = prev + 1;
          if (next >= images.length) {
            clearInterval(imageInterval);
            return prev;
          }
          return next;
        });
      }, INTRO.IMAGE_DURATION);

      // Auto-dismiss after slideshow completes
      const dismissTimer = setTimeout(() => {
        setIsVisible(false);
        // Wait for fade-out animation then call onComplete
        setTimeout(() => {
          onComplete();
        }, INTRO.FADE_OUT_DURATION);
      }, totalDuration);

      return () => {
        clearInterval(imageInterval);
        clearTimeout(dismissTimer);
      };
    } else {
      // If no images, just show for 5 seconds
      const dismissTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onComplete();
        }, INTRO.FADE_OUT_DURATION);
      }, 5000);

      return () => clearTimeout(dismissTimer);
    }
  }, [images.length, onComplete]);

  // Handle click to skip
  const handleClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, INTRO.FADE_OUT_DURATION);
  };

  // Select 5 random images for Seahawks, all images for others
  const displayImages =
    teamId === 'seahawks' ? [...images].sort(() => Math.random() - 0.5).slice(0, 5) : images;

  return (
    <div className={`intro-overlay ${!isVisible ? 'fade-out' : ''}`} onClick={handleClick}>
      {/* Background slideshow images */}
      {displayImages.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`${teamName} intro`}
          className={`intro-background-image ${index === currentImageIndex ? 'active' : ''}`}
          style={{ display: index === currentImageIndex ? 'block' : 'none' }}
        />
      ))}

      {/* Stadium atmosphere overlay */}
      <div className="intro-stadium-overlay">
        {/* Spotlights */}
        <div className="intro-spotlight"></div>
        <div className="intro-spotlight"></div>
        <div className="intro-spotlight"></div>

        {/* Particles */}
        <div className="intro-particles" id="intro-particles"></div>

        {/* Energy rings */}
        <div className="intro-energy-ring"></div>
        <div className="intro-energy-ring"></div>
        <div className="intro-energy-ring"></div>

        {/* Cheer lines */}
        <div className="intro-cheer-lines">
          <div className="intro-cheer-line"></div>
          <div className="intro-cheer-line"></div>
          <div className="intro-cheer-line"></div>
          <div className="intro-cheer-line"></div>
        </div>
      </div>

      {/* Main content */}
      <div className="intro-content">
        <h1 className="intro-welcome-text">Welcome to the</h1>

        <div className="intro-football-container">
          <div className="intro-football-glow"></div>
          <div className="intro-football">🏈</div>
        </div>

        <h3 className="intro-subtitle">Super Bowl Experience!</h3>

        <h2 className="intro-team-name">{teamName}</h2>

        <p className="intro-action-prompt">Get ready for kickoff! ⚡</p>
      </div>
    </div>
  );
}
