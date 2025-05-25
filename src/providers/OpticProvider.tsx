import React, { useEffect, useRef } from 'react';
import { useMetricsStore } from '../store/metricsStore';
import { Overlay } from '../overlay/Overlay';
import { useNavigation, useRoute, useNavigationContainerRef } from '@react-navigation/native';
import { usePathname, useSegments } from 'expo-router';
import { initRenderTracking } from '../metrics/globalRenderTracking';
import { FPSManager } from '../metrics/fps';

interface OpticProviderProps {
  children: React.ReactNode;
  /**
   * Enable or disable specific metrics
   */
  metrics?: {
    enabled?: boolean;
    startup?: boolean;
    reRenders?: boolean;
    fps?: boolean;
    network?: boolean;
    traces?: boolean;
  };
  /**
   * Show or hide the performance overlay
   */
  showOverlay?: boolean;
}

const defaultMetrics = {
  enabled: true,
  startup: true,
  reRenders: true,
  fps: true,
  network: true,
  traces: true,
};

export const OpticProvider: React.FC<OpticProviderProps> = ({ 
  children,
  metrics = defaultMetrics,
  showOverlay = true
}) => {
  const { setCurrentScreen } = useMetricsStore();
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  const pathname = usePathname();
  const segments = useSegments();
  const navigationRef = useNavigationContainerRef();
  const fpsManager = React.useRef<FPSManager | null>(null);

  // Navigation hooks
  const navigation = useNavigation();
  const route = useRoute();

  // Initialize re-render tracking if enabled
  useEffect(() => {
    if (metrics.reRenders) {
      initRenderTracking();
    }
  }, [metrics.reRenders]);

  useEffect(() => {
    if (metrics.enabled && metrics.fps) {
      fpsManager.current = new FPSManager();
      fpsManager.current.startTracking();
    }

    return () => {
      if (fpsManager.current) {
        fpsManager.current.stopTracking();
      }
    };
  }, [metrics.enabled, metrics.fps]);

  // Function to get the current screen name
  const getCurrentScreenName = () => {
    // Try to get screen name from Expo Router first
    if (pathname) {
      return pathname;
    }

    // Fallback to React Navigation
    if (navigationRef.current) {
      const currentRoute = navigationRef.current.getCurrentRoute();
      if (currentRoute?.name) {
        return currentRoute.name;
      }
    }

    // If no screen name is found, use the first segment or default to 'index'
    return segments[0] || 'index';
  };

  // Handle screen changes and initial route
  useEffect(() => {
    const screenName = getCurrentScreenName();
    
    // Always set the current screen, even if it's the same
    // This ensures we capture the initial route
    setCurrentScreen(screenName);
  }, [pathname, segments, navigationRef.current]);

  return (
    <>
      {children}
      {showOverlay && <Overlay />}
    </>
  );
}; 