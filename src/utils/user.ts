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
 * Get the current user ID from localStorage without creating a new one.
 */
export function getCurrentUserId(): string | null {
  return localStorage.getItem('userId');
}

/**
 * Clear the current user ID.
 */
export function clearUserId(): void {
  localStorage.removeItem('userId');
}
