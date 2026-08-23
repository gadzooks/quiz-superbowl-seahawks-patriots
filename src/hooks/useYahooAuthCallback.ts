import { useEffect } from 'react';

import { useToast } from '../context/ToastContext';
import { db } from '../db/client';
import {
  clearAuthErrorFromUrl,
  clearAuthTokenFromUrl,
  extractAuthErrorFromUrl,
  extractAuthTokenFromUrl,
} from '../utils/yahooAuth';

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_state: 'Sign-in expired or was tampered with. Please try again.',
  token_exchange_failed: 'Yahoo sign-in failed. Please try again.',
  no_email_scope: 'Yahoo did not share an email address. Please try again.',
};

/**
 * Handles the redirect back from the Yahoo OAuth broker: signs the user
 * into InstantDB if a token is present in the URL, or surfaces the error
 * otherwise. Call once near the app root — it processes the URL on mount
 * regardless of which route the user lands back on.
 */
export function useYahooAuthCallback(): void {
  const { showToast } = useToast();

  useEffect(() => {
    const token = extractAuthTokenFromUrl();
    if (token) {
      clearAuthTokenFromUrl();
      db.auth.signInWithToken(token).catch((err: unknown) => {
        console.error('Yahoo sign-in failed:', err);
        showToast('Sign-in failed. Please try again.', 'error');
      });
      return;
    }

    const errorCode = extractAuthErrorFromUrl();
    if (errorCode) {
      clearAuthErrorFromUrl();
      showToast(AUTH_ERROR_MESSAGES[errorCode] ?? 'Sign-in failed. Please try again.', 'error');
    }
  }, [showToast]);
}
