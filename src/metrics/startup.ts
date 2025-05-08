export {};

import { useMetricsStore } from '../store/metricsStore';

// Global app start time (should be set as early as possible in the app entrypoint)
declare global {
  var __OPTIC_APP_START_TIME__: number | undefined;
}

if (global.__OPTIC_APP_START_TIME__ === undefined) {
  global.__OPTIC_APP_START_TIME__ = Date.now();
}

/**
 * Measures time since global app start and logs it to the console.
 * Uses setTimeout(0) to simulate async readiness.
 */
export function trackStartupTime() {
  setTimeout(() => {
    const start = global.__OPTIC_APP_START_TIME__ || Date.now();
    const duration = Date.now() - start;
    useMetricsStore.getState().setStartupTime(duration);
    console.log(`[useoptic] Startup time: ${duration}ms`);
  }, 0);
}
