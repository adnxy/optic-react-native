var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

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
  __spreadValues,
  useMetricsStore
};
//# sourceMappingURL=chunk-RTAHOVXP.mjs.map