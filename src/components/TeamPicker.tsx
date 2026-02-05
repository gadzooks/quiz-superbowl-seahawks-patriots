import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { setTeamTheme } from '../theme/apply';
import { getTeamLogoUrl } from '../theme/logos';
import { DEFAULT_TEAM_ID, getTeamOptions, getTeamTheme } from '../theme/teams';

export interface TeamPickerProps {
  onSelect: (teamId: string) => void;
}

interface DivisionTeams {
  'AFC East': Array<{ id: string; name: string }>;
  'AFC North': Array<{ id: string; name: string }>;
  'AFC South': Array<{ id: string; name: string }>;
  'AFC West': Array<{ id: string; name: string }>;
  'NFC East': Array<{ id: string; name: string }>;
  'NFC North': Array<{ id: string; name: string }>;
  'NFC South': Array<{ id: string; name: string }>;
  'NFC West': Array<{ id: string; name: string }>;
}

const DIVISION_MAP: Record<string, keyof DivisionTeams> = {
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

function isDivisionKey(key: string): key is keyof DivisionTeams {
  return (
    key === 'AFC East' ||
    key === 'AFC North' ||
    key === 'AFC South' ||
    key === 'AFC West' ||
    key === 'NFC East' ||
    key === 'NFC North' ||
    key === 'NFC South' ||
    key === 'NFC West'
  );
}

function getTeamsWithDivisions(): DivisionTeams {
  const teams = getTeamOptions();

  const divisions: DivisionTeams = {
    'AFC East': [],
    'AFC North': [],
    'AFC South': [],
    'AFC West': [],
    'NFC East': [],
    'NFC North': [],
    'NFC South': [],
    'NFC West': [],
  };

  for (const team of teams) {
    const division = DIVISION_MAP[team.id];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- team.id may not be in DIVISION_MAP
    if (division) {
      divisions[division].push(team);
    }
  }

  return divisions;
}

export function TeamPicker({ onSelect }: TeamPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const divisions = getTeamsWithDivisions();

  // Auto-focus search input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    if (selectedTeamId) {
      setTeamTheme(selectedTeamId);
      onSelect(selectedTeamId);
    }
  };

  const handleSkip = () => {
    setTeamTheme(DEFAULT_TEAM_ID);
    onSelect(DEFAULT_TEAM_ID);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
    } else if (e.key === 'Enter' && selectedTeamId) {
      handleConfirm();
    }
  };

  const selectedTheme = selectedTeamId ? getTeamTheme(selectedTeamId) : null;
  const logoUrl = selectedTeamId ? getTeamLogoUrl(selectedTeamId) : null;

  const lowerQuery = searchQuery.toLowerCase();
  const filteredDivisions: Partial<DivisionTeams> = {};
  for (const divisionKey of Object.keys(divisions)) {
    // Type guard: divisionKey is guaranteed to be a valid DivisionTeams key
    if (!isDivisionKey(divisionKey)) continue;
    const teams = divisions[divisionKey];
    const visibleTeams = teams.filter((team) => team.name.toLowerCase().includes(lowerQuery));
    if (visibleTeams.length > 0) {
      filteredDivisions[divisionKey] = visibleTeams;
    }
  }

  const hasVisibleTeams = Object.keys(filteredDivisions).length > 0;

  return (
    <div className="team-picker-overlay">
      <div className="team-picker-card">
        <div className="team-picker-title">🏈 Welcome!</div>
        <div className="team-picker-subtitle">Pick your favorite team</div>

        <div className="team-search-wrapper">
          <input
            ref={searchInputRef}
            type="text"
            className="team-search-input"
            placeholder="Search teams..."
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="team-search-clear"
            onClick={handleClearSearch}
            style={{ display: searchQuery ? 'block' : 'none' }}
            aria-label="Clear search"
          >
            ×
          </button>
        </div>

        <div className="team-list-wrapper">
          {hasVisibleTeams ? (
            Object.entries(filteredDivisions).map(([divisionName, teams]) => (
              <div key={divisionName}>
                <div className="division-header">{divisionName}</div>
                {teams.map((team) => {
                  const theme = getTeamTheme(team.id);
                  const isSelected = selectedTeamId === team.id;

                  return (
                    <div
                      key={team.id}
                      className={`team-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedTeamId(team.id)}
                    >
                      <div
                        className="team-color-swatch"
                        style={{
                          background: theme?.secondary ?? '#6366f1',
                        }}
                      />
                      <span className="team-name">{team.name}</span>
                      {isSelected && <span className="team-check">✓</span>}
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="no-teams">No teams found</div>
          )}
        </div>

        <div
          className="team-picker-preview"
          style={
            selectedTheme
              ? {
                  background: selectedTheme.background,
                  borderColor: selectedTheme.primary,
                }
              : undefined
          }
        >
          {selectedTheme ? (
            <>
              {logoUrl && (
                <img
                  src={logoUrl}
                  alt={selectedTheme.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'contain',
                    marginBottom: '8px',
                  }}
                />
              )}
              <div
                style={{
                  color: selectedTheme.primary,
                  fontWeight: 700,
                  fontSize: '18px',
                }}
              >
                {selectedTheme.name}
              </div>
            </>
          ) : (
            <span className="team-picker-preview-placeholder">Theme preview will appear here</span>
          )}
        </div>

        <button
          className="team-picker-btn"
          onClick={handleConfirm}
          disabled={!selectedTeamId}
          style={{ opacity: selectedTeamId ? '1' : '0.5' }}
        >
          Let's Go!
        </button>

        <button className="team-picker-skip-btn" onClick={handleSkip}>
          Skip
        </button>
      </div>
    </div>
  );
}
