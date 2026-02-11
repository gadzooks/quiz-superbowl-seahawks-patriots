/**
 * Guest theme rotation utility.
 * Provides a rotating theme for guest users viewing completed games.
 */

// Recommended themes for guest users (neutral + popular teams)
const GUEST_THEME_ROTATION = [
  'neutral',
  'seahawks',
  'chiefs',
  'eagles',
  '49ers',
  'packers',
  'cowboys',
  'ravens',
  'bills',
  'bengals',
  'lions',
  'rams',
] as const;

/**
 * Get a guest theme that rotates daily based on day of year.
 * This ensures consistency across page refreshes within the same day.
 */
export function getGuestTheme(): string {
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const index = dayOfYear % GUEST_THEME_ROTATION.length;
  return GUEST_THEME_ROTATION[index];
}
