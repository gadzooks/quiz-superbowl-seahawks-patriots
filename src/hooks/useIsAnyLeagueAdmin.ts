import { db } from '../db/client';

/**
 * Whether the signed-in user admins at least one league (leagueAdmins link).
 * Weekly quizzes are global, so quiz authoring/grading is gated on being an
 * admin of *any* league rather than one specific league — mirrors the
 * isAnyLeagueAdmin bind in instant.perms.ts.
 */
export function useIsAnyLeagueAdmin(): boolean {
  const { user } = db.useAuth();

  const query = db.useQuery(
    user
      ? {
          $users: {
            $: { where: { id: user.id } },
            adminLeagues: {},
          },
        }
      : null
  );

  const userData = query.data?.$users[0];
  if (!userData || !('adminLeagues' in userData)) return false;
  const adminLeagues = userData.adminLeagues;
  return Array.isArray(adminLeagues) && adminLeagues.length > 0;
}
