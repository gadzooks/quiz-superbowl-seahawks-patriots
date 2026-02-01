// teamPicker.ts

// Team Picker UI - Shows on first visit to select favorite team

import { getTeamOptions, getTeamTheme, DEFAULT_TEAM_ID } from '../theme/teams';
import { setTeamTheme, getSavedTeamId } from '../theme/apply';
import { getTeamLogoUrl } from '../theme/logos';

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

    // Add event listeners
    const select = document.getElementById('team-select') as HTMLSelectElement;
    const confirmBtn = document.getElementById('team-confirm-btn') as HTMLButtonElement;
    const preview = document.getElementById('team-preview') as HTMLDivElement;
    const skipBtn = document.getElementById('team-skip-btn') as HTMLButtonElement;

    // Preview theme on selection change
    select.addEventListener('change', () => {
      const teamId = select.value;
      if (teamId) {
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
        }
      }
    });

    // Confirm selection
    confirmBtn.addEventListener('click', () => {
      const teamId = select.value;
      if (teamId) {
        setTeamTheme(teamId);
        overlay.remove();
        resolve(teamId);
      }
    });

    // Skip button - use default theme (Seahawks)
    skipBtn.addEventListener('click', () => {
      setTeamTheme(DEFAULT_TEAM_ID);
      overlay.remove();
      resolve(DEFAULT_TEAM_ID);
    });
  });
}

/**
 * Create the HTML for the team picker.
 */
function createTeamPickerHTML(): string {
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

  // Build options HTML with optgroups
  let optionsHTML = '<option value="" disabled selected>Select your team...</option>';
  for (const [division, divTeams] of Object.entries(divisions)) {
    if (divTeams.length > 0) {
      optionsHTML += `<optgroup label="${division}">`;
      for (const team of divTeams) {
        optionsHTML += `<option value="${team.id}">${team.name}</option>`;
      }
      optionsHTML += '</optgroup>';
    }
  }

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
      }
      .team-picker-card {
        background: var(--color-background-alt, #1e293b);
        border-radius: 16px;
        padding: 32px;
        max-width: 400px;
        width: 100%;
        text-align: center;
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
      .team-picker-select {
        width: 100%;
        padding: 14px 16px;
        font-size: 18px;
        border-radius: 8px;
        border: 2px solid var(--color-text-muted, #94a3b8);
        background: var(--color-input-bg, #1e293b);
        color: var(--color-text, #fff);
        cursor: pointer;
        margin-bottom: 20px;
      }
      .team-picker-select:focus {
        outline: none;
        border-color: var(--color-primary, #6366f1);
      }
      .team-picker-preview {
        padding: 20px;
        border-radius: 12px;
        border: 2px dashed var(--color-text-muted, #94a3b8);
        margin-bottom: 24px;
        min-height: 70px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }
      .team-picker-preview-placeholder {
        color: var(--color-text-muted, #94a3b8);
        font-size: 14px;
      }
      .team-picker-btn {
        width: 100%;
        padding: 16px 24px;
        font-size: 18px;
        font-weight: 700;
        border-radius: 8px;
        border: none;
        background: var(--color-primary, #6366f1);
        color: #ffffff;
        cursor: pointer;
        transition: opacity 0.2s;
        margin-bottom: 12px;
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
        padding: 12px 24px;
        font-size: 16px;
        font-weight: 600;
        border-radius: 8px;
        border: 2px solid var(--color-text-muted, #94a3b8);
        background: transparent;
        color: var(--color-text-muted, #94a3b8);
        cursor: pointer;
        transition: all 0.2s;
      }
      .team-picker-skip-btn:hover {
        border-color: var(--color-text, #fff);
        color: var(--color-text, #fff);
      }
    </style>
    <div class="team-picker-card">
      <div class="team-picker-title">🏈 Welcome!</div>
      <div class="team-picker-subtitle">Pick your favorite team</div>

      <select id="team-select" class="team-picker-select">
        ${optionsHTML}
      </select>

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
