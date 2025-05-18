import { useEffect, useRef, useCallback } from 'react';
import { useMetricsStore } from '../store/metricsStore';

declare global {
  var __OPTIC_SCREEN_TTI_CAPTURED__: boolean;
  var __OPTIC_SCREEN_TTI_START__: number;
}

if (!global.__OPTIC_SCREEN_TTI_CAPTURED__) {
  global.__OPTIC_SCREEN_TTI_CAPTURED__ = false;
}

if (!global.__OPTIC_SCREEN_TTI_START__) {
  global.__OPTIC_SCREEN_TTI_START__ = 0;
}

/**
 * Hook to track screen performance metrics.
 * @param screenName Name of the current screen
 */
export function useScreenMetrics(screenName: string) {
  const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);
  const setTTI = useMetricsStore((state) => state.setTTI);
  const screens = useMetricsStore((state) => state.screens);
  const prevScreenRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Memoize the screen change handler
  const handleScreenChange = useCallback(() => {
    const isNewScreen = prevScreenRef.current !== screenName;
    if (isNewScreen) {
      prevScreenRef.current = screenName;
      // Reset TTI capture flag for the new screen
      global.__OPTIC_SCREEN_TTI_CAPTURED__ = false;
      setCurrentScreen(screenName);
    }
  }, [screenName, setCurrentScreen]);

  // Handle screen changes
  useEffect(() => {
    handleScreenChange();
  }, [handleScreenChange]);

  // Handle TTI measurement
  useEffect(() => {
    mountedRef.current = true;

    if (!global.__OPTIC_SCREEN_TTI_CAPTURED__) {
      console.log(`[useoptic] Measuring TTI`);
      global.__OPTIC_SCREEN_TTI_CAPTURED__ = true;
      global.__OPTIC_SCREEN_TTI_START__ = Date.now();
      setTTI(null);

      // Use requestAnimationFrame to ensure we measure after the screen is rendered
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          const start = global.__OPTIC_SCREEN_TTI_START__;
          const tti = Date.now() - start;
          setTTI(tti);
        }
      });
    } else {
      console.log(`[useoptic] TTI already captured`);
    }

    return () => {
      mountedRef.current = false;
      
      // Only reset TTI if we're actually unmounting the screen
      if (prevScreenRef.current !== screenName) {
        setTTI(null);
      }
    };
  }, [screenName, setTTI]);
} 