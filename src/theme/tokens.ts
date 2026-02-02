// Theme Token Definitions
// TypeScript definitions matching CSS custom properties for type-safe theming

/**
 * Core color tokens that define a theme.
 * These map directly to CSS custom properties.
 */
export interface ThemeTokens {
  // Primary colors
  primary: string;
  secondary: string;

  // Backgrounds
  background: string;
  backgroundAlt: string;

  // Text
  text: string;
  textMuted: string;
}

/**
 * Derived color tokens calculated from the base theme.
 * These are automatically generated when a theme is applied.
 */
export interface DerivedTokens {
  // Input states
  inputBg: string;
  inputHover: string;

  // Primary variants
  primaryHover: string;
  primaryRgb: string; // For rgba() usage

  // Surface colors
  surface: string;
  border: string;
}

/**
 * Complete theme tokens including base and derived values.
 */
export interface CompleteThemeTokens extends ThemeTokens, DerivedTokens {}

/**
 * CSS custom property names for theme tokens.
 */
export const CSS_VAR_NAMES = {
  // Base tokens
  primary: '--color-primary',
  secondary: '--color-secondary',
  background: '--color-background',
  backgroundAlt: '--color-background-alt',
  text: '--color-text',
  textMuted: '--color-text-muted',

  // Derived tokens
  inputBg: '--color-input-bg',
  inputHover: '--color-input-hover',
  primaryHover: '--color-primary-hover',
  primaryRgb: '--color-primary-rgb',
  surface: '--color-surface',
  border: '--color-border',

  // Header team colors (from game config)
  headerLeftBg: '--header-left-bg',
  headerRightBg: '--header-right-bg',
  headerLeftAccent: '--header-left-accent',
  headerRightAccent: '--header-right-accent',
} as const;

/**
 * Convert a hex color to RGB components.
 * @param hex - Hex color string (e.g., "#ff0000" or "ff0000")
 * @returns RGB string for use in CSS (e.g., "255, 0, 0")
 */
export function hexToRgb(hex: string): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Darken a hex color by a percentage.
 * @param hex - Hex color string
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color
 */
export function darkenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  const factor = 1 - percent / 100;
  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Lighten a hex color by a percentage.
 * @param hex - Hex color string
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened hex color
 */
export function lightenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  const factor = percent / 100;
  const newR = Math.round(r + (255 - r) * factor);
  const newG = Math.round(g + (255 - g) * factor);
  const newB = Math.round(b + (255 - b) * factor);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Calculate derived tokens from base theme tokens.
 * @param base - Base theme tokens
 * @returns Derived color tokens
 */
export function calculateDerivedTokens(base: ThemeTokens): DerivedTokens {
  return {
    inputBg: lightenColor(base.background, 8),
    inputHover: lightenColor(base.background, 12),
    primaryHover: darkenColor(base.primary, 15),
    primaryRgb: hexToRgb(base.primary),
    surface: lightenColor(base.background, 15),
    border: lightenColor(base.background, 25),
  };
}
