"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/store/metricsStore.ts
var import_zustand, createScreenMetrics, useMetricsStore;
var init_metricsStore = __esm({
  "src/store/metricsStore.ts"() {
    "use strict";
    import_zustand = require("zustand");
    createScreenMetrics = () => ({
      tti: null,
      reRenderCounts: {}
    });
    useMetricsStore = (0, import_zustand.create)((set, get) => ({
      currentScreen: null,
      screens: {},
      startupTime: null,
      setCurrentScreen: (screenName) => {
        const state = get();
        if (state.currentScreen !== screenName) {
          console.log(`[useoptic] Setting current screen to: ${screenName}`);
          set((state2) => {
            if (!state2.screens[screenName]) {
              return {
                currentScreen: screenName,
                screens: __spreadProps(__spreadValues({}, state2.screens), {
                  [screenName]: createScreenMetrics()
                })
              };
            }
            return { currentScreen: screenName };
          });
        }
      },
      setTTI: (tti) => {
        var _a;
        const state = get();
        if (!state.currentScreen) {
          console.log("[useoptic] Cannot set TTI: no current screen");
          return;
        }
        const currentTTI = (_a = state.screens[state.currentScreen]) == null ? void 0 : _a.tti;
        if (currentTTI !== tti) {
          console.log(`[useoptic] Setting TTI for ${state.currentScreen}: ${tti}ms`);
          set((state2) => ({
            screens: __spreadProps(__spreadValues({}, state2.screens), {
              [state2.currentScreen]: __spreadProps(__spreadValues({}, state2.screens[state2.currentScreen]), {
                tti
              })
            })
          }));
        }
      },
      setStartupTime: (startupTime) => {
        const state = get();
        if (state.startupTime !== startupTime) {
          console.log(`[useoptic] Setting startup time: ${startupTime}ms`);
          set({ startupTime });
        }
      },
      incrementReRender: (componentName) => {
        const state = get();
        if (!state.currentScreen) return;
        const currentScreen = state.screens[state.currentScreen];
        const currentCount = currentScreen.reRenderCounts[componentName] || 0;
        set((state2) => ({
          screens: __spreadProps(__spreadValues({}, state2.screens), {
            [state2.currentScreen]: __spreadProps(__spreadValues({}, currentScreen), {
              reRenderCounts: __spreadProps(__spreadValues({}, currentScreen.reRenderCounts), {
                [componentName]: currentCount + 1
              })
            })
          })
        }));
      }
    }));
  }
});

// src/metrics/tti.ts
var tti_exports = {};
__export(tti_exports, {
  trackTTI: () => trackTTI
});
function trackTTI() {
  if (global.__OPTIC_TTI_CAPTURED__) return;
  const start = Date.now();
  requestAnimationFrame(() => {
    const tti = Date.now() - start;
    global.__OPTIC_TTI_CAPTURED__ = true;
    useMetricsStore.getState().setTTI(tti);
    console.log(`[useoptic] TTI measured: ${tti}ms`);
  });
}
var init_tti = __esm({
  "src/metrics/tti.ts"() {
    "use strict";
    init_metricsStore();
  }
});

// src/metrics/startup.ts
var startup_exports = {};
__export(startup_exports, {
  trackStartupTime: () => trackStartupTime
});
function trackStartupTime() {
  if (global.__OPTIC_STARTUP_CAPTURED__) {
    return;
  }
  const start = global.__OPTIC_APP_START_TIME__ || Date.now();
  requestAnimationFrame(() => {
    if (!global.__OPTIC_STARTUP_CAPTURED__) {
      const duration = Date.now() - start;
      global.__OPTIC_STARTUP_CAPTURED__ = true;
      useMetricsStore.getState().setStartupTime(duration);
      console.log(`[useoptic] Startup time: ${duration}ms`);
    }
  });
}
var init_startup = __esm({
  "src/metrics/startup.ts"() {
    "use strict";
    init_metricsStore();
    if (global.__OPTIC_APP_START_TIME__ === void 0) {
      global.__OPTIC_APP_START_TIME__ = Date.now();
    }
    if (global.__OPTIC_STARTUP_CAPTURED__ === void 0) {
      global.__OPTIC_STARTUP_CAPTURED__ = false;
    }
  }
});

// src/metrics/reRenders.ts
var reRenders_exports = {};
__export(reRenders_exports, {
  setupRenderTracking: () => setupRenderTracking,
  useRenderMonitor: () => useRenderMonitor
});
function useRenderMonitor(componentName, props) {
  if (!React) {
    console.error("[useoptic] React is not available. Make sure React is properly imported.");
    return;
  }
  const prevProps = useRef(null);
  const incrementReRender = useMetricsStore((state) => state.incrementReRender);
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  useEffect(() => {
    prevProps.current = null;
  }, [currentScreen]);
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
function setupRenderTracking() {
  if (!renderTrackingSetup) {
    renderTrackingSetup = true;
    console.log("[useoptic] Re-render tracking enabled");
  }
}
var React, useEffect, useRef, renderTrackingSetup;
var init_reRenders = __esm({
  "src/metrics/reRenders.ts"() {
    "use strict";
    React = __toESM(require("react"));
    init_metricsStore();
    ({ useEffect, useRef } = React);
    renderTrackingSetup = false;
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  InitOptic: () => InitOptic,
  Overlay: () => Overlay,
  useRenderMonitor: () => useRenderMonitor,
  useScreenMetrics: () => useScreenMetrics
});
module.exports = __toCommonJS(index_exports);

// src/core/initOptic.ts
async function InitOptic(options = {}) {
  const {
    tti = true,
    startup = true,
    reRenders = true
  } = options;
  if (tti) {
    const { trackTTI: trackTTI2 } = await Promise.resolve().then(() => (init_tti(), tti_exports));
    trackTTI2();
    console.log("[Optic] TTI tracking enabled");
  }
  if (startup) {
    const { trackStartupTime: trackStartupTime2 } = await Promise.resolve().then(() => (init_startup(), startup_exports));
    trackStartupTime2();
    console.log("[Optic] Startup tracking enabled");
  }
  if (reRenders) {
    const { setupRenderTracking: setupRenderTracking2 } = await Promise.resolve().then(() => (init_reRenders(), reRenders_exports));
    setupRenderTracking2();
    console.log("[Optic] Re-render tracking enabled");
  }
}

// src/overlay/Overlay.tsx
var import_react = __toESM(require("react"));
var import_react_native = require("react-native");
init_metricsStore();
var import_react_native_safe_area_context = require("react-native-safe-area-context");
var { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = import_react_native.Dimensions.get("window");
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
  const pan = (0, import_react.useRef)(new import_react_native.Animated.ValueXY()).current;
  const [position, setPosition] = (0, import_react.useState)({ x: SCREEN_WIDTH - 200, y: 100 });
  const panResponder = (0, import_react.useRef)(
    import_react_native.PanResponder.create({
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
  return /* @__PURE__ */ import_react.default.createElement(import_react_native_safe_area_context.SafeAreaView, { style: styles.safeArea, pointerEvents: "box-none" }, /* @__PURE__ */ import_react.default.createElement(
    import_react_native.Animated.View,
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
    /* @__PURE__ */ import_react.default.createElement(import_react_native.View, { style: styles.dragHandle }),
    /* @__PURE__ */ import_react.default.createElement(import_react_native.View, { style: styles.header }, /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.text }, "App Performance"), /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.screenName }, currentScreen || "No Screen")),
    /* @__PURE__ */ import_react.default.createElement(import_react_native.View, { style: styles.metricsContainer }, /* @__PURE__ */ import_react.default.createElement(import_react_native.View, { style: styles.metricRow }, /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.metricLabel }, "TTI:"), /* @__PURE__ */ import_react.default.createElement(
      import_react_native.Text,
      {
        style: [
          styles.metricValue,
          { color: getMetricColor((currentScreenMetrics == null ? void 0 : currentScreenMetrics.tti) || null, "TTI") }
        ]
      },
      (currentScreenMetrics == null ? void 0 : currentScreenMetrics.tti) !== null ? `${currentScreenMetrics == null ? void 0 : currentScreenMetrics.tti}ms` : "..."
    )), /* @__PURE__ */ import_react.default.createElement(import_react_native.View, { style: styles.metricRow }, /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.metricLabel }, "Startup:"), /* @__PURE__ */ import_react.default.createElement(
      import_react_native.Text,
      {
        style: [
          styles.metricValue,
          { color: getMetricColor(startupTime, "STARTUP") }
        ]
      },
      startupTime !== null ? `${startupTime}ms` : "..."
    )), currentScreenMetrics && Object.keys(currentScreenMetrics.reRenderCounts).length > 0 && /* @__PURE__ */ import_react.default.createElement(import_react_native.View, { style: styles.reRendersContainer }, /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.metricLabel }, "Re-renders:"), Object.entries(currentScreenMetrics.reRenderCounts).map(([name, count]) => /* @__PURE__ */ import_react.default.createElement(import_react_native.View, { key: name, style: styles.reRenderRow }, /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.reRenderName }, name), /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.reRenderCount }, count)))))
  ));
};
var styles = import_react_native.StyleSheet.create({
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

// src/index.ts
init_reRenders();

// src/metrics/screen.ts
var import_react2 = require("react");
init_metricsStore();
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
  const prevScreenRef = (0, import_react2.useRef)(null);
  const mountedRef = (0, import_react2.useRef)(true);
  const handleScreenChange = (0, import_react2.useCallback)(() => {
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
  (0, import_react2.useEffect)(() => {
    console.log(`[useoptic] Screen change effect triggered for "${screenName}"`);
    handleScreenChange();
  }, [handleScreenChange]);
  (0, import_react2.useEffect)(() => {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InitOptic,
  Overlay,
  useRenderMonitor,
  useScreenMetrics
});
//# sourceMappingURL=index.js.map