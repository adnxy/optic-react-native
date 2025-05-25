import React, { useEffect, useRef } from 'react';
import { useMetricsStore } from '../store/metricsStore';

interface ReRenderInfo {
  componentName: string;
  timestamp: number;
  changedProps: Record<string, { from: any; to: any }>;
  renderCount: number;
  stackTrace?: string;
}

/**
 * Hook to monitor and log prop changes for a component.
 * @param componentName Name of the component
 * @param props Component props
 * @param options Additional options for tracking
 */
export function useRenderMonitor<T extends Record<string, any>>(
  componentName: string,
  props: T,
  options: {
    debug?: boolean;
    ignoreProps?: string[];
    trackStack?: boolean;
  } = {}
) {
  if (!React) return;

  const { ignoreProps = [], trackStack = false } = options;
  const prevProps = useRef<T | null>(null);
  const renderCount = useRef(0);
  const incrementReRender = useMetricsStore((state) => state.incrementReRender);
  const currentScreen = useMetricsStore((state) => state.currentScreen);

  useEffect(() => {
    prevProps.current = null;
    renderCount.current = 0;
  }, [currentScreen]);

  useEffect(() => {
    if (prevProps.current) {
      const changedProps: Record<string, { from: any; to: any }> = {};
      
      for (const key of Object.keys(props)) {
        if (!ignoreProps.includes(key) && prevProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: prevProps.current[key],
            to: props[key],
          };
        }
      }

      if (Object.keys(changedProps).length > 0) {
        renderCount.current++;
        const reRenderInfo: ReRenderInfo = {
          componentName,
          timestamp: Date.now(),
          changedProps,
          renderCount: renderCount.current,
        };

        if (trackStack) {
          reRenderInfo.stackTrace = new Error().stack;
        }

        incrementReRender(componentName);
      }
    }
    prevProps.current = props;
  });
}

let renderTrackingSetup = false;

/**
 * Sets up global render tracking with configuration options.
 * @param options Configuration options for render tracking
 */
export function setupRenderTracking(options: {
  debug?: boolean;
  trackStack?: boolean;
} = {}) {
  if (!renderTrackingSetup) {
    renderTrackingSetup = true;
  }
}
