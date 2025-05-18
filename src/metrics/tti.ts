import { useMetricsStore } from '../store/metricsStore';
import { InteractionManager } from 'react-native';

let startTimes: Record<string, number> = {};

//TODO add realistic thresholds
const TTI_THRESHOLDS = {
  good: 250,
  warning: 300,
};

export function startTTITracking() {
  const currentScreen = useMetricsStore.getState().currentScreen;
  if (!currentScreen) return;

  // Start timing when screen navigation begins
  startTimes[currentScreen] = Date.now();
  console.log(`[useoptic] Starting TTI measurement for ${currentScreen}`);

  // Use InteractionManager to wait for all interactions/animations to complete
  InteractionManager.runAfterInteractions(() => {
    // Add a small delay to ensure the screen is truly interactive
    setTimeout(() => {
      const tti = Date.now() - startTimes[currentScreen];
      useMetricsStore.getState().setTTI(tti, currentScreen);
      console.log(`[useoptic] Captured TTI for ${currentScreen}: ${tti}ms`);
    }, 100); // Small delay to ensure all animations and interactions are complete
  });
}

export function stopTTITracking() {
  // No need to stop anything as we only measure once per screen
}

export function resetTTIForCurrentScreen() {
  const currentScreen = useMetricsStore.getState().currentScreen;
  if (!currentScreen) return;
  
  // Start a new TTI measurement for the current screen
  startTTITracking();
}

export function getTTIColor(tti: number | null | undefined): string {
  if (tti === null || tti === undefined) return '#fff';
  if (tti <= TTI_THRESHOLDS.good) return '#4CAF50'; // Green
  if (tti <= TTI_THRESHOLDS.warning) return '#FFC107'; // Yellow
  return '#F44336'; // Red
}