import { expect, afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  document.body.innerHTML = '';
});

// Mock window.crypto.randomUUID
if (!global.crypto) {
  global.crypto = {} as Crypto;
}
(global.crypto as any).randomUUID = vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7));

// Extend expect with custom matchers if needed
expect.extend({
  // Add custom matchers here
});
