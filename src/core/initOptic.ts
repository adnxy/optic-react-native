import { initRenderTracking, setRootComponent } from '../metrics/globalRenderTracking';
import { initNetworkTracking } from '../metrics/network';
import { useMetricsStore } from '../store/metricsStore';
import { trackStartupTime } from '../metrics/startup';
import { startFPSTracking } from '../metrics/fps';
import type { MetricsState } from '../store/metricsStore';
import { setOpticEnabled } from '../store/metricsStore';
import React from 'react';

export interface InitOpticOptions {
  rootComponent?: React.ComponentType<any>;
  reRenders?: boolean;
  network?: boolean;
  tti?: boolean;
  startup?: boolean;
  fps?: boolean;
  enabled?: boolean;
  onMetricsLogged?: (metrics: MetricsState) => void;
}

// Create a wrapper component that automatically tracks screen names
function withScreenTracking<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
  const screenName = displayName.replace(/Screen$/, '');

  function WithScreenTracking(props: P) {
    const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);
    
    React.useEffect(() => {
      console.log(`[useoptic] Setting current screen to "${screenName}"`);
      setCurrentScreen(screenName);
      return () => setCurrentScreen(null);
    }, [setCurrentScreen]);

    return React.createElement(WrappedComponent, props);
  }

  WithScreenTracking.displayName = `WithScreenTracking(${displayName})`;
  return WithScreenTracking;
}

// Function to check if a component is likely a screen
function isScreenComponent(component: any): boolean {
  const name = component.displayName || component.name || '';
  return name.endsWith('Screen') || name.endsWith('Page') || name.endsWith('View');
}

// Store to keep track of wrapped components
const wrappedComponents = new WeakMap();

// Function to wrap a component if it's a screen
function wrapIfScreen<P extends object>(Component: React.ComponentType<P>): React.ComponentType<P> {
  if (!isScreenComponent(Component)) {
    return Component;
  }

  // Check if already wrapped
  if (wrappedComponents.has(Component)) {
    return wrappedComponents.get(Component);
  }

  // Wrap the component
  const wrapped = withScreenTracking(Component);
  wrappedComponents.set(Component, wrapped);
  return wrapped;
}

export function initOptic(options: InitOpticOptions = {}) {
  const { enabled = true, onMetricsLogged } = options;
  setOpticEnabled(enabled);
  if (!enabled) {
    // Do not initialize anything if disabled
    return;
  }
  const { 
    rootComponent, 
    reRenders = false, 
    network = false,
    tti = true,
    startup = true,
    fps = true
  } = options;

  // Set the root component if provided
  if (rootComponent) {
    const wrappedRoot = wrapIfScreen(rootComponent);
    setRootComponent(wrappedRoot);
  }

  // Initialize render tracking if enabled
  if (reRenders) {
    initRenderTracking();
  }

  // Initialize network tracking if enabled
  if (network) {
    initNetworkTracking();
  }

  // Track startup time if enabled
  if (startup) {
    trackStartupTime();
  }

  // Start FPS tracking if enabled
  if (fps) {
    startFPSTracking();
  }

  // Initialize metrics store
  useMetricsStore.getState();

  // Subscribe to metrics changes and call the callback
  if (onMetricsLogged) {
    const unsubscribe = useMetricsStore.subscribe((metrics) => {
      onMetricsLogged(metrics);
    });
    // Optionally return unsubscribe so the user can clean up
    return {
      rootComponent,
      reRenders,
      network,
      tti,
      startup,
      fps,
      unsubscribe,
    };
  }

  return {
    rootComponent,
    reRenders,
    network,
    tti,
    startup,
    fps
  };
}
