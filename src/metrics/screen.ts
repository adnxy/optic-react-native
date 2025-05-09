import { useEffect, useRef, useCallback } from 'react';
import { useMetricsStore } from '../store/metricsStore';

declare global {
  var __OPTIC_SCREEN_TTI_CAPTURED__: Record<string, boolean>;
  var __OPTIC_SCREEN_TTI_START__: Record<string, number>;
}

if (!global.__OPTIC_SCREEN_TTI_CAPTURED__) {
  global.__OPTIC_SCREEN_TTI_CAPTURED__ = {};
}

if (!global.__OPTIC_SCREEN_TTI_START__) {
  global.__OPTIC_SCREEN_TTI_START__ = {};
}

/**
 * Hook to track screen performance metrics.
 * @param screenName Name of the current screen
 */
export function useScreenMetrics(screenName: string) {
  console.log(`[useoptic] useScreenMetrics called for "${screenName}"`);
  
  const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);
  const setTTI = useMetricsStore((state) => state.setTTI);
  const screens = useMetricsStore((state) => state.screens);
  const prevScreenRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Memoize the screen change handler
  const handleScreenChange = useCallback(() => {
    console.log(`[useoptic] handleScreenChange called for "${screenName}"`);
    const isNewScreen = prevScreenRef.current !== screenName;
    if (isNewScreen) {
      console.log(`[useoptic] New screen detected: "${screenName}"`);
      prevScreenRef.current = screenName;
      // Reset TTI capture flag for the new screen
      global.__OPTIC_SCREEN_TTI_CAPTURED__[screenName] = false;
      setCurrentScreen(screenName);
      console.log(`[useoptic] Starting TTI measurement for "${screenName}"`);
    }
  }, [screenName, setCurrentScreen]);

  // Handle screen changes
  useEffect(() => {
    console.log(`[useoptic] Screen change effect triggered for "${screenName}"`);
    handleScreenChange();
  }, [handleScreenChange]);

  // Handle TTI measurement
  useEffect(() => {
    console.log(`[useoptic] TTI measurement effect triggered for "${screenName}"`);
    mountedRef.current = true;

    if (!global.__OPTIC_SCREEN_TTI_CAPTURED__[screenName]) {
      console.log(`[useoptic] Measuring TTI for "${screenName}"`);
      global.__OPTIC_SCREEN_TTI_CAPTURED__[screenName] = true;
      global.__OPTIC_SCREEN_TTI_START__[screenName] = Date.now();
      setTTI(screenName, null);

      // Use requestAnimationFrame to ensure we measure after the screen is rendered
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          const start = global.__OPTIC_SCREEN_TTI_START__[screenName];
          const tti = Date.now() - start;
          console.log(`[useoptic] Setting TTI for "${screenName}": ${tti}ms`);
          setTTI(screenName, tti);
        }
      });
    } else {
      console.log(`[useoptic] TTI already captured for "${screenName}"`);
    }

    return () => {
      console.log(`[useoptic] Cleaning up TTI measurement for "${screenName}"`);
      mountedRef.current = false;
      
      // Only reset TTI if we're actually unmounting the screen
      if (prevScreenRef.current !== screenName) {
        if (screens[screenName]) {
          setTTI(screenName, null);
        }
      }
    };
  }, [screenName, setTTI, screens]);
} 