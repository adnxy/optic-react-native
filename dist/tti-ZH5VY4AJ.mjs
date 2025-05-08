import {
  useMetricsStore
} from "./chunk-RTAHOVXP.mjs";

// src/metrics/tti.ts
function trackTTI() {
  if (global.__OPTIC_TTI_CAPTURED__) return;
  const start = Date.now();
  requestAnimationFrame(() => {
    const tti = Date.now() - start;
    global.__OPTIC_TTI_CAPTURED__ = true;
    useMetricsStore.getState().setTTI(tti);
    console.log(`[useoptic] TTI measured: ${tti}ms`);
  });
}
export {
  trackTTI
};
//# sourceMappingURL=tti-ZH5VY4AJ.mjs.map