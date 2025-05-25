import { useMetricsStore } from '../store/metricsStore';

// Network performance thresholds (in milliseconds)
const NETWORK_THRESHOLDS = {
  GOOD: 200,
  WARNING: 500,
  CRITICAL: 1000,
};

let originalFetch: typeof fetch | null = null;
let pendingRequests = new Map<string, { startTime: number; url: string; method: string }>();

const formatDuration = (duration: number): string => {
  if (duration >= 1000) {
    return `${(duration / 1000).toFixed(1)}s`;
  }
  return `${duration}ms`;
};

export const initNetworkTracking = () => {
  if (originalFetch !== null) return; // Already initialized

  try {
    originalFetch = global.fetch;
    global.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const startTime = Date.now();
      const url = input instanceof Request ? input.url : input.toString();
      const method = input instanceof Request ? input.method : (init?.method || 'GET');

      // Store the request start time
      pendingRequests.set(url, { startTime, url, method });

      try {
        const response = await originalFetch!(input, init);
        const responseTime = Date.now();
        const responseDuration = responseTime - startTime;
        
        // Clone the response to ensure we can read the body
        const clonedResponse = response.clone();
        
        // Create a new response that will track when the body is read
        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });

        // Override the json and text methods to track completion
        const originalJson = newResponse.json;
        const originalText = newResponse.text;

        newResponse.json = async function() {
          try {
            // First try to read the cloned response to ensure it's valid JSON
            await clonedResponse.json();
            
            // If we get here, the JSON is valid, so read the actual response
            const data = await originalJson.call(this);
            const endTime = Date.now();
            const totalDuration = endTime - startTime;

            const metricsStore = useMetricsStore.getState();
            const currentScreen = metricsStore.currentScreen;

            const networkRequest = {
              url,
              method,
              duration: totalDuration,
              responseDuration,
              status: response.status,
              screen: currentScreen,
              timestamp: endTime,
              startTime,
              endTime,
            };

            metricsStore.addNetworkRequest(networkRequest);
            pendingRequests.delete(url);

            return data;
          } catch (error) {
            const endTime = Date.now();
            const totalDuration = endTime - startTime;

            const metricsStore = useMetricsStore.getState();
            const currentScreen = metricsStore.currentScreen;

            const networkRequest = {
              url,
              method,
              duration: totalDuration,
              responseDuration,
              status: response.status,
              screen: currentScreen,
              timestamp: endTime,
              startTime,
              endTime,
              error: error instanceof Error ? error.message : 'Unknown error',
            };

            metricsStore.addNetworkRequest(networkRequest);
            pendingRequests.delete(url);

            throw error;
          }
        };

        newResponse.text = async function() {
          try {
            const data = await originalText.call(this);
            const endTime = Date.now();
            const totalDuration = endTime - startTime;

            const metricsStore = useMetricsStore.getState();
            const currentScreen = metricsStore.currentScreen;

            const networkRequest = {
              url,
              method,
              duration: totalDuration,
              responseDuration,
              status: response.status,
              screen: currentScreen,
              timestamp: endTime,
              startTime,
              endTime,
            };

            metricsStore.addNetworkRequest(networkRequest);
            pendingRequests.delete(url);

            return data;
          } catch (error) {
            const endTime = Date.now();
            const totalDuration = endTime - startTime;

            const metricsStore = useMetricsStore.getState();
            const currentScreen = metricsStore.currentScreen;

            const networkRequest = {
              url,
              method,
              duration: totalDuration,
              responseDuration,
              status: response.status,
              screen: currentScreen,
              timestamp: endTime,
              startTime,
              endTime,
              error: error instanceof Error ? error.message : 'Unknown error',
            };

            metricsStore.addNetworkRequest(networkRequest);
            pendingRequests.delete(url);

            throw error;
          }
        };

        return newResponse;
      } catch (error) {
        const endTime = Date.now();
        const totalDuration = endTime - startTime;

        const metricsStore = useMetricsStore.getState();
        const currentScreen = metricsStore.currentScreen;

        const networkRequest = {
          url,
          method,
          duration: totalDuration,
          status: 0,
          screen: currentScreen,
          timestamp: endTime,
          startTime,
          endTime,
          error: error instanceof Error ? error.message : 'Unknown error',
        };

        metricsStore.addNetworkRequest(networkRequest);
        pendingRequests.delete(url);

        throw error;
      }
    };
  } catch (error) {
    if (originalFetch) {
      global.fetch = originalFetch;
      originalFetch = null;
    }
  }
};

export const stopNetworkTracking = () => {
  if (originalFetch === null) return;

  global.fetch = originalFetch;
  originalFetch = null;
  pendingRequests.clear();
};

export const getNetworkColor = (duration: number | null | undefined): string => {
  if (duration === null || duration === undefined) return '#666666';
  if (duration <= NETWORK_THRESHOLDS.GOOD) return '#4CAF50';
  if (duration <= NETWORK_THRESHOLDS.WARNING) return '#FFC107';
  return '#F44336';
};

export const getLatestNetworkRequest = () => {
  const metricsStore = useMetricsStore.getState();
  const currentScreen = metricsStore.currentScreen;
  const networkRequests = metricsStore.networkRequests;
  const screenNetworkRequests = networkRequests.filter(req => req.screen === currentScreen);
  return screenNetworkRequests[screenNetworkRequests.length - 1];
}; 