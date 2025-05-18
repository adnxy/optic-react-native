export {};

import { useMetricsStore } from '../store/metricsStore';

// Global app start time (should be set as early as possible in the app entrypoint)
declare global {
  var __OPTIC_APP_START_TIME__: number | undefined;
  var __OPTIC_STARTUP_CAPTURED__: boolean;
}

if (global.__OPTIC_APP_START_TIME__ === undefined) {
  global.__OPTIC_APP_START_TIME__ = Date.now();
}

if (global.__OPTIC_STARTUP_CAPTURED__ === undefined) {
  global.__OPTIC_STARTUP_CAPTURED__ = false;
}

/**
 * Measures time since global app start and logs it to the console.
 * Only measures once and stores the result.
 */
export function trackStartupTime() {
  // Only measure startup time once
  if (global.__OPTIC_STARTUP_CAPTURED__) {
    return;
  }

  const start = global.__OPTIC_APP_START_TIME__ || Date.now();
  
  // Use requestAnimationFrame to ensure we measure after initial render
  requestAnimationFrame(() => {
    if (!global.__OPTIC_STARTUP_CAPTURED__) {
      const duration = Date.now() - start;
      
      // Mark as captured before setting the time to prevent race conditions
      global.__OPTIC_STARTUP_CAPTURED__ = true;
      
      useMetricsStore.getState().setStartupTime(duration);
    }
  });
}
