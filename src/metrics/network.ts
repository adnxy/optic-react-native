import { useMetricsStore } from '../store/metricsStore';

// Network performance thresholds (in milliseconds)
const NETWORK_THRESHOLDS = {
  GOOD: 200,
  WARNING: 500,
  CRITICAL: 1000,
};

let originalFetch: typeof fetch | null = null;

export const initNetworkTracking = () => {
  if (originalFetch !== null) return; // Already initialized

  originalFetch = global.fetch;
  global.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const startTime = performance.now();
    const url = input instanceof Request ? input.url : input.toString();
    const method = input instanceof Request ? input.method : (init?.method || 'GET');

    console.log(`[useoptic] Network request started: ${method} ${url}`);

    try {
      const response = await originalFetch!(input, init);
      const endTime = performance.now();
      const duration = endTime - startTime;

      const request = {
        url,
        method,
        duration,
        status: response.status,
      };

      console.log(`[useoptic] Network request completed: ${method} ${url} - ${Math.round(duration)}ms (${response.status})`);
      useMetricsStore.getState().addNetworkRequest(request);

      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      const request = {
        url,
        method,
        duration,
        status: 0, // Error status
      };

      console.log(`[useoptic] Network request failed: ${method} ${url} - ${Math.round(duration)}ms`);
      useMetricsStore.getState().addNetworkRequest(request);

      throw error;
    }
  };
  console.log('[useoptic] Network tracking started');
};

export const stopNetworkTracking = () => {
  if (originalFetch === null) return;

  global.fetch = originalFetch;
  originalFetch = null;
  console.log('[useoptic] Network tracking stopped');
};

export const getNetworkColor = (duration: number | null | undefined): string => {
  if (duration === null || duration === undefined) return '#666666';
  if (duration <= NETWORK_THRESHOLDS.GOOD) return '#4CAF50';
  if (duration <= NETWORK_THRESHOLDS.WARNING) return '#FFC107';
  return '#F44336';
}; 