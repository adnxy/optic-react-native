import { useEffect } from 'react';
import { useMetricsStore } from '../store/metricsStore';

/**
 * A simple hook to track screen names in your React Native app.
 * Just add this hook to your screen components:
 * 
 * @example
 * function HomeScreen() {
 *   useScreenName('Home');
 *   return <View>...</View>;
 * }
 */
export function useScreenName(screenName: string) {
  const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);

  useEffect(() => {
    setCurrentScreen(screenName);
    return () => setCurrentScreen(null);
  }, [screenName, setCurrentScreen]);
} 