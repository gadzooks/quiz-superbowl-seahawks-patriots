import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '../context/ToastContext';

interface CountdownBubbleProps {
  deadline: Date;
}

/** Format remaining ms into compact display (e.g., "2:16" for 2h16m, "18" for 18m) */
function formatCompact(ms: number): string {
  if (ms <= 0) return '0';

  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}`;
  return String(minutes);
}

/** Format remaining ms into a human-readable string for the toast */
function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '0s';

  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}hr ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

const URGENT_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function CountdownBubble({ deadline }: CountdownBubbleProps) {
  const { showToast } = useToast();
  const [remaining, setRemaining] = useState(() => deadline.getTime() - Date.now());
  const [dismissed, setDismissed] = useState(false);
  const bubbleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tick = () => setRemaining(deadline.getTime() - Date.now());

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  // Dismiss when clicking outside the bubble
  useEffect(() => {
    if (dismissed) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (bubbleRef.current && e.target instanceof Node && !bubbleRef.current.contains(e.target)) {
        setDismissed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dismissed]);

  const handleTap = useCallback(() => {
    const ms = deadline.getTime() - Date.now();
    if (ms <= 0) return;

    const timeStr = formatTimeRemaining(ms);
    const isUrgent = ms < URGENT_THRESHOLD_MS;
    const message = isUrgent
      ? `${timeStr} — answers lock soon!`
      : `${timeStr} before answers are locked`;
    showToast(message, isUrgent ? 'warning' : 'success', 4000);
  }, [deadline, showToast]);

  // Don't render if deadline has passed or user dismissed
  if (remaining <= 0 || dismissed) return null;

  const isUrgent = remaining < URGENT_THRESHOLD_MS;

  return (
    <button
      ref={bubbleRef}
      className={`countdown-bubble-float ${isUrgent ? 'countdown-bubble-urgent' : ''}`}
      onClick={handleTap}
      aria-label={`${formatTimeRemaining(remaining)} until submissions close`}
    >
      <span className="countdown-bubble-time">{formatCompact(remaining)}</span>
    </button>
  );
}
