import { useToast } from '../context/ToastContext';
import { db } from '../db/client';
import { startYahooLogin } from '../utils/yahooAuth';

/**
 * Sign in/out control for the Yahoo OAuth broker (see WEEKLY_QUIZ_PLAN.md
 * Phase 2). Reads auth state via InstantDB's db.useAuth() — the token
 * itself is handled once, app-wide, by useYahooAuthCallback.
 */
export function YahooSignIn() {
  const { isLoading, user } = db.useAuth();
  const { showToast } = useToast();

  if (isLoading) {
    return <span className="loading loading-spinner loading-sm" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-base-content/70">{user.email ?? 'Signed in'}</span>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            db.auth.signOut().catch((err: unknown) => {
              console.error('Sign out failed:', err);
              showToast('Sign out failed. Please try again.', 'error');
            });
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="btn btn-primary btn-sm" onClick={() => startYahooLogin()}>
      Sign in with Yahoo
    </button>
  );
}
