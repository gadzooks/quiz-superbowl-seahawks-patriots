import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { showToast } from './toast';

describe('ui/toast', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('showToast', () => {
    it('should create toast element', () => {
      showToast('Test message');

      const toast = document.querySelector('.toast-notification');
      expect(toast).toBeDefined();
      expect(toast?.textContent).toContain('Test message');
    });

    it('should add toast to body', () => {
      showToast('Test message');

      const toasts = document.querySelectorAll('.toast-notification');
      expect(toasts.length).toBe(1);
    });

    it('should remove toast after duration', () => {
      showToast('Test message', 'info', 3000);

      const toastBefore = document.querySelector('.toast-notification');
      expect(toastBefore).toBeDefined();

      // Fast-forward past duration + animation
      vi.advanceTimersByTime(3500);

      const toastAfter = document.querySelector('.toast-notification');
      expect(toastAfter).toBeNull();
    });

    it('should replace existing toast', () => {
      showToast('Message 1');
      showToast('Message 2');

      const toasts = document.querySelectorAll('.toast-notification');
      expect(toasts.length).toBe(1);
      expect(toasts[0].textContent).toContain('Message 2');
    });

    it('should use custom duration', () => {
      showToast('Test message', 'info', 5000);

      // Should still be visible at 4 seconds
      vi.advanceTimersByTime(4000);
      expect(document.querySelector('.toast-notification')).toBeDefined();

      // Should be gone at 6 seconds
      vi.advanceTimersByTime(2500);
      expect(document.querySelector('.toast-notification')).toBeNull();
    });

    it('should handle empty message', () => {
      showToast('');

      const toast = document.querySelector('.toast-notification');
      expect(toast).toBeDefined();
    });

    it('should handle special characters in message', () => {
      const message = 'Test <strong>HTML</strong> & "quotes"';
      showToast(message);

      const toast = document.querySelector('.toast-notification');
      expect(toast?.textContent).toContain('Test');
    });

    it('should apply correct type class', () => {
      showToast('Success message', 'success');

      const toast = document.querySelector('.toast-notification');
      expect(toast?.className).toContain('alert-success');
    });

    it('should show icon based on type', () => {
      showToast('Error message', 'error');

      const toast = document.querySelector('.toast-notification');
      expect(toast?.textContent).toContain('✗');
    });

    it('should default to info type', () => {
      showToast('Default message');

      const toast = document.querySelector('.toast-notification');
      expect(toast?.className).toContain('alert-info');
      expect(toast?.textContent).toContain('ℹ');
    });
  });
});
