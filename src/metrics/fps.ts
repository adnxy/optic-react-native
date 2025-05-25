import { useMetricsStore } from '../store/metricsStore';

export interface FPSMetrics {
  fps: number;
  timestamp: number;
}

export class FPSManager {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private readonly updateInterval: number = 1000; // Update FPS every second

  constructor() {
    this.lastTime = performance.now();
  }

  private updateFPS = () => {
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    if (elapsed >= this.updateInterval) {
      const fps = Math.round((this.frameCount * 1000) / elapsed);
      const metricsStore = useMetricsStore.getState();
      const currentScreen = metricsStore.currentScreen;

      if (currentScreen) {
        metricsStore.setFPS(fps, currentScreen);
      }

      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.frameCount++;
    this.animationFrameId = requestAnimationFrame(this.updateFPS);
  };

  public startTracking = () => {
    if (!this.animationFrameId) {
      this.lastTime = performance.now();
      this.frameCount = 0;
      this.animationFrameId = requestAnimationFrame(this.updateFPS);
    }
  };

  public stopTracking = () => {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  };
}

export const getFPSColor = (fps: number): string => {
  if (fps >= 55) return '#4CAF50'; // Good (green)
  if (fps >= 30) return '#FFC107'; // Warning (yellow)
  return '#F44336'; // Poor (red)
}; 