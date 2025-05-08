import {
  useMetricsStore
} from "./chunk-RTAHOVXP.mjs";

// src/metrics/startup.ts
if (global.__OPTIC_APP_START_TIME__ === void 0) {
  global.__OPTIC_APP_START_TIME__ = Date.now();
}
function trackStartupTime() {
  setTimeout(() => {
    const start = global.__OPTIC_APP_START_TIME__ || Date.now();
    const duration = Date.now() - start;
    useMetricsStore.getState().setStartupTime(duration);
    console.log(`[useoptic] Startup time: ${duration}ms`);
  }, 0);
}
export {
  trackStartupTime
};
//# sourceMappingURL=startup-34QXCTCJ.mjs.map