import { initRenderTracking, setRootComponent } from '../metrics/globalRenderTracking';
import { initNetworkTracking } from '../metrics/network';
import { useMetricsStore } from '../store/metricsStore';
import { trackStartupTime } from '../metrics/startup';
import { startFPSTracking } from '../metrics/fps';

export interface InitOpticOptions {
  rootComponent?: React.ComponentType<any>;
  reRenders?: boolean;
  network?: boolean;
  tti?: boolean;
  startup?: boolean;
  fps?: boolean;
}

export const initOptic = (options: InitOpticOptions = {}) => {
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

  return {
    rootComponent,
    reRenders,
    network,
    tti,
    startup,
    fps
  };
};
