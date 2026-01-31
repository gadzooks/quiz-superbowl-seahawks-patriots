import { SoundManager } from '../sound/manager';

// Seahawks team colors
const SEAHAWKS_COLORS = ['#33F200', '#00203B', '#FFFFFF', '#FFD700'];

// Intro images for slideshow
const introImages = [
  '/images/seahawks-1.png',
  '/images/seahawks-2.jpg',
  '/images/seahawks-3.png',
  '/images/seahawks-4.jpg',
  '/images/seahawks-5.jpg',
  '/images/seahawks-6.jpg',
  '/images/seahawks-7.png',
];

// Declare confetti as a global (loaded via CDN)
declare const confetti: ((options: {
  particleCount?: number;
  spread?: number;
  angle?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  disableForReducedMotion?: boolean;
}) => void) | undefined;

/**
 * Check if confetti is available and motion is allowed.
 */
function canShowConfetti(): boolean {
  return (
    typeof confetti === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
    colors: SEAHAWKS_COLORS,
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

  // First burst
  confetti!({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: SEAHAWKS_COLORS,
    disableForReducedMotion: true,
  });

  // Second burst from left
  setTimeout(() => {
    confetti!({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: SEAHAWKS_COLORS,
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
      colors: SEAHAWKS_COLORS,
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

  // Center burst
  confetti!({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.6 },
    colors: SEAHAWKS_COLORS,
    disableForReducedMotion: true,
  });

  // Left burst
  setTimeout(() => {
    confetti!({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: SEAHAWKS_COLORS,
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
      colors: SEAHAWKS_COLORS,
      disableForReducedMotion: true,
    });
  }, 400);

  // Final top burst
  setTimeout(() => {
    confetti!({
      particleCount: 75,
      spread: 100,
      origin: { y: 0.3 },
      colors: SEAHAWKS_COLORS,
      disableForReducedMotion: true,
    });
  }, 600);
}

/**
 * Show the intro overlay with team name and image slideshow.
 */
export function showIntroOverlay(teamName: string): void {
  const overlay = document.getElementById('introOverlay');
  const teamNameEl = document.getElementById('introTeamName');
  const introImage = document.getElementById('introImage') as HTMLImageElement | null;

  if (!overlay || !teamNameEl || !introImage) return;

  const IMAGE_DURATION = 2000;
  const TRANSITION_SPEED = 150;

  // Pick 5 random images
  const slideshowImages = shuffleArray(introImages).slice(0, 5);
  let currentIndex = 0;

  // Preload images
  slideshowImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  // Start with first image
  introImage.src = slideshowImages[0];
  introImage.style.opacity = '1';

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
    shadowEl.style.animation =
      'shadowPulse 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
  }

  // Play intro sound
  SoundManager.playIntro();

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
  const totalDuration = slideshowImages.length * IMAGE_DURATION;
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

  // Trigger confetti
  triggerConfetti();
}
