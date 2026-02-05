// Celebration.tsx

import confetti from 'canvas-confetti';
import { useCallback } from 'react';

import { CELEBRATION } from '../constants/timing';
import { useAppContext } from '../context/AppContext';
import { SoundManager } from '../sound/manager';
import { getCurrentTeamId } from '../theme/apply';
import { getTeamTheme } from '../theme/teams';
import { logger } from '../utils/logger';

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
