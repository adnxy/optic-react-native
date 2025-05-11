import { initRenderTracking, setRootComponent } from '../metrics/globalRenderTracking';
import { initNetworkTracking } from '../metrics/network';
import { useMetricsStore } from '../store/metricsStore';
import { trackStartupTime } from '../metrics/startup';
import { startFPSTracking } from '../metrics/fps';
import type { MetricsState } from '../store/metricsStore';
import { setOpticEnabled } from '../store/metricsStore';

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
    setRootComponent(rootComponent);
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
