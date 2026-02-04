import confetti from 'canvas-confetti';
import { useCallback, useEffect, useState } from 'react';

import { CELEBRATION, INTRO } from '../constants/timing';
import { useAppContext } from '../context/AppContext';
import { SoundManager } from '../sound/manager';
import { getCurrentTeamId } from '../theme/apply';
import { getTeamTheme } from '../theme/teams';
import { logger } from '../utils/logger';

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

/**
 * Hook providing confetti celebration effects with theme colors
 * Uses AppContext to track celebration state across component instances
 */
export function useConfetti() {
  const {
    hasTriggeredWinnerCelebration,
    setHasTriggeredWinnerCelebration,
    hasTriggeredNonWinnerCelebration,
    setHasTriggeredNonWinnerCelebration,
  } = useAppContext();

  const getThemeColors = useCallback(() => {
    const teamId = getCurrentTeamId();
    const theme = getTeamTheme(teamId);

    if (theme) {
      return [
        theme.primary,
        theme.secondary,
        theme.text,
        '#FFD700', // Gold
      ];
    }

    // Fallback colors
    return ['#6366f1', '#8b5cf6', '#FFFFFF', '#FFD700'];
  }, []);

  const shouldReduceMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const triggerConfetti = useCallback(() => {
    const colors = getThemeColors();

    void confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      disableForReducedMotion: true,
    });
  }, [getThemeColors]);

  const showCompletionCelebration = useCallback(() => {
    logger.debug('[Celebration] showCompletionCelebration called', {
      reducedMotion: shouldReduceMotion(),
    });

    if (shouldReduceMotion()) {
      logger.debug('[Celebration] Skipping confetti due to prefers-reduced-motion');
      return;
    }

    logger.debug('[Celebration] Starting confetti animation!');
    const colors = getThemeColors();
    const duration = CELEBRATION.CONFETTI_DURATION;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      void confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.3),
          y: Math.random() - 0.2,
        },
        colors,
        disableForReducedMotion: true,
      });

      void confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.7, 0.9),
          y: Math.random() - 0.2,
        },
        colors,
        disableForReducedMotion: true,
      });
    }, CELEBRATION.PARTICLE_INTERVAL);
  }, [getThemeColors, shouldReduceMotion]);

  const triggerWinnerCelebration = useCallback(() => {
    if (hasTriggeredWinnerCelebration) {
      return;
    }

    setHasTriggeredWinnerCelebration(true);

    if (shouldReduceMotion()) {
      SoundManager.playSuccess();
      return;
    }

    const colors = getThemeColors();
    const duration = CELEBRATION.WINNER_DURATION;
    const animationEnd = Date.now() + duration;

    SoundManager.playSuccess();

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 100 * (timeLeft / duration);

      void confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
        colors,
        disableForReducedMotion: true,
      });
    }, CELEBRATION.PARTICLE_INTERVAL);
  }, [
    getThemeColors,
    shouldReduceMotion,
    hasTriggeredWinnerCelebration,
    setHasTriggeredWinnerCelebration,
  ]);

  const triggerNonWinnerCelebration = useCallback(
    (position: number) => {
      if (hasTriggeredNonWinnerCelebration) {
        return;
      }

      setHasTriggeredNonWinnerCelebration(true);

      SoundManager.playClick();

      // Show toast with position
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = `You finished in position #${position}! Great job!`;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('toast-hide');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, CELEBRATION.TOAST_FADE_DELAY);
      }, CELEBRATION.TOAST_DURATION);
    },
    [hasTriggeredNonWinnerCelebration, setHasTriggeredNonWinnerCelebration]
  );

  return {
    triggerConfetti,
    showCompletionCelebration,
    triggerWinnerCelebration,
    triggerNonWinnerCelebration,
  };
}

interface IntroOverlayProps {
  teamName: string;
  onComplete: () => void;
}

/**
 * Intro overlay component shown after team registration
 * Displays team images slideshow with football animation
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
    // Slideshow timer
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
  }, [images.length, onComplete]);

  // Select 5 random images for Seahawks, all images for others
  const displayImages =
    teamId === 'seahawks' ? [...images].sort(() => Math.random() - 0.5).slice(0, 5) : images;

  return (
    <div className={`intro-overlay ${!isVisible ? 'fade-out' : ''}`}>
      {displayImages.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={`${teamName} intro`}
          className={`intro-image ${index === currentImageIndex ? 'active' : ''}`}
          style={{ display: index === currentImageIndex ? 'block' : 'none' }}
        />
      ))}

      <div className="intro-content">
        <div className="intro-football-container">
          <div className="intro-football">🏈</div>
          <div className="intro-football-shadow"></div>
        </div>

        <div className="intro-title">
          Welcome to the
          <div className="intro-team-name">{teamName}</div>
          Super Bowl Experience!
        </div>
      </div>
    </div>
  );
}
