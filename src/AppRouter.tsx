import { useEffect, useState } from 'react';

import { LeagueCreation } from './components/LeagueCreation';
import { LeagueView } from './components/LeagueView';
import { TeamPicker } from './components/TeamPicker';
import { ThemeMenu } from './components/ThemeMenu';
import { useAppContext } from './context/AppContext';
import { useUrlParams } from './hooks/useUrlParams';
import { SoundManager } from './sound/manager';
import { initTheme, applyHeaderTeamColors } from './theme/apply';
import { needsTeamSelection } from './ui/teamPicker';
import { getCurrentGameConfig } from './utils/game';

export function AppRouter() {
  const { gameId, leagueSlug } = useUrlParams();
  const { setCurrentTeamId } = useAppContext();
  const [showTeamPicker, setShowTeamPicker] = useState(() => needsTeamSelection());
  const [initialized, setInitialized] = useState(false);

  // One-time app initialization
  useEffect(() => {
    if (!showTeamPicker) {
      const teamId = initTheme();
      setCurrentTeamId(teamId);

      const gameConfig = getCurrentGameConfig();
      applyHeaderTeamColors(gameConfig);
    }

    SoundManager.init();
    setInitialized(true);
  }, []);

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

  if (!leagueSlug) {
    return (
      <>
        <LeagueCreation gameId={gameId} />
        <ThemeMenu />
      </>
    );
  }

  return (
    <>
      <LeagueView gameId={gameId} leagueSlug={leagueSlug} />
      <ThemeMenu />
    </>
  );
}
