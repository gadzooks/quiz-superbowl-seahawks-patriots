import { useEffect, useRef } from 'react';

import { AutoSaveService } from '../services/autoSave';

interface UseAutoSaveOptions {
  /** Delay in milliseconds before auto-save triggers */
  delay: number;
  /** Save function to execute */
  saveFn: () => Promise<void>;
}

/**
 * Hook for managing debounced auto-save
 * Returns methods to schedule, cancel, and immediately execute saves
 */
export function useAutoSave({ delay, saveFn }: UseAutoSaveOptions) {
  const serviceRef = useRef(new AutoSaveService());
  const saveFnRef = useRef(saveFn);

  // Keep save function ref up to date
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      serviceRef.current.cancelAll();
    };
  }, []);

  return {
    /**
     * Schedule a debounced save
     * Cancels any pending save and starts a new timer
     */
    scheduleSave: () => {
      serviceRef.current.scheduleDebounced('save', saveFnRef.current, delay);
    },

    /**
     * Cancel any pending save
     */
    cancelSave: () => {
      serviceRef.current.cancel('save');
    },

    /**
     * Immediately execute save, bypassing debounce
     */
    saveNow: async () => {
      await serviceRef.current.flush('save', saveFnRef.current);
    },
  };
}
