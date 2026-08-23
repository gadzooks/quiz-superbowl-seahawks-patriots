// Client side of the Yahoo OAuth broker (netlify/functions/auth-yahoo-*.ts).
// See WEEKLY_QUIZ_PLAN.md Phase 2.

const TOKEN_HASH_PREFIX = '#instant_auth_token=';

/** Redirects to the Netlify Function that starts the Yahoo login flow. */
export function startYahooLogin(returnTo: string = window.location.pathname): void {
  const url = new URL('/.netlify/functions/auth-yahoo-login', window.location.origin);
  url.searchParams.set('returnTo', returnTo);
  window.location.href = url.toString();
}

/** Reads the InstantDB sign-in token left in the URL fragment by auth-yahoo-callback.ts, if any. */
export function extractAuthTokenFromUrl(): string | null {
  if (!window.location.hash.startsWith(TOKEN_HASH_PREFIX)) return null;
  const token = window.location.hash.slice(TOKEN_HASH_PREFIX.length);
  return token || null;
}

/** Removes the token from the URL so it isn't left in browser history or bookmarks. */
export function clearAuthTokenFromUrl(): void {
  const { pathname, search } = window.location;
  window.history.replaceState(null, '', pathname + search);
}

/** Reads the ?auth_error=... query param set by auth-yahoo-callback.ts on failure, if any. */
export function extractAuthErrorFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('auth_error');
}

/** Removes auth_error from the URL so a page refresh doesn't re-show the same error. */
export function clearAuthErrorFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('auth_error');
  window.history.replaceState(null, '', url.pathname + url.search);
}
