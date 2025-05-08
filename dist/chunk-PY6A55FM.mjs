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
var createScreenMetrics = () => ({
  tti: null,
  reRenderCounts: {}
});
var useMetricsStore = create((set, get) => ({
  currentScreen: null,
  screens: {},
  startupTime: null,
  setCurrentScreen: (screenName) => {
    const state = get();
    if (state.currentScreen !== screenName) {
      console.log(`[useoptic] Setting current screen to: ${screenName}`);
      set((state2) => {
        if (!state2.screens[screenName]) {
          return {
            currentScreen: screenName,
            screens: __spreadProps(__spreadValues({}, state2.screens), {
              [screenName]: createScreenMetrics()
            })
          };
        }
        return { currentScreen: screenName };
      });
    }
  },
  setTTI: (tti) => {
    var _a;
    const state = get();
    if (!state.currentScreen) {
      console.log("[useoptic] Cannot set TTI: no current screen");
      return;
    }
    const currentTTI = (_a = state.screens[state.currentScreen]) == null ? void 0 : _a.tti;
    if (currentTTI !== tti) {
      console.log(`[useoptic] Setting TTI for ${state.currentScreen}: ${tti}ms`);
      set((state2) => ({
        screens: __spreadProps(__spreadValues({}, state2.screens), {
          [state2.currentScreen]: __spreadProps(__spreadValues({}, state2.screens[state2.currentScreen]), {
            tti
          })
        })
      }));
    }
  },
  setStartupTime: (startupTime) => {
    const state = get();
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
    set((state2) => ({
      screens: __spreadProps(__spreadValues({}, state2.screens), {
        [state2.currentScreen]: __spreadProps(__spreadValues({}, currentScreen), {
          reRenderCounts: __spreadProps(__spreadValues({}, currentScreen.reRenderCounts), {
            [componentName]: currentCount + 1
          })
        })
      })
    }));
  }
}));

export {
  __spreadValues,
  useMetricsStore
};
//# sourceMappingURL=chunk-PY6A55FM.mjs.map