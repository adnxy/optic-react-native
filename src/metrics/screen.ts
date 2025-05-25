import { useEffect, useRef, useCallback } from 'react';
import { useMetricsStore } from '../store/metricsStore';

/**
 * Hook to track screen performance metrics.
 * @param screenName Name of the current screen
 */
export function useScreenMetrics(screenName: string) {
  const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);
  const screens = useMetricsStore((state) => state.screens);
  const prevScreenRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  // Memoize the screen change handler
  const handleScreenChange = useCallback(() => {
    const isNewScreen = prevScreenRef.current !== screenName;
    if (isNewScreen) {
      prevScreenRef.current = screenName;
      setCurrentScreen(screenName);
    }
  }, [screenName, setCurrentScreen]);

  // Handle screen changes
  useEffect(() => {
    handleScreenChange();
  }, [handleScreenChange]);

  // Handle cleanup
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, [screenName]);
} 