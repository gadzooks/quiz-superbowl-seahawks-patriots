/**
 * Show a toast notification.
 */
export function showToast(
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  duration = 3000
): void {
  // Use the existing toast element from HTML or create one
  let toast = document.getElementById('toastNotification');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  // Add icon based on type
  const icons: Record<string, string> = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  };

  // Set content
  toast.innerHTML = `
    <span style="font-size: 1.2em; margin-right: 8px;">${icons[type]}</span>
    <span>${message}</span>
  `;

  // Show toast with CSS animation
  toast.classList.add('show');

  // Auto-hide after duration
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// Toast styles are in src/styles/features/toast.css
