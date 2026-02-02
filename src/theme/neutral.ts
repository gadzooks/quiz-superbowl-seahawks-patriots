// Neutral Theme Definition
// A non-team-specific theme with indigo accent for users who don't want team colors

import type { TeamTheme } from './teams';

/**
 * Neutral theme with indigo accent color.
 * Uses a professional dark slate palette that doesn't favor any team.
 */
export const neutralTheme: TeamTheme = {
  name: 'No Preference',
  primary: '#6366f1', // Indigo 500
  secondary: '#8b5cf6', // Purple 500
  background: '#0f172a', // Slate 900
  backgroundAlt: '#1e293b', // Slate 800
  text: '#f8fafc', // Slate 50
  textMuted: '#94a3b8', // Slate 400
};

/**
 * Neutral theme ID used throughout the app.
 */
export const NEUTRAL_THEME_ID = 'neutral';
