/**
 * ReadOnlyBanner component.
 * Displays a banner indicating read-only mode for completed games.
 */

interface ReadOnlyBannerProps {
  message: string;
  variant?: 'info' | 'warning';
}

export function ReadOnlyBanner({ message, variant = 'info' }: ReadOnlyBannerProps) {
  return (
    <div className={`read-only-banner read-only-banner--${variant}`}>
      <div className="read-only-banner__icon">{variant === 'info' ? '👁️' : '⚠️'}</div>
      <div className="read-only-banner__text">{message}</div>
    </div>
  );
}
