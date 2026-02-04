import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { handleLeagueCreation } from '../handlers/league';
import { buildGamePath } from '../utils/game';

import { LeagueCreation } from './LeagueCreation';

// Mock dependencies
vi.mock('../handlers/league');
vi.mock('../utils/game');

// Mock db.client - the mock will be controlled per test
const mockUseQuery = vi.fn();
vi.mock('../db/client', () => ({
  db: {
    useQuery: (...args: unknown[]) => mockUseQuery(...args),
  },
}));

describe('LeagueCreation', () => {
  const mockBuildGamePath = vi.fn();
  const mockHandleLeagueCreation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window methods
    delete (window as Partial<Window>).location;
    // @ts-expect-error - Mocking location for testing purposes
    window.location = { reload: vi.fn() } as unknown as Location;
    window.history.pushState = vi.fn();
    window.alert = vi.fn();

    // Setup mocks
    vi.mocked(buildGamePath).mockImplementation(mockBuildGamePath);
    vi.mocked(handleLeagueCreation).mockImplementation(mockHandleLeagueCreation);

    mockBuildGamePath.mockReturnValue('/superbowl/lx/good-vibes');

    // Reset db.useQuery mock to return no league by default
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  describe('form rendering', () => {
    it('should render league creation form', () => {
      render(<LeagueCreation gameId="lx" />);

      expect(screen.getByText('Create Your League')).toBeInTheDocument();
      expect(screen.getByLabelText('League Name')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create League' })).toBeInTheDocument();
    });

    it('should have placeholder text in input', () => {
      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByPlaceholderText('e.g., Good Vibes');
      expect(input).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should rely on native HTML5 required validation for empty fields', () => {
      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');

      // Input has required attribute for native validation
      expect(input).toHaveAttribute('required');
    });

    it('should show alert if league name is only whitespace', async () => {
      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');
      const submitButton = screen.getByRole('button', { name: 'Create League' });

      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Please enter a league name');
      });
      expect(mockHandleLeagueCreation).not.toHaveBeenCalled();
    });
  });

  describe('successful league creation', () => {
    it('should call handleLeagueCreation with trimmed name', async () => {
      mockHandleLeagueCreation.mockResolvedValue({
        success: true,
        slug: 'good-vibes',
      });

      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');
      const submitButton = screen.getByRole('button', { name: 'Create League' });

      fireEvent.change(input, { target: { value: '  Good Vibes  ' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockHandleLeagueCreation).toHaveBeenCalledWith('Good Vibes');
      });
    });

    it('should navigate to new league URL after successful creation', async () => {
      mockHandleLeagueCreation.mockResolvedValue({
        success: true,
        slug: 'good-vibes',
      });

      // Mock useQuery to return the league once it's created
      mockUseQuery.mockReturnValue({
        data: {
          games: [
            {
              gameId: 'lx',
              leagues: [{ slug: 'good-vibes' }],
            },
          ],
        },
        isLoading: false,
        error: null,
      });

      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');
      const submitButton = screen.getByRole('button', { name: 'Create League' });

      fireEvent.change(input, { target: { value: 'Good Vibes' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockBuildGamePath).toHaveBeenCalledWith('lx', 'good-vibes');
        expect(window.history.pushState).toHaveBeenCalledWith({}, '', '/superbowl/lx/good-vibes');
      });
    });

    it('should reload page after navigation', async () => {
      mockHandleLeagueCreation.mockResolvedValue({
        success: true,
        slug: 'good-vibes',
      });

      // Mock useQuery to return the league once it's created
      mockUseQuery.mockReturnValue({
        data: {
          games: [
            {
              gameId: 'lx',
              leagues: [{ slug: 'good-vibes' }],
            },
          ],
        },
        isLoading: false,
        error: null,
      });

      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');
      const submitButton = screen.getByRole('button', { name: 'Create League' });

      fireEvent.change(input, { target: { value: 'Good Vibes' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.location.reload).toHaveBeenCalled();
      });
    });

    it('should disable submit button while creating', async () => {
      let resolveCreation: (value: unknown) => void;
      const creationPromise = new Promise((resolve) => {
        resolveCreation = resolve;
      });
      mockHandleLeagueCreation.mockReturnValue(creationPromise as Promise<never>);

      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');
      const submitButton = screen.getByRole('button', { name: 'Create League' });

      fireEvent.change(input, { target: { value: 'Good Vibes' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent('Creating...');
      });

      // Cleanup
      resolveCreation!({ success: true, slug: 'good-vibes' });
    });
  });

  describe('error handling', () => {
    it('should show alert on validation error', async () => {
      mockHandleLeagueCreation.mockResolvedValue({
        success: false,
        error: 'League name must be at most 50 characters',
      });

      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');
      const submitButton = screen.getByRole('button', { name: 'Create League' });

      fireEvent.change(input, { target: { value: 'A'.repeat(51) } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('League name must be at most 50 characters');
      });
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('should show alert when league already exists', async () => {
      mockHandleLeagueCreation.mockResolvedValue({
        success: false,
        error: 'A league with this name already exists. Please choose a different name.',
      });

      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');
      const submitButton = screen.getByRole('button', { name: 'Create League' });

      fireEvent.change(input, { target: { value: 'Good Vibes' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'A league with this name already exists. Please choose a different name.'
        );
      });
      expect(window.location.reload).not.toHaveBeenCalled();
    });

    it('should re-enable submit button after error', async () => {
      mockHandleLeagueCreation.mockResolvedValue({
        success: false,
        error: 'League name is too long',
      });

      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');
      const submitButton = screen.getByRole('button', { name: 'Create League' });

      fireEvent.change(input, { target: { value: 'Invalid Name' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalled();
      });

      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent('Create League');
    });

    it('should handle exception during creation', async () => {
      mockHandleLeagueCreation.mockRejectedValue(new Error('Network error'));

      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');
      const submitButton = screen.getByRole('button', { name: 'Create League' });

      fireEvent.change(input, { target: { value: 'Good Vibes' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('An error occurred while creating the league');
      });
      expect(window.location.reload).not.toHaveBeenCalled();
    });
  });

  describe('race condition fix - wait for league before reload', () => {
    it('should wait for league to be available before reloading', async () => {
      // Now the component waits for the league to appear in the subscription
      // before navigating, which prevents the "league not found" error
      mockHandleLeagueCreation.mockResolvedValue({
        success: true,
        slug: 'good-vibes',
      });

      // Mock useQuery to return the league once it's created
      mockUseQuery.mockReturnValue({
        data: {
          games: [
            {
              gameId: 'lx',
              leagues: [{ slug: 'good-vibes' }],
            },
          ],
        },
        isLoading: false,
        error: null,
      });

      render(<LeagueCreation gameId="lx" />);

      const input = screen.getByLabelText('League Name');
      const submitButton = screen.getByRole('button', { name: 'Create League' });

      fireEvent.change(input, { target: { value: 'Good Vibes' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.history.pushState).toHaveBeenCalled();
      });

      // FIXED: Now waits for league to be available in subscription
      expect(window.location.reload).toHaveBeenCalled();
    });
  });
});
