import { create } from 'zustand';

interface ScreenMetrics {
  tti: number | null;
  reRenderCounts: Record<string, number>;
}

interface MetricsState {
  currentScreen: string | null;
  screens: Record<string, ScreenMetrics>;
  startupTime: number | null;
  setCurrentScreen: (screenName: string) => void;
  setTTI: (tti: number | null) => void;
  setStartupTime: (startupTime: number) => void;
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
  setCurrentScreen: (screenName) => {
    const state = get();
    // Only update if the screen actually changed
    if (state.currentScreen !== screenName) {
      console.log(`[useoptic] Setting current screen to: ${screenName}`);
      set((state) => {
        // Initialize metrics for new screen if it doesn't exist
        if (!state.screens[screenName]) {
          return {
            currentScreen: screenName,
            screens: {
              ...state.screens,
              [screenName]: createScreenMetrics(),
            },
          };
        }
        return { currentScreen: screenName };
      });
    }
  },
  setTTI: (tti) => {
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
          [state.currentScreen!]: {
            ...state.screens[state.currentScreen!],
            tti,
          },
        },
      }));
    }
  },
  setStartupTime: (startupTime) => {
    const state = get();
    // Only update if startup time actually changed
    if (state.startupTime !== startupTime) {
      console.log(`[useoptic] Setting startup time: ${startupTime}ms`);
      set({ startupTime });
    }
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