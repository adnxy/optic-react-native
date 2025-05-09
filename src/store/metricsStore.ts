import { create } from 'zustand';

interface NetworkRequest {
  url: string;
  method: string;
  duration: number;
  status: number;
}

interface ScreenMetrics {
  tti: number | null;
  reRenderCounts: Record<string, number>;
}

interface MetricsState {
  currentScreen: string | null;
  screens: Record<string, ScreenMetrics>;
  startupTime: number | null;
  fps: number | null;
  networkRequests: NetworkRequest[];
  setCurrentScreen: (screen: string) => void;
  setTTI: (screen: string, tti: number | null) => void;
  setStartupTime: (time: number) => void;
  setFPS: (fps: number) => void;
  addNetworkRequest: (request: NetworkRequest) => void;
  incrementReRender: (componentName: string) => void;
}

const createScreenMetrics = (): ScreenMetrics => ({
  tti: null,
  reRenderCounts: {},
});

export const useMetricsStore = create<MetricsState>((set, get) => ({
  currentScreen: null,
  screens: {},
  startupTime: null,
  fps: null,
  networkRequests: [],
  setCurrentScreen: (screen) => {
    const state = get();
    // Only update if the screen actually changed
    if (state.currentScreen !== screen) {
      console.log(`[useoptic] Setting current screen to: ${screen}`);
      set((state) => {
        // Initialize metrics for new screen if it doesn't exist
        if (!state.screens[screen]) {
          return {
            currentScreen: screen,
            screens: {
              ...state.screens,
              [screen]: createScreenMetrics(),
            },
          };
        }
        return { currentScreen: screen };
      });
    }
  },
  setTTI: (screen, tti) => {
    const state = get();
    if (!state.currentScreen) {
      console.log('[useoptic] Cannot set TTI: no current screen');
      return;
    }
    
    // Only update if TTI actually changed
    const currentTTI = state.screens[state.currentScreen]?.tti;
    if (currentTTI !== tti) {
      console.log(`[useoptic] Setting TTI for ${state.currentScreen}: ${tti}ms`);
      set((state) => ({
        screens: {
          ...state.screens,
          [screen]: {
            ...state.screens[screen],
            tti,
          },
        },
      }));
    }
  },
  setStartupTime: (time) => {
    const state = get();
    // Only update if startup time actually changed
    if (state.startupTime !== time) {
      console.log(`[useoptic] Setting startup time: ${time}ms`);
      set({ startupTime: time });
    }
  },
  setFPS: (fps) => {
    const state = get();
    // Only update if fps actually changed
    if (state.fps !== fps) {
      console.log(`[useoptic] Setting fps: ${fps}`);
      set({ fps });
    }
  },
  addNetworkRequest: (request) => {
    console.log('[useoptic] Adding network request:', {
      url: request.url,
      method: request.method,
      duration: Math.round(request.duration),
      status: request.status
    });
    set((state) => {
      const newRequests = [...state.networkRequests, request].slice(-50); // Keep last 50 requests
      console.log('[useoptic] Current network requests:', newRequests.length);
      return {
        networkRequests: newRequests
      };
    });
  },
  incrementReRender: (componentName) => {
    const state = get();
    if (!state.currentScreen) return;
    
    const currentScreen = state.screens[state.currentScreen];
    const currentCount = currentScreen.reRenderCounts[componentName] || 0;
    
    set((state) => ({
      screens: {
        ...state.screens,
        [state.currentScreen!]: {
          ...currentScreen,
          reRenderCounts: {
            ...currentScreen.reRenderCounts,
            [componentName]: currentCount + 1,
          },
        },
      },
    }));
  },
}));