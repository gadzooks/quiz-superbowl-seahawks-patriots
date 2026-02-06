import { SoundManager } from '../sound/manager';
import type { TabType } from '../types';

interface TabsProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  hasAdminAccess: boolean;
  isCreator: boolean;
  hasUnviewedScoreUpdate: boolean;
  teamName: string;
  showSeedTab?: boolean;
}

export function Tabs({
  currentTab,
  onTabChange,
  hasAdminAccess,
  isCreator,
  hasUnviewedScoreUpdate,
  showSeedTab = false,
}: TabsProps) {
  const handleTabClick = (tab: TabType) => {
    SoundManager.playClick();
    onTabChange(tab);
  };

  return (
    <div className="tabs tabs-boxed tabs-sticky mb-6" role="tablist">
      {/* Seed tab - only shown when game/questions not seeded */}
      {showSeedTab && (
        <button
          className={`tab ${currentTab === 'seed' ? 'tab-active' : ''}`}
          onClick={() => handleTabClick('seed')}
          role="tab"
          aria-selected={currentTab === 'seed'}
        >
          🌱 Setup
        </button>
      )}

      <button
        className={`tab ${currentTab === 'predictions' ? 'tab-active' : ''}`}
        onClick={() => handleTabClick('predictions')}
        role="tab"
        aria-selected={currentTab === 'predictions'}
      >
        Questions
      </button>

      <button
        className={`tab ${currentTab === 'scores' ? 'tab-active' : ''}`}
        onClick={() => handleTabClick('scores')}
        role="tab"
        aria-selected={currentTab === 'scores'}
      >
        Scores
        {hasUnviewedScoreUpdate && <span className="badge badge-primary badge-sm ml-1" />}
      </button>

      {hasAdminAccess && (
        <button
          className={`tab tab-results ${currentTab === 'results' ? 'tab-active' : ''}`}
          onClick={() => handleTabClick('results')}
          role="tab"
          aria-selected={currentTab === 'results'}
        >
          Results
        </button>
      )}

      {isCreator && (
        <button
          className={`tab ${currentTab === 'admin' ? 'tab-active' : ''}`}
          onClick={() => handleTabClick('admin')}
          role="tab"
          aria-selected={currentTab === 'admin'}
        >
          Admin
        </button>
      )}
    </div>
  );
}
