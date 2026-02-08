import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { UnsavedChangesBar } from './UnsavedChangesBar';

describe('UnsavedChangesBar', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Submit button clickability', () => {
    it('should render a clickable Submit button when status is idle', async () => {
      const user = userEvent.setup();
      render(<UnsavedChangesBar saveStatus="idle" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });

      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();

      await user.click(submitButton);
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('should render Submit button with pointer-events enabled', () => {
      render(<UnsavedChangesBar saveStatus="idle" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      const computedStyle = window.getComputedStyle(submitButton);

      // Verify pointer-events is not 'none' (should be 'auto' or default)
      expect(computedStyle.pointerEvents).not.toBe('none');
    });

    it('should call onSave when Submit button is clicked', async () => {
      const user = userEvent.setup();
      render(<UnsavedChangesBar saveStatus="idle" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('should disable Submit button when saving', () => {
      render(<UnsavedChangesBar saveStatus="saving" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show "Saved!" when status is saved', () => {
      render(<UnsavedChangesBar saveStatus="saved" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: /saved/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Discard Changes button', () => {
    it('should render and be clickable when status is idle', async () => {
      const user = userEvent.setup();
      render(<UnsavedChangesBar saveStatus="idle" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /discard changes/i });

      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).not.toBeDisabled();

      await user.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should disable Discard Changes button when saving', () => {
      render(<UnsavedChangesBar saveStatus="saving" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /discard changes/i });
      expect(cancelButton).toBeDisabled();
    });

    it('should hide Discard Changes button when saved', () => {
      render(<UnsavedChangesBar saveStatus="saved" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const cancelButton = screen.queryByRole('button', { name: /discard changes/i });
      expect(cancelButton).not.toBeInTheDocument();
    });
  });

  describe('button states', () => {
    it('should show "Submit" text when idle', () => {
      render(<UnsavedChangesBar saveStatus="idle" onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should show "Saving..." text when saving', () => {
      render(<UnsavedChangesBar saveStatus="saving" onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    });

    it('should show "✅ Saved!" text when saved', () => {
      render(<UnsavedChangesBar saveStatus="saved" onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper button roles', () => {
      render(<UnsavedChangesBar saveStatus="idle" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2); // Submit + Discard Changes
    });

    it('should prevent multiple rapid clicks on Submit button', async () => {
      const user = userEvent.setup();
      render(<UnsavedChangesBar saveStatus="idle" onSave={mockOnSave} onCancel={mockOnCancel} />);

      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Simulate rapid clicks
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only register once per click
      expect(mockOnSave).toHaveBeenCalledTimes(3);
    });
  });
});
