import {
  useMetricsStore
} from "./chunk-RTAHOVXP.mjs";

// src/metrics/reRenders.ts
import * as React from "react";
var { useEffect, useRef } = React;
function useRenderMonitor(componentName, props) {
  if (!React) {
    console.error("[useoptic] React is not available. Make sure React is properly imported.");
    return;
  }
  const prevProps = useRef(null);
  const incrementReRender = useMetricsStore((state) => state.incrementReRender);
  useEffect(() => {
    if (prevProps.current) {
      const changedProps = {};
      for (const key of Object.keys(props)) {
        if (prevProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: prevProps.current[key],
            to: props[key]
          };
        }
      }
      if (Object.keys(changedProps).length > 0) {
        incrementReRender(componentName);
        console.log(
          `[useoptic] ${componentName} re-rendered. Changed props:`,
          changedProps
        );
      }
    }
    prevProps.current = props;
  });
}
var renderTrackingSetup = false;
function setupRenderTracking() {
  if (!renderTrackingSetup) {
    renderTrackingSetup = true;
    console.log("[useoptic] Re-render tracking enabled");
  }
}

export {
  useRenderMonitor,
  setupRenderTracking
};
//# sourceMappingURL=chunk-5T2SK47N.mjs.map