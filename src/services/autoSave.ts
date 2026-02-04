/**
 * Service for managing debounced auto-save operations
 * Prevents duplicate saves and allows immediate flushing
 */
export class AutoSaveService {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Schedule a debounced save operation
   * Cancels any pending save for the same key
   */
  scheduleDebounced(key: string, saveFn: () => Promise<void>, delay: number): void {
    this.cancel(key);
    const timer = setTimeout(() => {
      this.timers.delete(key);
      void saveFn();
    }, delay);
    this.timers.set(key, timer);
  }

  /**
   * Cancel a pending save operation
   */
  cancel(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  /**
   * Immediately execute save, canceling any pending timer
   */
  async flush(key: string, saveFn: () => Promise<void>): Promise<void> {
    this.cancel(key);
    await saveFn();
  }

  /**
   * Cancel all pending saves
   */
  cancelAll(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }
}
