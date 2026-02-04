import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { applyTeamTheme, getSavedTeamId } from '../theme/apply';
import { DEFAULT_TEAM_ID } from '../theme/teams';
import type { TabType } from '../types';
import { getUserId } from '../utils/user';

interface AppContextValue {
  currentUserId: string;
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  currentTeamId: string;
  setCurrentTeamId: (id: string) => void;
  hasShownCompletionCelebration: boolean;
  setHasShownCompletionCelebration: (v: boolean) => void;
  hasTriggeredWinnerCelebration: boolean;
  setHasTriggeredWinnerCelebration: (v: boolean) => void;
  hasTriggeredNonWinnerCelebration: boolean;
  setHasTriggeredNonWinnerCelebration: (v: boolean) => void;
  hasUnviewedScoreUpdate: boolean;
  setHasUnviewedScoreUpdate: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function getInitialTab(): TabType {
  const saved = localStorage.getItem('currentTab');
  if (saved === 'predictions' || saved === 'scores' || saved === 'results' || saved === 'admin') {
    return saved;
  }
  return 'predictions';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUserId] = useState(() => getUserId());
  const [currentTab, setCurrentTabRaw] = useState<TabType>(getInitialTab);
  const [currentTeamId, setCurrentTeamIdRaw] = useState(() => getSavedTeamId() ?? DEFAULT_TEAM_ID);
  const [hasShownCompletionCelebration, setHasShownCompletionCelebration] = useState(false);
  const [hasTriggeredWinnerCelebration, setHasTriggeredWinnerCelebration] = useState(false);
  const [hasTriggeredNonWinnerCelebration, setHasTriggeredNonWinnerCelebration] = useState(false);
  const [hasUnviewedScoreUpdate, setHasUnviewedScoreUpdate] = useState(false);

  const setCurrentTab = useCallback((tab: TabType) => {
    setCurrentTabRaw(tab);
    localStorage.setItem('currentTab', tab);
  }, []);

  const setCurrentTeamId = useCallback((id: string) => {
    setCurrentTeamIdRaw(id);
  }, []);

  // Apply theme when team changes
  useEffect(() => {
    applyTeamTheme(currentTeamId);
  }, [currentTeamId]);

  const value = useMemo<AppContextValue>(
    () => ({
      currentUserId,
      currentTab,
      setCurrentTab,
      currentTeamId,
      setCurrentTeamId,
      hasShownCompletionCelebration,
      setHasShownCompletionCelebration,
      hasTriggeredWinnerCelebration,
      setHasTriggeredWinnerCelebration,
      hasTriggeredNonWinnerCelebration,
      setHasTriggeredNonWinnerCelebration,
      hasUnviewedScoreUpdate,
      setHasUnviewedScoreUpdate,
    }),
    [
      currentUserId,
      currentTab,
      setCurrentTab,
      currentTeamId,
      setCurrentTeamId,
      hasShownCompletionCelebration,
      hasTriggeredWinnerCelebration,
      hasTriggeredNonWinnerCelebration,
      hasUnviewedScoreUpdate,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
