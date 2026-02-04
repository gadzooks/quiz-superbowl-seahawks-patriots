import { useState, useCallback, useEffect } from 'react';

import { useAppContext } from '../context/AppContext';
import { setTeamTheme } from '../theme/apply';
import { getTeamOptions, getTeamTheme } from '../theme/teams';

// Division mapping for organizing teams
const TEAM_DIVISIONS: Record<string, string> = {
  bills: 'AFC East',
  dolphins: 'AFC East',
  patriots: 'AFC East',
  jets: 'AFC East',
  ravens: 'AFC North',
  bengals: 'AFC North',
  browns: 'AFC North',
  steelers: 'AFC North',
  texans: 'AFC South',
  colts: 'AFC South',
  jaguars: 'AFC South',
  titans: 'AFC South',
  broncos: 'AFC West',
  chiefs: 'AFC West',
  raiders: 'AFC West',
  chargers: 'AFC West',
  cowboys: 'NFC East',
  giants: 'NFC East',
  eagles: 'NFC East',
  commanders: 'NFC East',
  bears: 'NFC North',
  lions: 'NFC North',
  packers: 'NFC North',
  vikings: 'NFC North',
  falcons: 'NFC South',
  panthers: 'NFC South',
  saints: 'NFC South',
  buccaneers: 'NFC South',
  cardinals: 'NFC West',
  rams: 'NFC West',
  '49ers': 'NFC West',
  seahawks: 'NFC West',
};

const DIVISION_ORDER = [
  'AFC East',
  'AFC North',
  'AFC South',
  'AFC West',
  'NFC East',
  'NFC North',
  'NFC South',
  'NFC West',
];

interface TeamsByDivision {
  [division: string]: Array<{ id: string; name: string }>;
}

/**
 * Floating Action Button (FAB) that opens a slide-up menu for changing theme.
 * Shows all NFL teams grouped by division.
 */
export function ThemeMenu() {
  const { currentTeamId, setCurrentTeamId } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  // Group teams by division
  const teamsByDivision: TeamsByDivision = {};
  DIVISION_ORDER.forEach((division) => {
    teamsByDivision[division] = [];
  });

  const teams = getTeamOptions();
  for (const team of teams) {
    const division = TEAM_DIVISIONS[team.id];
    if (division && teamsByDivision[division]) {
      teamsByDivision[division].push(team);
    }
  }

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleTeamClick = useCallback(
    (teamId: string) => {
      setTeamTheme(teamId);
      setCurrentTeamId(teamId);
      closeMenu();
    },
    [setCurrentTeamId, closeMenu]
  );

  const handleBackdropClick = useCallback(() => {
    closeMenu();
  }, [closeMenu]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeMenu]);

  return (
    <>
      {/* Backdrop */}
      <div
        id="theme-menu-backdrop"
        className={isOpen ? 'open' : ''}
        onClick={handleBackdropClick}
        aria-hidden={!isOpen}
      />

      {/* FAB Button */}
      <button
        id="theme-fab"
        className={isOpen ? 'open' : ''}
        onClick={toggleMenu}
        title="Change theme"
        aria-label="Change theme"
        aria-expanded={isOpen}
      >
        🎨
      </button>

      {/* Theme Menu */}
      <div id="theme-menu" className={isOpen ? 'open' : ''} role="dialog" aria-label="Choose Theme">
        <div className="theme-menu-header">
          <span className="theme-menu-title">Choose Theme</span>
          <button
            id="theme-menu-close"
            className="theme-menu-close"
            onClick={closeMenu}
            aria-label="Close theme menu"
          >
            ×
          </button>
        </div>
        <div className="theme-menu-scroll">
          {DIVISION_ORDER.map((division) => {
            const divisionTeams = teamsByDivision[division];
            if (!divisionTeams || divisionTeams.length === 0) return null;

            return (
              <div key={division}>
                <div className="theme-division-header">{division}</div>
                {divisionTeams.map((team) => {
                  const theme = getTeamTheme(team.id);
                  const isSelected = team.id === currentTeamId;

                  return (
                    <div
                      key={team.id}
                      className={`theme-option${isSelected ? ' selected' : ''}`}
                      onClick={() => handleTeamClick(team.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleTeamClick(team.id);
                        }
                      }}
                    >
                      <div
                        className="theme-option-swatch"
                        style={{ background: theme?.secondary }}
                      />
                      <span className="theme-option-name">{team.name}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
