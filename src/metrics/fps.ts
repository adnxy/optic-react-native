import { useMetricsStore } from '../store/metricsStore';

let frameCount = 0;
let lastTime = performance.now();
let animationFrameId: number | null = null;

const FPS_THRESHOLDS = {
  good: 60,
  warning: 55,
};

export function startFPSTracking() {
  if (animationFrameId !== null) {
    return; // Already tracking
  }

  function measureFPS() {
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;
    
    if (elapsed >= 1000) { // Calculate FPS every second
      const fps = Math.round((frameCount * 1000) / elapsed);
      useMetricsStore.getState().setFPS(fps);
      
      // Reset counters
      frameCount = 0;
      lastTime = currentTime;
    }
    
    frameCount++;
    animationFrameId = requestAnimationFrame(measureFPS);
  }

  animationFrameId = requestAnimationFrame(measureFPS);
}

export function stopFPSTracking() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

export function getFPSColor(fps: number | null): string {
  if (fps === null) return '#fff';
  if (fps >= FPS_THRESHOLDS.good) return '#4CAF50'; // Green
  if (fps >= FPS_THRESHOLDS.warning) return '#FFC107'; // Yellow
  return '#F44336'; // Red
} 