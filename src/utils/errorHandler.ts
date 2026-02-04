/**
 * Error codes for categorizing application errors
 */
export enum ErrorCode {
  DATABASE = 'DATABASE_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  NETWORK = 'NETWORK_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  UNKNOWN = 'UNKNOWN_ERROR',
}

/**
 * Custom application error with structured data
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public userMessage: string,
    public context?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle database operation errors
 * Provides user-friendly messages for common database issues
 */
export function handleDatabaseError(error: unknown): AppError {
  console.error('[Database Error]:', error);

  const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
  const userMessage = 'Unable to save your changes. Please try again.';

  return new AppError(errorMessage, ErrorCode.DATABASE, userMessage, error);
}

/**
 * Handle validation errors
 * Formats validation issues into user-readable messages
 */
export function handleValidationError(errors: string[]): AppError {
  const message = `Validation failed: ${errors.join(', ')}`;
  const userMessage =
    errors.length === 1 ? errors[0] : `Please fix the following issues: ${errors.join(', ')}`;

  return new AppError(message, ErrorCode.VALIDATION, userMessage, errors);
}

/**
 * Handle network/fetch errors
 * Provides context for connection issues
 */
export function handleNetworkError(error: unknown): AppError {
  console.error('[Network Error]:', error);

  const errorMessage = error instanceof Error ? error.message : 'Network request failed';
  const userMessage = 'Connection error. Please check your internet and try again.';

  return new AppError(errorMessage, ErrorCode.NETWORK, userMessage, error);
}

/**
 * Handle unknown/generic errors
 * Fallback handler for unexpected errors
 */
export function handleUnknownError(error: unknown): AppError {
  console.error('[Unknown Error]:', error);

  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  const userMessage = 'Something went wrong. Please try again.';

  return new AppError(errorMessage, ErrorCode.UNKNOWN, userMessage, error);
}

/**
 * Main error handler that categorizes and formats errors
 */
export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof TypeError || error instanceof ReferenceError) {
    return handleUnknownError(error);
  }

  // Default to database error for most cases
  return handleDatabaseError(error);
}
