import { YahooSignIn } from './YahooSignIn';

/**
 * Persistent, app-wide sign-in control (Phase 3, see WEEKLY_QUIZ_PLAN.md).
 * Rendered once at the app root so it's visible on every page in both
 * products — Yahoo login is now required to create leagues or submit
 * predictions/quiz answers in either.
 */
export function AccountBar() {
  return (
    <div className="account-bar">
      <YahooSignIn />
    </div>
  );
}
