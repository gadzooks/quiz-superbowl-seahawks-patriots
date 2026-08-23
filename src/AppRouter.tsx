import { useEffect, useState } from 'react';

import { LeagueCreation } from './components/LeagueCreation';
import { LeagueView } from './components/LeagueView';
import { TeamPicker } from './components/TeamPicker';
import { ThemeMenu } from './components/ThemeMenu';
import { WeeklyView } from './components/WeeklyView';
import { DEFAULT_GAME_ID, isGameReadOnly } from './config/games';
import { useAppContext } from './context/AppContext';
import { useUrlParams } from './hooks/useUrlParams';
import { useYahooAuthCallback } from './hooks/useYahooAuthCallback';
import { SoundManager } from './sound/manager';
import { initTheme, applyHeaderTeamColors, applyTeamTheme } from './theme/apply';
import { needsTeamSelection } from './ui/teamPicker';
import { getCurrentGameConfig } from './utils/game';
import { getGuestTheme } from './utils/guestTheme';

export function AppRouter() {
  useYahooAuthCallback();
  const { eventType, gameId, leagueSlug, quizDate } = useUrlParams();
  const isWeekly = eventType === 'weekly';
  const { setCurrentTeamId } = useAppContext();
  const [showTeamPicker, setShowTeamPicker] = useState(
    () => !isWeekly && needsTeamSelection(gameId ?? undefined)
  );
  const [initialized, setInitialized] = useState(false);

  // One-time app initialization
  useEffect(() => {
    if (!showTeamPicker) {
      let teamId: string;

      // Weekly quizzes have no team affiliation; completed games use guest theme
      if (isWeekly || (gameId !== null && isGameReadOnly(gameId))) {
        teamId = getGuestTheme();
        applyTeamTheme(teamId);
      } else {
        teamId = initTheme();
      }

      setCurrentTeamId(teamId);

      if (!isWeekly) {
        const gameConfig = getCurrentGameConfig();
        applyHeaderTeamColors(gameConfig);
      }
    }

    SoundManager.init();
    setInitialized(true);
  }, [gameId, isWeekly, showTeamPicker, setCurrentTeamId]);

  if (showTeamPicker) {
    return (
      <TeamPicker
        onSelect={(teamId) => {
          setCurrentTeamId(teamId);
          setShowTeamPicker(false);

          const gameConfig = getCurrentGameConfig();
          applyHeaderTeamColors(gameConfig);
        }}
      />
    );
  }

  if (!initialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (isWeekly) {
    return (
      <>
        <WeeklyView leagueSlug={leagueSlug} quizDate={quizDate} />
        <ThemeMenu />
      </>
    );
  }

  const superbowlGameId = gameId ?? DEFAULT_GAME_ID;

  if (!leagueSlug) {
    return (
      <>
        <LeagueCreation gameId={superbowlGameId} />
        <ThemeMenu />
      </>
    );
  }

  return (
    <>
      <LeagueView gameId={superbowlGameId} leagueSlug={leagueSlug} />
      <ThemeMenu />
    </>
  );
}
