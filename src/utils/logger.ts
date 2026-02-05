/**
 * Structured logging utility
 * Debug logs are disabled in production builds
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Debug-level logging - only shown in development
   * Use for detailed diagnostics, state dumps, and verbose tracing
   */
  debug: (message: string, data?: unknown): void => {
    if (isDev) {
      console.log(`[DEBUG] ${message}`, data ?? '');
    }
  },

  /**
   * Info-level logging - shown in all environments
   * Use for important application events and milestones
   */
  info: (message: string, data?: unknown): void => {
    console.info(`[INFO] ${message}`, data ?? '');
  },

  /**
   * Error-level logging - shown in all environments
   * Use for errors and exceptions that need attention
   */
  error: (message: string, data?: unknown): void => {
    console.error(`[ERROR] ${message}`, data ?? '');
  },

  /**
   * Warning-level logging - shown in all environments
   * Use for potential issues that don't prevent operation
   */
  warn: (message: string, data?: unknown): void => {
    console.warn(`[WARN] ${message}`, data ?? '');
  },
};
