// src/metrics/reRenders.ts
import { useEffect, useRef } from "react";
function useRenderMonitor(componentName, props) {
  const prevProps = useRef(null);
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
//# sourceMappingURL=chunk-6Y6SVZSH.mjs.map