/**
 * Timing constants for auto-save, celebrations, and UI feedback
 */
export const AUTO_SAVE = {
  /** Debounce delay for radio/select saves — batches rapid clicks into one save */
  PREDICTIONS_IMMEDIATE_DELAY: 500,
  /** Debounce delay for predictions form (typing in number inputs) */
  PREDICTIONS_TYPING_DELAY: 2500,
  /** Debounce delay for results form (admin entering results) */
  RESULTS_INPUT_DELAY: 500,
  /** Duration to show "Saved" indicator after successful save */
  SAVED_INDICATOR_DURATION: 2000,
} as const;

export const CELEBRATION = {
  /** Duration of completion confetti animation */
  CONFETTI_DURATION: 3000,
  /** Duration of winner (top 3) celebration confetti */
  WINNER_DURATION: 5000,
  /** Interval between confetti particle bursts */
  PARTICLE_INTERVAL: 250,
  /** Duration to show non-winner position toast */
  TOAST_DURATION: 3000,
  /** Delay before starting toast fade-out animation */
  TOAST_FADE_DELAY: 300,
} as const;

export const AUDIO = {
  /** Volume level for audio playback (0.0 to 1.0) */
  VOLUME: 0.7,
  /** Frequency in Hz for success beep */
  SUCCESS_FREQUENCY: 880,
  /** Duration of success beep in seconds */
  SUCCESS_DURATION: 0.3,
  /** Frequency in Hz for click sound */
  CLICK_FREQUENCY: 440,
  /** Duration of click sound in seconds */
  CLICK_DURATION: 0.05,
  /** Gain level for success beep */
  SUCCESS_GAIN: 0.3,
  /** Gain level for click sound */
  CLICK_GAIN: 0.1,
  /** Final gain level for exponential ramp-down */
  FINAL_GAIN: 0.01,
} as const;

export const INTRO = {
  /** Duration per image in slideshow (ms) */
  IMAGE_DURATION: 2000,
  /** Duration of fade-out animation (ms) */
  FADE_OUT_DURATION: 500,
  /** Transition duration between images (ms) */
  IMAGE_TRANSITION: 150,
} as const;
