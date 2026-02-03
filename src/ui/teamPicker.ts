// teamPicker.ts

// Team Picker UI - Shows on first visit to select favorite team

import { setTeamTheme, getSavedTeamId } from '../theme/apply';
import { getTeamLogoUrl } from '../theme/logos';
import { getTeamOptions, getTeamTheme, DEFAULT_TEAM_ID } from '../theme/teams';

/**
 * Check if user needs to pick a team (first visit).
 */
export function needsTeamSelection(): boolean {
  return getSavedTeamId() === null;
}

/**
 * Show the team picker overlay.
 * Returns a promise that resolves when user selects a team.
 */
export function showTeamPicker(): Promise<string> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.id = 'team-picker-overlay';
    overlay.innerHTML = createTeamPickerHTML();
    document.body.appendChild(overlay);

    // Get elements
    const searchInput = document.getElementById('team-search') as HTMLInputElement;
    const clearBtn = document.getElementById('team-search-clear') as HTMLButtonElement;
    const teamList = document.getElementById('team-list') as HTMLDivElement;
    const confirmBtn = document.getElementById('team-confirm-btn') as HTMLButtonElement;
    const preview = document.getElementById('team-preview') as HTMLDivElement;
    const skipBtn = document.getElementById('team-skip-btn') as HTMLButtonElement;

    let selectedTeamId: string | null = null;
    let filteredTeams = getAllTeamsWithDivisions();

    // Auto-focus search input
    setTimeout(() => searchInput.focus(), 100);

    // Render team list
    function renderTeamList(teams: ReturnType<typeof getAllTeamsWithDivisions>, filter = ''): void {
      const lowerFilter = filter.toLowerCase();
      let html = '';
      let hasVisibleTeams = false;

      for (const [division, divTeams] of Object.entries(teams)) {
        const visibleTeams = divTeams.filter((team) =>
          team.name.toLowerCase().includes(lowerFilter)
        );

        if (visibleTeams.length > 0) {
          hasVisibleTeams = true;
          html += `<div class="division-header">${division}</div>`;
          for (const team of visibleTeams) {
            const theme = getTeamTheme(team.id);
            const isSelected = selectedTeamId === team.id;
            html += `
              <div class="team-item ${isSelected ? 'selected' : ''}" data-team-id="${team.id}">
                <div class="team-color-swatch" style="background: ${theme?.secondary || '#6366f1'};"></div>
                <span class="team-name">${team.name}</span>
                ${isSelected ? '<span class="team-check">✓</span>' : ''}
              </div>
            `;
          }
        }
      }

      if (!hasVisibleTeams) {
        html = '<div class="no-teams">No teams found</div>';
      }

      teamList.innerHTML = html;

      // Add click handlers
      teamList.querySelectorAll('.team-item').forEach((item) => {
        item.addEventListener('click', () => {
          const teamId = (item as HTMLElement).dataset.teamId;
          if (teamId) {
            selectTeam(teamId);
          }
        });
      });
    }

    // Select a team
    function selectTeam(teamId: string): void {
      selectedTeamId = teamId;
      const theme = getTeamTheme(teamId);

      if (theme) {
        const logoUrl = getTeamLogoUrl(teamId);
        // Update preview colors
        preview.style.background = theme.background;
        preview.style.borderColor = theme.primary;
        preview.innerHTML = `
          ${logoUrl ? `<img src="${logoUrl}" alt="${theme.name}" style="width: 64px; height: 64px; object-fit: contain; margin-bottom: 8px;" />` : ''}
          <div style="color: ${theme.primary}; font-weight: 700; font-size: 18px;">${theme.name}</div>
        `;
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';

        // Re-render list to show selection
        renderTeamList(filteredTeams, searchInput.value);
      }
    }

    // Search input
    searchInput.addEventListener('input', () => {
      const filter = searchInput.value;
      clearBtn.style.display = filter ? 'block' : 'none';
      renderTeamList(filteredTeams, filter);
    });

    // Clear search
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearBtn.style.display = 'none';
      renderTeamList(filteredTeams, '');
      searchInput.focus();
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        renderTeamList(filteredTeams, '');
      } else if (e.key === 'Enter' && selectedTeamId) {
        confirmSelection();
      }
    });

    // Confirm selection
    function confirmSelection(): void {
      if (selectedTeamId) {
        setTeamTheme(selectedTeamId);
        overlay.remove();
        resolve(selectedTeamId);
      }
    }

    confirmBtn.addEventListener('click', confirmSelection);

    // Skip button - use default theme (Seahawks)
    skipBtn.addEventListener('click', () => {
      setTeamTheme(DEFAULT_TEAM_ID);
      overlay.remove();
      resolve(DEFAULT_TEAM_ID);
    });

    // Initial render
    renderTeamList(filteredTeams);
  });
}

/**
 * Get all teams organized by division.
 */
function getAllTeamsWithDivisions(): Record<string, Array<{ id: string; name: string }>> {
  const teams = getTeamOptions();

  // Group teams by division for better organization
  const divisions: Record<string, Array<{ id: string; name: string }>> = {
    'AFC East': [],
    'AFC North': [],
    'AFC South': [],
    'AFC West': [],
    'NFC East': [],
    'NFC North': [],
    'NFC South': [],
    'NFC West': [],
  };

  // Map team IDs to divisions
  const teamDivisions: Record<string, string> = {
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

  // Sort teams into divisions (excluding neutral theme)
  for (const team of teams) {
    const division = teamDivisions[team.id];
    if (division && divisions[division]) {
      divisions[division].push(team);
    }
  }

  return divisions;
}

/**
 * Create the HTML for the team picker.
 */
function createTeamPickerHTML(): string {
  return `
    <style>
      #team-picker-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        padding-top: calc(20px + env(safe-area-inset-top));
        padding-bottom: calc(20px + env(safe-area-inset-bottom));
      }
      .team-picker-card {
        background: var(--color-background-alt, #1e293b);
        border-radius: 16px;
        padding: var(--space-lg, 24px);
        padding-bottom: calc(var(--space-lg, 24px) + env(safe-area-inset-bottom));
        max-width: 500px;
        width: 100%;
        text-align: center;
        max-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 40px);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      .team-picker-title {
        font-size: 28px;
        font-weight: 700;
        color: var(--color-text, #fff);
        margin-bottom: 8px;
      }
      .team-picker-subtitle {
        font-size: 16px;
        color: var(--color-text-muted, #94a3b8);
        margin-bottom: 24px;
      }
      .team-search-wrapper {
        position: relative;
        margin-bottom: 16px;
      }
      .team-search-input {
        width: 100%;
        padding: 14px 40px 14px 16px;
        font-size: 16px;
        border-radius: 12px;
        border: 1.5px solid var(--color-text-muted, #94a3b8);
        background: var(--color-input-bg, #1e293b);
        color: var(--color-text, #fff);
      }
      .team-search-input:focus {
        outline: none;
        border-color: var(--color-primary, #6366f1);
      }
      .team-search-clear {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: var(--color-text-muted, #94a3b8);
        font-size: 20px;
        cursor: pointer;
        padding: 4px 8px;
        display: none;
      }
      .team-search-clear:hover {
        color: var(--color-text, #fff);
      }
      .team-list-wrapper {
        max-height: 400px;
        overflow-y: auto;
        border: 1.5px solid var(--color-text-muted, #94a3b8);
        border-radius: 12px;
        margin-bottom: var(--space-md, 16px);
        background: var(--color-input-bg, #1e293b);
        text-align: left;
        flex-shrink: 1;
        min-height: 120px;
      }
      .division-header {
        font-size: 13px;
        font-weight: 700;
        color: var(--color-text-muted, #94a3b8);
        padding: 12px 16px 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
      }
      .division-header:first-child {
        border-top: none;
      }
      .team-item {
        display: flex;
        align-items: center;
        gap: var(--space-md, 16px);
        padding: 14px 16px;
        cursor: pointer;
        transition: background 0.2s;
        min-height: 56px;
      }
      .team-item:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      .team-item.selected {
        background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.2);
      }
      .team-color-swatch {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .team-name {
        flex: 1;
        color: var(--color-text, #fff);
        font-size: 16px;
      }
      .team-check {
        color: var(--color-primary, #6366f1);
        font-size: 20px;
        font-weight: 700;
      }
      .no-teams {
        padding: 40px 20px;
        text-align: center;
        color: var(--color-text-muted, #94a3b8);
        font-size: 15px;
      }
      .team-picker-preview {
        padding: var(--space-md, 16px);
        border-radius: 12px;
        border: 1.5px dashed var(--color-text-muted, #94a3b8);
        margin-bottom: var(--space-md, 16px);
        min-height: 70px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        flex-shrink: 0;
      }
      .team-picker-preview-placeholder {
        color: var(--color-text-muted, #94a3b8);
        font-size: 15px;
      }
      .team-picker-btn {
        width: 100%;
        padding: 16px 24px;
        font-size: 18px;
        font-weight: 700;
        border-radius: 12px;
        border: none;
        background: var(--color-primary, #6366f1);
        color: #ffffff;
        cursor: pointer;
        transition: opacity 0.2s;
        margin-bottom: var(--space-sm, 12px);
        flex-shrink: 0;
        min-height: 56px;
      }
      .team-picker-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .team-picker-btn:not(:disabled):hover {
        opacity: 0.9;
      }
      .team-picker-skip-btn {
        width: 100%;
        padding: 14px 24px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 12px;
        border: 1.5px solid var(--color-text-muted, #94a3b8);
        background: transparent;
        color: var(--color-text-muted, #94a3b8);
        cursor: pointer;
        transition: all 0.2s;
        flex-shrink: 0;
        min-height: 48px;
      }
      .team-picker-skip-btn:hover {
        border-color: var(--color-text, #fff);
        color: var(--color-text, #fff);
      }

      /* Scrollbar styling */
      .team-list-wrapper::-webkit-scrollbar {
        width: 8px;
      }
      .team-list-wrapper::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
      }
      .team-list-wrapper::-webkit-scrollbar-thumb {
        background: var(--color-text-muted, #94a3b8);
        border-radius: 8px;
      }
      .team-list-wrapper::-webkit-scrollbar-thumb:hover {
        background: var(--color-text, #fff);
      }
    </style>
    <div class="team-picker-card">
      <div class="team-picker-title">🏈 Welcome!</div>
      <div class="team-picker-subtitle">Pick your favorite team</div>

      <div class="team-search-wrapper">
        <input
          type="text"
          id="team-search"
          class="team-search-input"
          placeholder="Search teams..."
          autocomplete="off"
        />
        <button id="team-search-clear" class="team-search-clear">×</button>
      </div>

      <div class="team-list-wrapper">
        <div id="team-list"></div>
      </div>

      <div id="team-preview" class="team-picker-preview">
        <span class="team-picker-preview-placeholder">Theme preview will appear here</span>
      </div>

      <button id="team-confirm-btn" class="team-picker-btn" disabled>
        Let's Go!
      </button>

      <button id="team-skip-btn" class="team-picker-skip-btn">
        Skip
      </button>
    </div>
  `;
}
