import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderAdminControls } from './AdminPanel';
import { updateState } from '../state/store';
import type { League } from '../types';

describe('components/AdminPanel', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="gameStatus"></div>';
    vi.stubGlobal('window', {
      location: {
        origin: 'http://localhost:3000',
        pathname: '/',
      },
      VITE_GIT_COMMIT: 'abc123',
      VITE_APP_ID: '12345678-1234-1234-1234-123456789012',
    });
  });

  describe('renderAdminControls', () => {
    it('should not render if statusDiv is missing', () => {
      document.body.innerHTML = '';
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      expect(document.body.innerHTML).toBe('');
    });

    it('should not render if currentLeague is missing', () => {
      updateState({ currentLeague: null });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      expect(statusDiv?.innerHTML).toBe('');
    });

    it('should render submissions controls when open', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      expect(statusDiv?.innerHTML).toContain('Submissions');
      expect(statusDiv?.innerHTML).toContain('🔓 Open');
      expect(statusDiv?.innerHTML).toContain('🔒 Closed');
      expect(statusDiv?.innerHTML).toContain('checked');
    });

    it('should render submissions controls when closed', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: false,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      const closedRadio = statusDiv?.querySelector<HTMLInputElement>(
        'input[name="submissions"][value="closed"]'
      );
      expect(closedRadio?.checked).toBe(true);
    });

    it('should render show predictions controls', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      expect(statusDiv?.innerHTML).toContain('Show All Answers');
      expect(statusDiv?.innerHTML).toContain('🔒 Hidden');
      expect(statusDiv?.innerHTML).toContain('👁️ Visible');
    });

    it('should check hidden radio when showAllPredictions is false', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      const hiddenRadio = statusDiv?.querySelector<HTMLInputElement>(
        'input[name="showPredictions"][value="hidden"]'
      );
      expect(hiddenRadio?.checked).toBe(true);
    });

    it('should check visible radio when showAllPredictions is true', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: true,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      const visibleRadio = statusDiv?.querySelector<HTMLInputElement>(
        'input[name="showPredictions"][value="visible"]'
      );
      expect(visibleRadio?.checked).toBe(true);
    });

    it('should render invite section with share URL', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      expect(statusDiv?.innerHTML).toContain('Invite Others');
      expect(statusDiv?.innerHTML).toContain('Share link:');
      expect(statusDiv?.innerHTML).toContain('Copy invite link');
      expect(statusDiv?.innerHTML).toContain('http://localhost:3000/lx/test-league');
    });

    it('should render QR code for share URL', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      const qrImage = statusDiv?.querySelector<HTMLImageElement>('img[alt="QR Code"]');
      expect(qrImage).toBeDefined();
      expect(qrImage?.src).toContain('api.qrserver.com');
      expect(qrImage?.src).toContain(encodeURIComponent('http://localhost:3000/lx/test-league'));
    });

    it('should render git commit and app ID', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      expect(statusDiv?.innerHTML).toContain('Commit:');
      expect(statusDiv?.innerHTML).toContain('abc123');
      expect(statusDiv?.innerHTML).toContain('DB:');
      expect(statusDiv?.innerHTML).toContain('...89012'); // Last 5 chars of app ID
    });

    it('should use "dev" as default git commit', () => {
      vi.stubGlobal('window', {
        location: {
          origin: 'http://localhost:3000',
          pathname: '/',
        },
        VITE_GIT_COMMIT: undefined,
        VITE_APP_ID: '12345',
      });

      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      expect(statusDiv?.innerHTML).toContain('dev');
    });

    it('should handle onclick handlers', () => {
      const league: League = {
        id: 'l1',
        gameId: 'lx',
        name: 'Test League',
        slug: 'test-league',
        creatorId: 'u1',
        isOpen: true,
        showAllPredictions: false,
        actualResults: null,
        createdAt: Date.now(),
      };
      updateState({ currentLeague: league });

      renderAdminControls();

      const statusDiv = document.getElementById('gameStatus');
      expect(statusDiv?.innerHTML).toContain('onchange="setSubmissions(true)"');
      expect(statusDiv?.innerHTML).toContain('onchange="setSubmissions(false)"');
      expect(statusDiv?.innerHTML).toContain('onchange="setShowPredictions(false)"');
      expect(statusDiv?.innerHTML).toContain('onchange="setShowPredictions(true)"');
      expect(statusDiv?.innerHTML).toContain('onclick="copyLeagueUrl(); return false;"');
    });
  });
});
