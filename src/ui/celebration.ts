import { SoundManager } from '../sound/manager';
import { getState, updateState } from '../state/store';
import { getCurrentTeamId } from '../theme/apply';
import { getTeamTheme } from '../theme/teams';

import { showToast } from './toast';

/**
 * Call the main render function (exposed on window to avoid circular imports).
 * This ensures UI is properly updated after celebration ends.
 */
function callRender(): void {
  (window as Window & { render?: () => void }).render?.();
}

// Default/neutral colors (fallback)
const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#FFFFFF', '#FFD700'];

// Intro images by theme
const INTRO_IMAGES: Record<string, string[]> = {
  seahawks: [
    '/images/intro/seahawks/seahawks-1.png',
    '/images/intro/seahawks/seahawks-2.jpg',
    '/images/intro/seahawks/seahawks-3.png',
    '/images/intro/seahawks/seahawks-4.jpg',
    '/images/intro/seahawks/seahawks-5.jpg',
    '/images/intro/seahawks/seahawks-6.jpg',
    '/images/intro/seahawks/seahawks-7.png',
  ],
  default: ['/images/intro/default/superbowl-logo.svg'],
};

/**
 * Get confetti colors based on current theme
 */
function getConfettiColors(): string[] {
  const teamId = getCurrentTeamId();
  const theme = getTeamTheme(teamId);

  if (!theme) {
    return DEFAULT_COLORS; // Fallback
  }

  // Use team's actual colors
  return [
    theme.primary, // Main team color
    theme.secondary, // Secondary color
    theme.text, // White/light color
    '#FFD700', // Gold for celebration
  ];
}

/**
 * Get intro images based on current theme
 */
function getIntroImages(): string[] {
  const teamId = getCurrentTeamId();
  return INTRO_IMAGES[teamId] || INTRO_IMAGES.default;
}

/**
 * Check if current theme should show intro with sound
 */
function shouldShowIntroWithSound(): boolean {
  const teamId = getCurrentTeamId();
  return teamId === 'seahawks';
}

// Declare confetti as a global (loaded via CDN)
declare const confetti:
  | ((options: {
      particleCount?: number;
      spread?: number;
      angle?: number;
      origin?: { x?: number; y?: number };
      colors?: string[];
      disableForReducedMotion?: boolean;
    }) => void)
  | undefined;

/**
 * Check if confetti is available and motion is allowed.
 */
function canShowConfetti(): boolean {
  return (
    typeof confetti === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Safe confetti wrapper that handles the undefined check.
 */
function safeConfetti(options: Parameters<NonNullable<typeof confetti>>[0]): void {
  if (typeof confetti === 'function') {
    confetti(options);
  }
}

/**
 * Shuffle an array (Fisher-Yates algorithm).
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Trigger a basic confetti burst.
 */
export function triggerConfetti(): void {
  if (!canShowConfetti()) return;

  safeConfetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: getConfettiColors(),
    disableForReducedMotion: true,
  });
}

/**
 * Trigger winner celebration with multiple confetti bursts.
 */
let hasTriggeredWinnerCelebration = false;
export function triggerWinnerCelebration(): void {
  if (hasTriggeredWinnerCelebration) return;
  hasTriggeredWinnerCelebration = true;

  // Play winner sound
  SoundManager.playSuccess();

  if (!canShowConfetti()) return;

  const colors = getConfettiColors();

  // First burst
  safeConfetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    disableForReducedMotion: true,
  });

  // Second burst from left
  setTimeout(() => {
    safeConfetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
      disableForReducedMotion: true,
    });
  }, 250);

  // Third burst from right
  setTimeout(() => {
    safeConfetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
      disableForReducedMotion: true,
    });
  }, 400);
}

/**
 * Reset winner celebration state (for testing or new game).
 */
export function resetWinnerCelebration(): void {
  hasTriggeredWinnerCelebration = false;
}

/**
 * Celebration for non-winners when scores are finalized.
 */
export function triggerNonWinnerCelebration(_position: number): void {
  // Don't repeat if already shown
  const state = getState();
  if (state.hasTriggeredNonWinnerCelebration) return;

  // Play subtle sound
  SoundManager.playClick();

  // Show encouraging toast
  const messages = [
    'Great effort! 🎯',
    'Nice predictions! 👏',
    'Well played! 🏈',
    'You did your best! ⭐',
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  showToast(message, 'info', 3000);

  // Mark as shown
  updateState({ hasTriggeredNonWinnerCelebration: true });
}

/**
 * Show completion celebration - enhanced for mobile.
 */
export function showCompletionCelebration(): void {
  if (!canShowConfetti()) return;

  const colors = getConfettiColors();

  // Center burst
  safeConfetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.6 },
    colors,
    disableForReducedMotion: true,
  });

  // Left burst
  setTimeout(() => {
    safeConfetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
  }, 200);

  // Right burst
  setTimeout(() => {
    safeConfetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      disableForReducedMotion: true,
    });
  }, 400);

  // Final top burst
  setTimeout(() => {
    safeConfetti({
      particleCount: 75,
      spread: 100,
      origin: { y: 0.3 },
      colors,
      disableForReducedMotion: true,
    });
  }, 600);
}

/**
 * Show the intro overlay with team name and image slideshow.
 * For Seahawks: Full intro with sound and images
 * For other themes: Simple welcome with generic images (no sound)
 */
export function showIntroOverlay(teamName: string): void {
  const overlay = document.getElementById('introOverlay');
  const teamNameEl = document.getElementById('introTeamName');
  const introImage = document.getElementById('introImage') as HTMLImageElement | null;

  if (!overlay || !teamNameEl || !introImage) return;

  const IMAGE_DURATION = 2000;
  const TRANSITION_SPEED = 150;
  const isSeahawksTheme = shouldShowIntroWithSound();

  // Get theme-appropriate images
  const allImages = getIntroImages();

  // Pick images for slideshow (5 for Seahawks, 3 for others)
  const numImages = isSeahawksTheme ? 5 : 3;
  const slideshowImages = shuffleArray(allImages).slice(0, Math.min(numImages, allImages.length));

  // If no images available, skip slideshow but still auto-dismiss
  if (slideshowImages.length === 0) {
    introImage.style.display = 'none';
    // Auto-dismiss after a brief delay (3 seconds)
    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.classList.remove('fade-out');
        // Call render to ensure main panels are shown after celebration
        callRender();
      }, 500);
    }, 3000);
  } else {
    introImage.style.display = 'block';
    let currentIndex = 0;

    // Preload images
    slideshowImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    // Start with first image
    introImage.src = slideshowImages[0];
    introImage.style.opacity = '1';

    // Start slideshow with simple crossfade
    const slideshowInterval = setInterval(() => {
      currentIndex++;
      if (currentIndex < slideshowImages.length) {
        introImage.style.opacity = '0';
        setTimeout(() => {
          introImage.src = slideshowImages[currentIndex];
          introImage.style.opacity = '1';
        }, TRANSITION_SPEED);
      }
    }, IMAGE_DURATION);

    // Calculate total duration
    const totalDuration = slideshowImages.length * IMAGE_DURATION;

    // Auto-dismiss
    setTimeout(() => {
      clearInterval(slideshowInterval);
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.classList.remove('fade-out');
        introImage.src = '';
        introImage.style.opacity = '';
        introImage.style.transform = '';
        // Call render to ensure main panels are shown after celebration
        callRender();
      }, 500);
    }, totalDuration);
  }

  teamNameEl.textContent = `Team: ${teamName}`;
  overlay.classList.remove('hidden');

  // Reset football animation
  const footballEl = overlay.querySelector('.intro-football') as HTMLElement | null;
  const shadowEl = overlay.querySelector('.intro-football-shadow') as HTMLElement | null;
  if (footballEl) {
    footballEl.style.animation = 'none';
    void footballEl.offsetWidth;
    footballEl.style.animation = 'footballDrop 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
  }
  if (shadowEl) {
    shadowEl.style.animation = 'none';
    void shadowEl.offsetWidth;
    shadowEl.style.animation = 'shadowAppear 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
  }

  // Only play intro sound for Seahawks theme
  if (isSeahawksTheme) {
    SoundManager.playIntro();
  }

  // Trigger confetti
  triggerConfetti();
}

/**
 * Replay intro from header button.
 */
export function replayIntro(): void {
  const { currentTeamName } = getState();
  if (currentTeamName) {
    showIntroOverlay(currentTeamName);
  }
}
