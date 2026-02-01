// Floating Theme Menu - FAB for changing theme at any time

import { getTeamOptions, getTeamTheme, TEAM_THEMES } from '../theme/teams';
import { setTeamTheme, getCurrentTeamId } from '../theme/apply';
import { NEUTRAL_THEME_ID } from '../theme/neutral';

let isMenuOpen = false;

/**
 * Initialize the floating theme menu button.
 */
export function initThemeMenu(): void {
  // Create the FAB and menu
  const container = document.createElement('div');
  container.id = 'theme-menu-container';
  container.innerHTML = createThemeMenuHTML();
  document.body.appendChild(container);

  // Add event listeners
  const fab = document.getElementById('theme-fab') as HTMLButtonElement;
  const menu = document.getElementById('theme-menu') as HTMLDivElement;
  const backdrop = document.getElementById('theme-menu-backdrop') as HTMLDivElement;
  const closeBtn = document.getElementById('theme-menu-close') as HTMLButtonElement;

  fab.addEventListener('click', toggleMenu);
  backdrop.addEventListener('click', closeMenu);
  closeBtn.addEventListener('click', closeMenu);

  // Add team option click handlers
  menu.querySelectorAll('.theme-option').forEach((option) => {
    option.addEventListener('click', (e) => {
      const teamId = (e.currentTarget as HTMLElement).dataset.teamId;
      if (teamId) {
        setTeamTheme(teamId);
        updateSelectedState(teamId);
        closeMenu();
      }
    });
  });
}

function toggleMenu(): void {
  if (isMenuOpen) {
    closeMenu();
  } else {
    openMenu();
  }
}

function openMenu(): void {
  isMenuOpen = true;
  const menu = document.getElementById('theme-menu');
  const backdrop = document.getElementById('theme-menu-backdrop');
  const fab = document.getElementById('theme-fab');

  menu?.classList.add('open');
  backdrop?.classList.add('open');
  fab?.classList.add('open');

  // Update selected state
  updateSelectedState(getCurrentTeamId());
}

function closeMenu(): void {
  isMenuOpen = false;
  const menu = document.getElementById('theme-menu');
  const backdrop = document.getElementById('theme-menu-backdrop');
  const fab = document.getElementById('theme-fab');

  menu?.classList.remove('open');
  backdrop?.classList.remove('open');
  fab?.classList.remove('open');
}

function updateSelectedState(selectedId: string): void {
  document.querySelectorAll('.theme-option').forEach((option) => {
    const el = option as HTMLElement;
    if (el.dataset.teamId === selectedId) {
      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
    }
  });
}

function createThemeMenuHTML(): string {
  const teams = getTeamOptions();

  // Group teams by division
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

  // Sort teams into divisions
  for (const team of teams) {
    const division = teamDivisions[team.id];
    if (division && divisions[division]) {
      divisions[division].push(team);
    }
  }

  // Build team options HTML
  let teamsHTML = '';

  // Neutral option first
  const neutralTheme = TEAM_THEMES[NEUTRAL_THEME_ID];
  teamsHTML += `
    <div class="theme-option" data-team-id="${NEUTRAL_THEME_ID}">
      <div class="theme-option-swatch" style="background: ${neutralTheme.primary}"></div>
      <span class="theme-option-name">No Preference</span>
    </div>
  `;

  // Divider
  teamsHTML += '<div class="theme-divider"></div>';

  // Teams by division
  for (const [division, divTeams] of Object.entries(divisions)) {
    if (divTeams.length > 0) {
      teamsHTML += `<div class="theme-division-header">${division}</div>`;
      for (const team of divTeams) {
        const theme = getTeamTheme(team.id);
        teamsHTML += `
          <div class="theme-option" data-team-id="${team.id}">
            <div class="theme-option-swatch" style="background: ${theme?.primary}"></div>
            <span class="theme-option-name">${team.name}</span>
          </div>
        `;
      }
    }
  }

  return `
    <style>
      #theme-menu-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 998;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s, visibility 0.2s;
      }
      #theme-menu-backdrop.open {
        opacity: 1;
        visibility: visible;
      }

      #theme-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--color-primary);
        color: var(--color-background);
        border: none;
        cursor: pointer;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s, background 0.2s;
      }
      #theme-fab:hover {
        transform: scale(1.1);
      }
      #theme-fab:active {
        transform: scale(0.95);
      }
      #theme-fab.open {
        transform: rotate(45deg);
      }

      #theme-menu {
        position: fixed;
        bottom: 96px;
        right: 24px;
        width: 280px;
        max-height: 70vh;
        background: var(--color-background-alt);
        border-radius: 16px;
        z-index: 999;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        transform: translateY(20px) scale(0.95);
        opacity: 0;
        visibility: hidden;
        transition: transform 0.2s, opacity 0.2s, visibility 0.2s;
      }
      #theme-menu.open {
        transform: translateY(0) scale(1);
        opacity: 1;
        visibility: visible;
      }

      .theme-menu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid var(--color-border);
        background: var(--color-background);
      }
      .theme-menu-title {
        font-size: 16px;
        font-weight: 700;
        color: var(--color-text);
      }
      .theme-menu-close {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--color-text-muted);
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      .theme-menu-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .theme-menu-scroll {
        max-height: calc(70vh - 60px);
        overflow-y: auto;
        padding: 8px;
      }

      .theme-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .theme-option:hover {
        background: rgba(255, 255, 255, 0.05);
      }
      .theme-option.selected {
        background: rgba(var(--color-primary-rgb), 0.15);
      }
      .theme-option.selected .theme-option-name {
        color: var(--color-primary);
        font-weight: 600;
      }

      .theme-option-swatch {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        flex-shrink: 0;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }
      .theme-option-name {
        font-size: 14px;
        color: var(--color-text);
      }

      .theme-divider {
        height: 1px;
        background: var(--color-border);
        margin: 8px 12px;
      }

      .theme-division-header {
        font-size: 11px;
        font-weight: 700;
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 12px 12px 4px;
      }

      /* Larger touch targets on mobile */
      @media (max-width: 640px) {
        #theme-fab {
          bottom: 20px;
          right: 20px;
        }
        #theme-menu {
          right: 20px;
          bottom: 92px;
          width: calc(100vw - 40px);
          max-width: 320px;
        }
        .theme-option {
          padding: 14px 12px;
        }
      }
    </style>

    <div id="theme-menu-backdrop"></div>

    <button id="theme-fab" title="Change theme">
      🎨
    </button>

    <div id="theme-menu">
      <div class="theme-menu-header">
        <span class="theme-menu-title">Choose Theme</span>
        <button id="theme-menu-close" class="theme-menu-close">×</button>
      </div>
      <div class="theme-menu-scroll">
        ${teamsHTML}
      </div>
    </div>
  `;
}
