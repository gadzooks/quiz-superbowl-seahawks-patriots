/**
 * Show a toast notification.
 */
export function showToast(
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  duration = 3000
): void {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast-notification alert alert-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    min-width: 280px;
    max-width: 90%;
    animation: slideDown 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;

  // Add icon based on type
  const icons: Record<string, string> = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  };

  toast.innerHTML = `
    <span style="font-size: 1.2em; margin-right: 8px;">${icons[type]}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Inject toast animation styles if not present
if (typeof document !== 'undefined' && !document.getElementById('toast-styles')) {
  const style = document.createElement('style');
  style.id = 'toast-styles';
  style.textContent = `
    @keyframes slideDown {
      from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 1; transform: translateX(-50%) translateY(0); }
      to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
  `;
  document.head.appendChild(style);
}
