import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render } from './render';

// Mock the state module
vi.mock('../state/store', () => ({
  getState: vi.fn(() => ({
    currentLeague: null,
    expectedLeagueSlug: null,
    currentTab: 'predictions',
    isLeagueCreator: false,
    currentUserId: 'user-1',
    allPredictions: [],
  })),
  subscribe: vi.fn(() => vi.fn()),
}));

// Mock the screens module
vi.mock('./screens', () => ({
  showLeagueNotFound: vi.fn(),
}));

describe('ui/render', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="loading"></div>
      <div id="leagueCreation"></div>
      <div id="leagueNotFound"></div>
      <div id="teamNameEntry"></div>
      <div id="predictionsSection"></div>
      <div id="leaderboardSection"></div>
      <div id="resultsTab"></div>
      <div id="adminTab"></div>
      <div id="adminPanel"></div>
      <div id="userPanel"></div>
    `;
  });

  describe('render', () => {
    it('should not throw when no element is focused', () => {
      expect(() => render()).not.toThrow();
    });

    it('should not throw when number input is focused', () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.name = 'test-number';
      input.value = '42';
      document.body.appendChild(input);
      input.focus();

      expect(() => render()).not.toThrow();
    });

    it('should not throw when radio input is focused', () => {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'test-radio';
      input.value = 'option1';
      document.body.appendChild(input);
      input.focus();

      expect(() => render()).not.toThrow();
    });

    it('should not throw when text input is focused', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'test-text';
      input.value = 'hello';
      document.body.appendChild(input);
      input.focus();

      expect(() => render()).not.toThrow();
    });

    it('should restore focus to text input and move cursor to end', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'test-text';
      input.value = 'hello world';
      document.body.appendChild(input);
      input.focus();
      input.setSelectionRange(0, 0); // Set cursor to start

      render();

      expect(document.activeElement).toBe(input);
      expect(input.selectionStart).toBe(11); // End of "hello world"
      expect(input.selectionEnd).toBe(11);
    });

    it('should restore focus to number input without calling setSelectionRange', () => {
      const input = document.createElement('input');
      input.type = 'number';
      input.name = 'test-number';
      input.value = '123';
      document.body.appendChild(input);
      input.focus();

      // Mock setSelectionRange to verify it's not called
      const setSelectionRangeSpy = vi.spyOn(input, 'setSelectionRange');

      render();

      expect(document.activeElement).toBe(input);
      expect(setSelectionRangeSpy).not.toHaveBeenCalled();
    });

    it('should restore focus to radio input without calling setSelectionRange', () => {
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'test-radio';
      input.value = 'option1';
      document.body.appendChild(input);
      input.focus();

      // Radio inputs don't have setSelectionRange, but let's verify no error is thrown
      render();

      expect(document.activeElement).toBe(input);
    });

    it('should restore focus to input with id when name is not available', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = 'test-input-id';
      input.value = 'test';
      document.body.appendChild(input);
      input.focus();

      render();

      expect(document.activeElement).toBe(input);
    });
  });
});
