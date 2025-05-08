import {
  __spreadProps,
  __spreadValues
} from "./chunk-FJBZBVPE.mjs";

// src/store/metricsStore.ts
import { create } from "zustand";
var useMetricsStore = create((set) => ({
  tti: null,
  startupTime: null,
  reRenderCounts: {},
  setTTI: (tti) => set({ tti }),
  setStartupTime: (startupTime) => set({ startupTime }),
  incrementReRender: (componentName) => set((state) => ({
    reRenderCounts: __spreadProps(__spreadValues({}, state.reRenderCounts), {
      [componentName]: (state.reRenderCounts[componentName] || 0) + 1
    })
  }))
}));

export {
  useMetricsStore
};
//# sourceMappingURL=chunk-LNPKIR6M.mjs.map