import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useMetricsStore } from '../store/metricsStore';

export function withScreenTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName?: string
) {
  return function WithScreenTracking(props: P) {
    const navigation = useNavigation();
    const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);

    useEffect(() => {
      // Get screen name from navigation state or use provided name
      const route = navigation.getState().routes[navigation.getState().index];
      const currentScreenName = screenName || route.name;
      
      setCurrentScreen(currentScreenName);
      
      return () => {
        // Clear screen name when component unmounts
        setCurrentScreen(null);
      };
    }, [navigation, screenName, setCurrentScreen]);

    return <WrappedComponent {...props} />;
  };
} 