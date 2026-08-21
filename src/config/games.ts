// Game configuration for multi-year Super Bowl support and weekly quizzes
// Each Super Bowl (LX, LXI, etc.) has its own registry entry.
// Weekly quizzes are not registered here — their configs are synthesized
// from date-based game IDs (e.g., "weekly-2026-08-26").

export type EventType = 'superbowl' | 'weekly';

export interface GameConfig {
  gameId: string; // e.g., "lx", "weekly-2026-08-26" - used in URLs and database
  eventType: EventType;
  displayName: string; // e.g., "Super Bowl LX" - shown in UI
  year: number; // e.g., 2026
  teams?: [string, string]; // Display names e.g., ["Seahawks", "Patriots"]; absent for weekly quizzes
  kickoffTime?: string; // ISO 8601 string for game kickoff (e.g., '2026-02-08T15:30:00-08:00')
  status?: 'upcoming' | 'in-progress' | 'completed'; // Game status for read-only mode
  quizDate?: string; // YYYY-MM-DD for weekly quizzes
}

/** Minutes before kickoff that submissions auto-close */
const SUBMISSION_CLOSE_MINUTES = 20;

/**
 * Get the submission deadline for a game (20 minutes before kickoff).
 * Returns null if no kickoff time is configured.
 */
export function getSubmissionDeadline(config: GameConfig): Date | null {
  if (!config.kickoffTime) return null;
  const kickoff = new Date(config.kickoffTime);
  return new Date(kickoff.getTime() - SUBMISSION_CLOSE_MINUTES * 60 * 1000);
}

/**
 * Get team theme IDs from a game config.
 * Derives IDs by lowercasing team names.
 * Returns null for events without teams (e.g., weekly quizzes).
 */
export function getTeamIds(config: GameConfig): [string, string] | null {
  if (!config.teams) return null;
  return [config.teams[0].toLowerCase(), config.teams[1].toLowerCase()];
}

/**
 * Registry of all Super Bowl games.
 * Add new entries here for each year.
 */
export const GAMES: Record<string, GameConfig> = {
  lx: {
    gameId: 'lx',
    eventType: 'superbowl',
    displayName: 'Super Bowl LX',
    year: 2026,
    teams: ['Seahawks', 'Patriots'],
    kickoffTime: '2026-02-08T15:30:00-08:00',
    status: 'completed',
  },
  // Future games can be added here:
  // lxi: {
  //   gameId: 'lxi',
  //   displayName: 'Super Bowl LXI',
  //   year: 2027,
  //   teams: ['TBD', 'TBD'],
  // },
};

/**
 * Default game ID when none can be determined from URL.
 */
export const DEFAULT_GAME_ID = 'lx';

// ============================================================================
// Weekly quizzes
//
// Weekly quiz game IDs are date-based: "weekly-YYYY-MM-DD". They are created
// dynamically (one per quiz week), so instead of registry entries their
// GameConfig is synthesized from the date in the ID.
// ============================================================================

const WEEKLY_GAME_ID_PREFIX = 'weekly-';
const QUIZ_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Check that a string is a real calendar date in YYYY-MM-DD form.
 */
export function isValidQuizDate(date: string): boolean {
  if (!QUIZ_DATE_PATTERN.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

/**
 * Build a weekly quiz game ID from a YYYY-MM-DD date.
 */
export function buildWeeklyGameId(quizDate: string): string {
  return `${WEEKLY_GAME_ID_PREFIX}${quizDate}`;
}

/**
 * Check if a game ID refers to a weekly quiz (valid date-based ID).
 */
export function isWeeklyGameId(gameId: string): boolean {
  const lower = gameId.toLowerCase();
  if (!lower.startsWith(WEEKLY_GAME_ID_PREFIX)) return false;
  return isValidQuizDate(lower.slice(WEEKLY_GAME_ID_PREFIX.length));
}

/**
 * Extract the quiz date (YYYY-MM-DD) from a weekly game ID, or null.
 */
export function getQuizDateFromGameId(gameId: string): string | null {
  if (!isWeeklyGameId(gameId)) return null;
  return gameId.toLowerCase().slice(WEEKLY_GAME_ID_PREFIX.length);
}

/**
 * Today's date as YYYY-MM-DD in the user's local timezone.
 */
function todayLocalISODate(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * The date (YYYY-MM-DD) of the upcoming quiz week: the next Sunday,
 * or today if today is Sunday. Used to auto-generate quiz dates at creation.
 */
export function getUpcomingQuizDate(now: Date = new Date()): string {
  const daysUntilSunday = (7 - now.getDay()) % 7;
  const sunday = new Date(now);
  sunday.setDate(now.getDate() + daysUntilSunday);
  return todayLocalISODate(sunday);
}

/**
 * Human-friendly label for a quiz date, e.g. "Aug 26, 2026".
 */
export function formatQuizDate(quizDate: string): string {
  const [year, month, day] = quizDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Synthesize a GameConfig for a weekly quiz game ID.
 * Status is derived from the quiz date: past dates are completed (read-only),
 * today's date is in-progress, future dates are upcoming.
 */
function buildWeeklyGameConfig(gameId: string): GameConfig | undefined {
  const quizDate = getQuizDateFromGameId(gameId);
  if (!quizDate) return undefined;

  const today = todayLocalISODate();
  const status: GameConfig['status'] =
    quizDate < today ? 'completed' : quizDate === today ? 'in-progress' : 'upcoming';

  return {
    gameId: buildWeeklyGameId(quizDate),
    eventType: 'weekly',
    displayName: `Weekly Quiz · ${formatQuizDate(quizDate)}`,
    year: Number(quizDate.slice(0, 4)),
    status,
    quizDate,
  };
}

/**
 * Get a game configuration by ID.
 * Super Bowl games come from the registry; weekly quiz configs are
 * synthesized from their date-based IDs.
 * Returns undefined if the game doesn't exist.
 */
export function getGameConfig(gameId: string): GameConfig | undefined {
  const lower = gameId.toLowerCase();
  if (lower in GAMES) return GAMES[lower];
  return buildWeeklyGameConfig(gameId);
}

/**
 * Check if a game ID is valid (registered Super Bowl or weekly quiz ID).
 */
export function isValidGameId(gameId: string): boolean {
  return gameId.toLowerCase() in GAMES || isWeeklyGameId(gameId);
}

/**
 * Get all available game IDs.
 */
export function getAvailableGameIds(): string[] {
  return Object.keys(GAMES);
}

/**
 * Check if a game is completed.
 */
export function isGameCompleted(config: GameConfig): boolean {
  return config.status === 'completed';
}

/**
 * Check if a game should be in read-only mode.
 * Returns false if the game doesn't exist.
 */
export function isGameReadOnly(gameId: string): boolean {
  const config = getGameConfig(gameId);
  return config ? isGameCompleted(config) : false;
}
