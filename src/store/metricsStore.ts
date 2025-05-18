import { create } from 'zustand';
import { InitOpticOptions } from '../core/initOptic';

export interface NetworkRequest {
  url: string;
  method: string;
  duration: number;
  status: number;
  [key: string]: any; // for any extra fields
}

export interface ScreenMetrics {
  tti: number | null;
  reRenderCounts: Record<string, number>;
}

export interface MetricsState {
  currentScreen: string | null;
  screens: Record<string, {
    tti: number | null;
    reRenderCounts: Record<string, number>;
  }>;
  startupTime: number | null;
  fps: number | null;
  networkRequests: Array<{
    url: string;
    method: string;
    duration: number;
    status: number;
  }>;
  setCurrentScreen: (screenName: string | null) => void;
  setTTI: (screenName: string, tti: number | null) => void;
  incrementReRender: (componentName: string) => void;
  setStartupTime: (time: number) => void;
  setFPS: (fps: number) => void;
  addNetworkRequest: (request: {
    url: string;
    method: string;
    duration: number;
    status: number;
  }) => void;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  currentScreen: null,
  screens: {},
  startupTime: null,
  fps: null,
  networkRequests: [],

  setCurrentScreen: (screenName) => {
    set((state) => {
      // Initialize screen metrics if they don't exist
      if (screenName && !state.screens[screenName]) {
        return {
          currentScreen: screenName,
          screens: {
            ...state.screens,
            [screenName]: {
              tti: null,
              reRenderCounts: {},
            },
          },
        };
      }
      return { currentScreen: screenName };
    });
  },

  setTTI: (screenName, tti) => {
    set((state) => ({
      screens: {
        ...state.screens,
        [screenName]: {
          ...state.screens[screenName],
          tti,
        },
      },
    }));
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

  setStartupTime: (time) => {
    set({ startupTime: time });
  },

  setFPS: (fps) => {
    set({ fps });
  },

  addNetworkRequest: (request) => {
    set((state) => ({
      networkRequests: [...state.networkRequests, request].slice(-50), // Keep last 50 requests
    }));
  },
}));

export let opticEnabled = true;

export function setOpticEnabled(value: boolean) {
  opticEnabled = value;
}

export function initOptic(options: InitOpticOptions = {}) {
  const { enabled = true, onMetricsLogged } = options;
  opticEnabled = enabled;
  if (!enabled) {
    return;
  }
  // ...rest of your logic...
}