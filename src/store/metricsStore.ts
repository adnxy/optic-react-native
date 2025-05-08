import { create } from 'zustand';

interface MetricsState {
  tti: number | null;
  startupTime: number | null;
  reRenderCounts: Record<string, number>;
  setTTI: (tti: number) => void;
  setStartupTime: (startupTime: number) => void;
  incrementReRender: (componentName: string) => void;
}

export const useMetricsStore = create<MetricsState>((set) => ({
  tti: null,
  startupTime: null,
  reRenderCounts: {},
  setTTI: (tti) => set({ tti }),
  setStartupTime: (startupTime) => set({ startupTime }),
  incrementReRender: (componentName) =>
    set((state) => ({
      reRenderCounts: {
        ...state.reRenderCounts,
        [componentName]: (state.reRenderCounts[componentName] || 0) + 1,
      },
    })),
}));