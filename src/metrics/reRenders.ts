import { useEffect, useRef } from 'react';

/**
 * Hook to monitor and log prop changes for a component.
 * @param componentName Name of the component
 * @param props Component props
 */
export function useRenderMonitor<T extends Record<string, any>>(
  componentName: string,
  props: T
) {
  const prevProps = useRef<T | null>(null);

  useEffect(() => {
    if (prevProps.current) {
      const changedProps: Record<string, { from: any; to: any }> = {};
      for (const key of Object.keys(props)) {
        if (prevProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: prevProps.current[key],
            to: props[key],
          };
        }
      }
      if (Object.keys(changedProps).length > 0) {
        console.log(
          `[useoptic] ${componentName} re-rendered. Changed props:`,
          changedProps
        );
      }
    }
    prevProps.current = props;
  });
}

let renderTrackingSetup = false;

/**
 * Sets up global render tracking (one-time log).
 */
export function setupRenderTracking() {
  if (!renderTrackingSetup) {
    renderTrackingSetup = true;
    console.log('[useoptic] Re-render tracking enabled');
  }
}
