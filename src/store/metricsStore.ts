import { create } from 'zustand';
import { InitOpticOptions } from '../core/initOptic';

export interface NetworkRequest {
  url: string;
  method: string;
  duration: number;
  status: number;
  [key: string]: any; // for any extra fields
}

export interface Trace {
  interactionName: string;
  componentName: string;
  duration: number;
  timestamp: number;
}

export interface MetricsState {
  currentScreen: string | null;
  screens: Record<string, { 
    reRenderCounts: Record<string, number>;
    fps: number | null;
  }>;
  networkRequests: NetworkRequest[];
  traces: Trace[];
  startupTime: number | null;
  setCurrentScreen: (screenName: string | null) => void;
  incrementReRender: (componentName: string) => void;
  setStartupTime: (time: number) => void;
  setFPS: (fps: number, screenName: string) => void;
  addNetworkRequest: (request: NetworkRequest) => void;
  setTrace: (trace: Trace) => void;
}

export const useMetricsStore = create<MetricsState>((set, get) => ({
  currentScreen: null,
  screens: {},
  networkRequests: [],
  traces: [],
  startupTime: null,

  setCurrentScreen: (screenName) => {
    set((state) => {
      // Initialize screen metrics if they don't exist
      if (screenName && !state.screens[screenName]) {
        return {
          currentScreen: screenName,
          screens: {
            ...state.screens,
            [screenName]: {
              reRenderCounts: {},
              fps: null,
            },
          },
        };
      }
      return { currentScreen: screenName };
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

  setStartupTime: (time) => {
    set({ startupTime: time });
  },

  setFPS: (fps, screenName) => {
    set((state) => ({
      screens: {
        ...state.screens,
        [screenName]: {
          ...state.screens[screenName],
          fps,
        },
      },
    }));
  },

  addNetworkRequest: (request) => {
    set((state) => ({
      networkRequests: [...state.networkRequests, request].slice(-50), // Keep last 50 requests
    }));
  },

  setTrace: (trace) => {
    set((state) => ({
      traces: [...state.traces, trace].slice(-10), // Keep last 10 traces
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