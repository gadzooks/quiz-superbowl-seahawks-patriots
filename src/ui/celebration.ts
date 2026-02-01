import { SoundManager } from '../sound/manager';
import { getCurrentTeamId } from '../theme/apply';
import { getState } from '../state/store';

// Seahawks team colors
const SEAHAWKS_COLORS = ['#33F200', '#00203B', '#FFFFFF', '#FFD700'];

// Default/neutral colors
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
  return teamId === 'seahawks' ? SEAHAWKS_COLORS : DEFAULT_COLORS;
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

  confetti!({
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
  confetti!({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    disableForReducedMotion: true,
  });

  // Second burst from left
  setTimeout(() => {
    confetti!({
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
    confetti!({
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
 * Show completion celebration - enhanced for mobile.
 */
export function showCompletionCelebration(): void {
  if (!canShowConfetti()) return;

  const colors = getConfettiColors();

  // Center burst
  confetti!({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.6 },
    colors,
    disableForReducedMotion: true,
  });

  // Left burst
  setTimeout(() => {
    confetti!({
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
    confetti!({
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
    confetti!({
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

  // If no images available, skip slideshow
  if (slideshowImages.length === 0) {
    introImage.style.display = 'none';
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

    // Transition effects
    const transitions = [
      {
        out: (img: HTMLElement) => {
          img.style.opacity = '0';
          img.style.transform = 'scale(1.1)';
        },
        in: (img: HTMLElement) => {
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
        },
      },
      {
        out: (img: HTMLElement) => {
          img.style.opacity = '0';
          img.style.transform = 'scale(0.9)';
        },
        in: (img: HTMLElement) => {
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
        },
      },
      {
        out: (img: HTMLElement) => {
          img.style.opacity = '0';
          img.style.transform = 'translateX(-30px)';
        },
        in: (img: HTMLElement) => {
          img.style.opacity = '1';
          img.style.transform = 'translateX(0)';
        },
      },
    ];

    // Start slideshow
    const slideshowInterval = setInterval(() => {
      currentIndex++;
      if (currentIndex < slideshowImages.length) {
        const transition = transitions[Math.floor(Math.random() * transitions.length)];
        transition.out(introImage);
        setTimeout(() => {
          introImage.src = slideshowImages[currentIndex];
          transition.in(introImage);
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
    footballEl.style.animation =
      'footballBounceStop 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
  }
  if (shadowEl) {
    shadowEl.style.animation = 'none';
    void shadowEl.offsetWidth;
    shadowEl.style.animation = 'shadowPulse 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
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
