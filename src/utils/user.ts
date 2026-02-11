/**
 * Get or create a unique user ID.
 * Checks URL for user param first (for session recovery on different device),
 * then falls back to localStorage.
 */
export function getUserId(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const urlUserId = urlParams.get('user');

  if (urlUserId) {
    // Use the URL user ID and save to localStorage
    localStorage.setItem('userId', urlUserId);
    // Clean up URL to remove user parameter (keeps it private)
    urlParams.delete('user');
    const newUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    return urlUserId;
  }

  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
    localStorage.setItem('userId', userId);
  }
  return userId;
}

/**
 * Generate a guest user ID (session-only, not persisted).
 */
export function createGuestUserId(): string {
  return `guest-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

/**
 * Check if a user ID is a guest.
 */
export function isGuestUser(userId: string): boolean {
  return userId.startsWith('guest-');
}

/**
 * Get or create guest ID for current session (memory only).
 */
let sessionGuestId: string | null = null;
export function getOrCreateGuestId(): string {
  sessionGuestId ??= createGuestUserId();
  return sessionGuestId;
}
