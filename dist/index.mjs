import {
  useRenderMonitor
} from "./chunk-QYENO6IE.mjs";
import {
  __spreadValues,
  useMetricsStore
} from "./chunk-PY6A55FM.mjs";

// src/core/initOptic.ts
async function InitOptic(options = {}) {
  const {
    tti = true,
    startup = true,
    reRenders = true
  } = options;
  if (tti) {
    const { trackTTI } = await import("./tti-7ZG7XKYX.mjs");
    trackTTI();
    console.log("[Optic] TTI tracking enabled");
  }
  if (startup) {
    const { trackStartupTime } = await import("./startup-GQJSL76P.mjs");
    trackStartupTime();
    console.log("[Optic] Startup tracking enabled");
  }
  if (reRenders) {
    const { setupRenderTracking } = await import("./reRenders-34ALAVB2.mjs");
    setupRenderTracking();
    console.log("[Optic] Re-render tracking enabled");
  }
}

// src/overlay/Overlay.tsx
import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
var { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
var METRICS_THRESHOLDS = {
  TTI: {
    good: 20,
    warning: 50
  },
  STARTUP: {
    good: 150,
    warning: 200
  }
};
var getMetricColor = (value, type) => {
  if (value === null) return "#fff";
  const thresholds = METRICS_THRESHOLDS[type];
  if (value <= thresholds.good) return "#4CAF50";
  if (value <= thresholds.warning) return "#FFC107";
  return "#F44336";
};
var Overlay = () => {
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  const screens = useMetricsStore((state) => state.screens);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const pan = useRef(new Animated.ValueXY()).current;
  const [position, setPosition] = useState({ x: SCREEN_WIDTH - 200, y: 100 });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const newX = position.x + gesture.dx;
        const newY = position.y + gesture.dy;
        const boundedX = Math.max(0, Math.min(newX, SCREEN_WIDTH - 180));
        const boundedY = Math.max(0, Math.min(newY, SCREEN_HEIGHT - 200));
        pan.setValue({ x: boundedX - position.x, y: boundedY - position.y });
      },
      onPanResponderRelease: (_, gesture) => {
        const newX = position.x + gesture.dx;
        const newY = position.y + gesture.dy;
        const boundedX = Math.max(0, Math.min(newX, SCREEN_WIDTH - 180));
        const boundedY = Math.max(0, Math.min(newY, SCREEN_HEIGHT - 200));
        setPosition({ x: boundedX, y: boundedY });
        pan.setValue({ x: 0, y: 0 });
      }
    })
  ).current;
  const currentScreenMetrics = currentScreen ? screens[currentScreen] : null;
  return /* @__PURE__ */ React.createElement(SafeAreaView, { style: styles.safeArea, pointerEvents: "box-none" }, /* @__PURE__ */ React.createElement(
    Animated.View,
    __spreadValues({
      style: [
        styles.overlay,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y }
          ],
          left: position.x,
          top: position.y
        }
      ]
    }, panResponder.panHandlers),
    /* @__PURE__ */ React.createElement(View, { style: styles.dragHandle }),
    /* @__PURE__ */ React.createElement(View, { style: styles.header }, /* @__PURE__ */ React.createElement(Text, { style: styles.text }, "App Performance"), /* @__PURE__ */ React.createElement(Text, { style: styles.screenName }, currentScreen || "No Screen")),
    /* @__PURE__ */ React.createElement(View, { style: styles.metricsContainer }, /* @__PURE__ */ React.createElement(View, { style: styles.metricRow }, /* @__PURE__ */ React.createElement(Text, { style: styles.metricLabel }, "TTI:"), /* @__PURE__ */ React.createElement(
      Text,
      {
        style: [
          styles.metricValue,
          { color: getMetricColor((currentScreenMetrics == null ? void 0 : currentScreenMetrics.tti) || null, "TTI") }
        ]
      },
      (currentScreenMetrics == null ? void 0 : currentScreenMetrics.tti) !== null ? `${currentScreenMetrics == null ? void 0 : currentScreenMetrics.tti}ms` : "..."
    )), /* @__PURE__ */ React.createElement(View, { style: styles.metricRow }, /* @__PURE__ */ React.createElement(Text, { style: styles.metricLabel }, "Startup:"), /* @__PURE__ */ React.createElement(
      Text,
      {
        style: [
          styles.metricValue,
          { color: getMetricColor(startupTime, "STARTUP") }
        ]
      },
      startupTime !== null ? `${startupTime}ms` : "..."
    )), currentScreenMetrics && Object.keys(currentScreenMetrics.reRenderCounts).length > 0 && /* @__PURE__ */ React.createElement(View, { style: styles.reRendersContainer }, /* @__PURE__ */ React.createElement(Text, { style: styles.metricLabel }, "Re-renders:"), Object.entries(currentScreenMetrics.reRenderCounts).map(([name, count]) => /* @__PURE__ */ React.createElement(View, { key: name, style: styles.reRenderRow }, /* @__PURE__ */ React.createElement(Text, { style: styles.reRenderName }, name), /* @__PURE__ */ React.createElement(Text, { style: styles.reRenderCount }, count)))))
  ));
};
var styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "box-none"
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(33, 33, 33, 0.95)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 9999,
    elevation: 20,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12
  },
  header: {
    marginBottom: 12
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.5
  },
  screenName: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2
  },
  metricsContainer: {
    gap: 8
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  metricLabel: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.7
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "500"
  },
  reRendersContainer: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 8
  },
  reRenderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4
  },
  reRenderName: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.7
  },
  reRenderCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500"
  }
});

// src/metrics/screen.ts
import { useEffect, useRef as useRef2, useCallback } from "react";
if (!global.__OPTIC_SCREEN_TTI_CAPTURED__) {
  global.__OPTIC_SCREEN_TTI_CAPTURED__ = {};
}
if (!global.__OPTIC_SCREEN_TTI_START__) {
  global.__OPTIC_SCREEN_TTI_START__ = {};
}
function useScreenMetrics(screenName) {
  console.log(`[useoptic] useScreenMetrics called for "${screenName}"`);
  const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);
  const setTTI = useMetricsStore((state) => state.setTTI);
  const screens = useMetricsStore((state) => state.screens);
  const prevScreenRef = useRef2(null);
  const mountedRef = useRef2(true);
  const handleScreenChange = useCallback(() => {
    console.log(`[useoptic] handleScreenChange called for "${screenName}"`);
    const isNewScreen = prevScreenRef.current !== screenName;
    if (isNewScreen) {
      console.log(`[useoptic] New screen detected: "${screenName}"`);
      prevScreenRef.current = screenName;
      global.__OPTIC_SCREEN_TTI_CAPTURED__[screenName] = false;
      setCurrentScreen(screenName);
      console.log(`[useoptic] Starting TTI measurement for "${screenName}"`);
    }
  }, [screenName, setCurrentScreen]);
  useEffect(() => {
    console.log(`[useoptic] Screen change effect triggered for "${screenName}"`);
    handleScreenChange();
  }, [handleScreenChange]);
  useEffect(() => {
    console.log(`[useoptic] TTI measurement effect triggered for "${screenName}"`);
    mountedRef.current = true;
    if (!global.__OPTIC_SCREEN_TTI_CAPTURED__[screenName]) {
      console.log(`[useoptic] Measuring TTI for "${screenName}"`);
      global.__OPTIC_SCREEN_TTI_CAPTURED__[screenName] = true;
      global.__OPTIC_SCREEN_TTI_START__[screenName] = Date.now();
      setTTI(null);
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          const start = global.__OPTIC_SCREEN_TTI_START__[screenName];
          const tti = Date.now() - start;
          console.log(`[useoptic] Setting TTI for "${screenName}": ${tti}ms`);
          setTTI(tti);
        }
      });
    } else {
      console.log(`[useoptic] TTI already captured for "${screenName}"`);
    }
    return () => {
      console.log(`[useoptic] Cleaning up TTI measurement for "${screenName}"`);
      mountedRef.current = false;
      if (prevScreenRef.current !== screenName) {
        if (screens[screenName]) {
          setTTI(null);
        }
      }
    };
  }, [screenName, setTTI, screens]);
}
export {
  InitOptic,
  Overlay,
  useRenderMonitor,
  useScreenMetrics
};
//# sourceMappingURL=index.mjs.map