import { useEffect } from 'react';
import { useMetricsStore } from '../store/metricsStore';

/**
 * Automatically tracks the current screen name based on the component's name.
 * Just add this hook to your screen components without any parameters:
 * 
 * @example
 * function HomeScreen() {
 *   useAutoScreenName(); // That's it! It will automatically use "HomeScreen" as the name
 *   return <View>...</View>;
 * }
 */
export function useAutoScreenName() {
  const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);
  
  useEffect(() => {
    // Get the component name from the stack trace
    const stack = new Error().stack || '';
    const match = stack.match(/at\s+(\w+)\s+\(/);
    const componentName = match ? match[1] : 'Unknown';
    
    // Remove "Screen" suffix if present
    const screenName = componentName.replace(/Screen$/, '');
    
    setCurrentScreen(screenName);
    return () => setCurrentScreen(null);
  }, [setCurrentScreen]);
} 