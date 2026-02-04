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

      const toast = document.querySelector('.toast-notification');
      expect(toast).toBeDefined();
      expect(toast?.classList.contains('show')).toBe(true);

      // Fast-forward past duration
      vi.advanceTimersByTime(3000);

      // Toast element stays in DOM but 'show' class is removed
      expect(toast?.classList.contains('show')).toBe(false);
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

      const toast = document.querySelector('.toast-notification');
      expect(toast).toBeDefined();

      // Should still have 'show' class at 4 seconds
      vi.advanceTimersByTime(4000);
      expect(toast?.classList.contains('show')).toBe(true);

      // Should have removed 'show' class at 5+ seconds
      vi.advanceTimersByTime(1000);
      expect(toast?.classList.contains('show')).toBe(false);
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

    it('should apply show class when displayed', () => {
      showToast('Success message', 'success');

      const toast = document.querySelector('.toast-notification');
      expect(toast?.classList.contains('toast-notification')).toBe(true);
      expect(toast?.classList.contains('show')).toBe(true);
    });

    it('should show icon based on type', () => {
      showToast('Error message', 'error');

      const toast = document.querySelector('.toast-notification');
      expect(toast?.textContent).toContain('✗');
    });

    it('should default to info type', () => {
      showToast('Default message');

      const toast = document.querySelector('.toast-notification');
      expect(toast?.classList.contains('show')).toBe(true);
      expect(toast?.textContent).toContain('ℹ');
    });
  });
});
