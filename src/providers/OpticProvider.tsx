import React, { useEffect, useRef } from 'react';
import { useMetricsStore } from '../store/metricsStore';
import { Overlay } from '../overlay/Overlay';
import { startTTITracking, stopTTITracking, resetTTIForCurrentScreen } from '../metrics/tti';
import { useNavigation, useRoute, useNavigationContainerRef } from '@react-navigation/native';
import { usePathname, useSegments } from 'expo-router';

declare global {
  var __OPTIC_APP_TTI_START__: Record<string, number>;
}

if (!global.__OPTIC_APP_TTI_START__) {
  global.__OPTIC_APP_TTI_START__ = {};
}

interface OpticProviderProps {
  children: React.ReactNode;
  /**
   * Enable or disable specific metrics
   */
  metrics?: {
    tti?: boolean;
    startup?: boolean;
    reRenders?: boolean;
    fps?: boolean;
    network?: boolean;
  };
  /**
   * Show or hide the performance overlay
   */
  showOverlay?: boolean;
}

export const OpticProvider: React.FC<OpticProviderProps> = ({ 
  children,
  metrics = {
    tti: true,
    startup: true,
    reRenders: true,
    fps: true,
    network: true,
  },
  showOverlay = true
}) => {
  const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  const prevScreenRef = useRef<string | null>(null);
  const pathname = usePathname();
  const segments = useSegments();
  const navigationRef = useNavigationContainerRef();

  // Navigation hooks
  const navigation = useNavigation();
  const route = useRoute();

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
    
    // Only start TTI tracking if this is a new screen
    if (prevScreenRef.current !== screenName) {
      prevScreenRef.current = screenName;
      startTTITracking();
    }
  }, [pathname, segments, navigationRef.current]);

  // Handle TTI tracking
  useEffect(() => {
    if (!metrics.tti) {
      stopTTITracking();
      return;
    }

    const isNewScreen = prevScreenRef.current !== currentScreen;
    if (isNewScreen && currentScreen) {
      console.log(`[useoptic] Screen changed from ${prevScreenRef.current} to ${currentScreen}`);
      prevScreenRef.current = currentScreen;
      
      // Reset TTI for the new screen
      resetTTIForCurrentScreen();
    } else if (currentScreen) {
      // Start TTI tracking if not already started
      startTTITracking();
    }

    return () => {
      stopTTITracking();
    };
  }, [currentScreen, metrics.tti]);

  return (
    <>
      {children}
      {showOverlay && <Overlay />}
    </>
  );
}; 