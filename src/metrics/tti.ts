import { useMetricsStore } from '../store/metricsStore';

export function trackTTI() {
  if ((global as any).__OPTIC_TTI_CAPTURED__) return;
  const start = Date.now();
  requestAnimationFrame(() => {
    const tti = Date.now() - start;
    (global as any).__OPTIC_TTI_CAPTURED__ = true;
    useMetricsStore.getState().setTTI(tti);
    console.log(`[useoptic] TTI measured: ${tti}ms`);
  });
}
