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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  Overlay: () => Overlay,
  initOptic: () => initOptic,
  useRenderMonitor: () => useRenderMonitor,
  useScreenMetrics: () => useScreenMetrics
});
module.exports = __toCommonJS(index_exports);

// src/metrics/globalRenderTracking.ts
var React = __toESM(require("react"));

// src/store/metricsStore.ts
var import_zustand = require("zustand");
var useMetricsStore = (0, import_zustand.create)((set, get) => ({
  currentScreen: null,
  screens: {},
  startupTime: null,
  fps: null,
  networkRequests: [],
  setCurrentScreen: (screenName) => {
    set((state) => {
      if (screenName && !state.screens[screenName]) {
        return {
          currentScreen: screenName,
          screens: __spreadProps(__spreadValues({}, state.screens), {
            [screenName]: {
              tti: null,
              reRenderCounts: {}
            }
          })
        };
      }
      return { currentScreen: screenName };
    });
  },
  setTTI: (screenName, tti) => {
    set((state) => ({
      screens: __spreadProps(__spreadValues({}, state.screens), {
        [screenName]: __spreadProps(__spreadValues({}, state.screens[screenName]), {
          tti
        })
      })
    }));
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
  },
  setStartupTime: (time) => {
    set({ startupTime: time });
  },
  setFPS: (fps) => {
    set({ fps });
  },
  addNetworkRequest: (request) => {
    set((state) => ({
      networkRequests: [...state.networkRequests, request].slice(-50)
      // Keep last 50 requests
    }));
  }
}));
var opticEnabled = true;
function setOpticEnabled(value) {
  opticEnabled = value;
}

// src/metrics/globalRenderTracking.ts
var renderCounts = {};
var withRenderTracking = (WrappedComponent) => {
  const RenderTrackingWrapper = (props) => {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || "Unknown";
    const incrementReRender = useMetricsStore((state) => state.incrementReRender);
    React.useEffect(() => {
      if (global.__OPTIC_RENDER_TRACKING_ENABLED__) {
        incrementReRender(componentName);
        renderCounts[componentName] = (renderCounts[componentName] || 0) + 1;
      }
    });
    return React.createElement(WrappedComponent, props);
  };
  return RenderTrackingWrapper;
};
function wrapWithRenderTracking(component) {
  if (!component) return component;
  if (component.__OPTIC_WRAPPED__) return component;
  const wrapped = withRenderTracking(component);
  wrapped.__OPTIC_WRAPPED__ = true;
  return wrapped;
}
function setupGlobalRenderTracking() {
  const rootComponent = global.__OPTIC_ROOT_COMPONENT__;
  if (!rootComponent) {
    console.warn("[useoptic] Root component not found. Make sure to set global.__OPTIC_ROOT_COMPONENT__ before calling setupGlobalRenderTracking");
    return;
  }
  const wrappedRoot = wrapWithRenderTracking(rootComponent);
  global.__OPTIC_ROOT_COMPONENT__ = wrappedRoot;
  console.log("[useoptic] Global render tracking enabled");
}
function setRootComponent(component) {
  if (!component) return;
  console.log("[useoptic] Setting root component:", component.name || "Unknown");
  global.__OPTIC_ROOT_COMPONENT__ = component;
  if (global.__OPTIC_RENDER_TRACKING_ENABLED__) {
    setupGlobalRenderTracking();
  }
}
function initRenderTracking() {
  global.__OPTIC_RENDER_TRACKING_ENABLED__ = true;
  if (global.__OPTIC_ROOT_COMPONENT__) {
    setupGlobalRenderTracking();
  }
  console.log("[useoptic] Render tracking initialized");
}

// src/metrics/network.ts
var NETWORK_THRESHOLDS = {
  GOOD: 200,
  WARNING: 500,
  CRITICAL: 1e3
};
var originalFetch = null;
var initNetworkTracking = () => {
  if (originalFetch !== null) return;
  originalFetch = global.fetch;
  global.fetch = async function(input, init) {
    const startTime = performance.now();
    const url = input instanceof Request ? input.url : input.toString();
    const method = input instanceof Request ? input.method : (init == null ? void 0 : init.method) || "GET";
    console.log(`[useoptic] Network request started: ${method} ${url}`);
    try {
      const response = await originalFetch(input, init);
      const endTime = performance.now();
      const duration = endTime - startTime;
      const request = {
        url,
        method,
        duration,
        status: response.status
      };
      console.log(`[useoptic] Network request completed: ${method} ${url} - ${Math.round(duration)}ms (${response.status})`);
      useMetricsStore.getState().addNetworkRequest(request);
      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      const request = {
        url,
        method,
        duration,
        status: 0
        // Error status
      };
      console.log(`[useoptic] Network request failed: ${method} ${url} - ${Math.round(duration)}ms`);
      useMetricsStore.getState().addNetworkRequest(request);
      throw error;
    }
  };
  console.log("[useoptic] Network tracking started");
};
var getNetworkColor = (duration) => {
  if (duration === null || duration === void 0) return "#666666";
  if (duration <= NETWORK_THRESHOLDS.GOOD) return "#4CAF50";
  if (duration <= NETWORK_THRESHOLDS.WARNING) return "#FFC107";
  return "#F44336";
};

// src/metrics/startup.ts
if (global.__OPTIC_APP_START_TIME__ === void 0) {
  global.__OPTIC_APP_START_TIME__ = Date.now();
}
if (global.__OPTIC_STARTUP_CAPTURED__ === void 0) {
  global.__OPTIC_STARTUP_CAPTURED__ = false;
}
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
    }
  });
}

// src/metrics/fps.ts
var frameCount = 0;
var lastTime = performance.now();
var animationFrameId = null;
var FPS_THRESHOLDS = {
  good: 60,
  warning: 55
};
function startFPSTracking() {
  if (animationFrameId !== null) {
    return;
  }
  function measureFPS() {
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;
    if (elapsed >= 1e3) {
      const fps = Math.round(frameCount * 1e3 / elapsed);
      useMetricsStore.getState().setFPS(fps);
      frameCount = 0;
      lastTime = currentTime;
    }
    frameCount++;
    animationFrameId = requestAnimationFrame(measureFPS);
  }
  animationFrameId = requestAnimationFrame(measureFPS);
}
function getFPSColor(fps) {
  if (fps === null) return "#fff";
  if (fps >= FPS_THRESHOLDS.good) return "#4CAF50";
  if (fps >= FPS_THRESHOLDS.warning) return "#FFC107";
  return "#F44336";
}

// src/core/initOptic.ts
var import_react = __toESM(require("react"));
function withScreenTracking(WrappedComponent) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Unknown";
  const screenName = displayName.replace(/Screen$/, "");
  function WithScreenTracking(props) {
    const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);
    import_react.default.useEffect(() => {
      console.log(`[useoptic] Setting current screen to "${screenName}"`);
      setCurrentScreen(screenName);
      return () => setCurrentScreen(null);
    }, [setCurrentScreen]);
    return import_react.default.createElement(WrappedComponent, props);
  }
  WithScreenTracking.displayName = `WithScreenTracking(${displayName})`;
  return WithScreenTracking;
}
function isScreenComponent(component) {
  const name = component.displayName || component.name || "";
  return name.endsWith("Screen") || name.endsWith("Page") || name.endsWith("View");
}
var wrappedComponents = /* @__PURE__ */ new WeakMap();
function wrapIfScreen(Component) {
  if (!isScreenComponent(Component)) {
    return Component;
  }
  if (wrappedComponents.has(Component)) {
    return wrappedComponents.get(Component);
  }
  const wrapped = withScreenTracking(Component);
  wrappedComponents.set(Component, wrapped);
  return wrapped;
}
function initOptic(options = {}) {
  const { enabled = true, onMetricsLogged } = options;
  setOpticEnabled(enabled);
  if (!enabled) {
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
  if (rootComponent) {
    const wrappedRoot = wrapIfScreen(rootComponent);
    setRootComponent(wrappedRoot);
  }
  if (reRenders) {
    initRenderTracking();
  }
  if (network) {
    initNetworkTracking();
  }
  if (startup) {
    trackStartupTime();
  }
  if (fps) {
    startFPSTracking();
  }
  useMetricsStore.getState();
  if (onMetricsLogged) {
    const unsubscribe = useMetricsStore.subscribe((metrics) => {
      onMetricsLogged(metrics);
    });
    return {
      rootComponent,
      reRenders,
      network,
      tti,
      startup,
      fps,
      unsubscribe
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

// src/overlay/Overlay.tsx
var import_react2 = __toESM(require("react"));
var import_react_native = require("react-native");
var import_react_native_safe_area_context = require("react-native-safe-area-context");
var minimizeImageUrl = "https://img.icons8.com/material-rounded/24/ffffff/minus.png";
var maximizeImageUrl = "https://img.icons8.com/ios-filled/50/ffffff/full-screen.png";
var { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = import_react_native.Dimensions.get("window");
var METRICS_THRESHOLDS = {
  TTI: {
    good: 100,
    warning: 300
  },
  STARTUP: {
    good: 100,
    warning: 300
  }
};
var getMetricColor = (value, type) => {
  if (value === null) return "#fff";
  const thresholds = METRICS_THRESHOLDS[type];
  if (value <= thresholds.good) return "#4CAF50";
  if (value <= thresholds.warning) return "#FFC107";
  return "#F44336";
};
var getStatusColor = (status) => {
  if (status >= 200 && status < 300) return "#4CAF50";
  if (status >= 400) return "#F44336";
  return "#FFC107";
};
var Overlay = () => {
  console.log("opticEnabled", opticEnabled);
  if (!opticEnabled) return null;
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  const screens = useMetricsStore((state) => state.screens);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const fps = useMetricsStore((state) => state.fps);
  const networkRequests = useMetricsStore((state) => state.networkRequests);
  const [isMinimized, setIsMinimized] = (0, import_react2.useState)(false);
  const pan = (0, import_react2.useRef)(new import_react_native.Animated.ValueXY()).current;
  const [position, setPosition] = (0, import_react2.useState)({ x: SCREEN_WIDTH - 200, y: 100 });
  const panResponder = (0, import_react2.useRef)(
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
  const latestRequest = networkRequests[networkRequests.length - 1];
  const handleCopyMetrics = () => {
    const metrics = {
      currentScreen,
      fps,
      networkRequest: latestRequest ? {
        url: latestRequest.url,
        duration: Math.round(latestRequest.duration),
        status: latestRequest.status
      } : null,
      tti: currentScreenMetrics == null ? void 0 : currentScreenMetrics.tti,
      startupTime,
      reRenders: currentScreenMetrics == null ? void 0 : currentScreenMetrics.reRenderCounts
    };
    import_react_native.Clipboard.setString(JSON.stringify(metrics, null, 2));
  };
  import_react2.default.useEffect(() => {
    if (latestRequest) {
      console.log("[useoptic] Overlay received network request:", {
        url: latestRequest.url,
        duration: Math.round(latestRequest.duration),
        status: latestRequest.status
      });
    }
  }, [latestRequest]);
  return /* @__PURE__ */ import_react2.default.createElement(import_react_native_safe_area_context.SafeAreaView, { style: styles.safeArea, pointerEvents: "box-none" }, /* @__PURE__ */ import_react2.default.createElement(
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
    /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.dragHandle }),
    /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.header }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.headerTop }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.text }, "Performance Metrics"), /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.headerButtons }, /* @__PURE__ */ import_react2.default.createElement(
      import_react_native.TouchableOpacity,
      {
        style: [styles.iconButton],
        onPress: () => setIsMinimized(!isMinimized)
      },
      /* @__PURE__ */ import_react2.default.createElement(
        import_react_native.Image,
        {
          source: { uri: isMinimized ? maximizeImageUrl : minimizeImageUrl },
          style: styles.icon
        }
      )
    ))), /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.screenNameContainer }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.screenName }, currentScreen || "No Screen"))),
    !isMinimized && /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.metricsContainer }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.performanceSection }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.metricRow }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.metricLabel }, "FPS"), /* @__PURE__ */ import_react2.default.createElement(
      import_react_native.Text,
      {
        style: [
          styles.metricValue,
          { color: getFPSColor(fps) }
        ]
      },
      fps !== null ? `${fps}` : "..."
    )), /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.divider }), /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.metricRow }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.metricLabel }, "Network Request"), /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.networkInfo }, latestRequest && /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(
      import_react_native.Text,
      {
        style: [
          styles.metricValue,
          { color: getNetworkColor(latestRequest.duration) }
        ]
      },
      latestRequest.url.split("/").pop(),
      " \u2192 ",
      Math.round(latestRequest.duration),
      "ms"
    ), latestRequest.status !== 200 && /* @__PURE__ */ import_react2.default.createElement(
      import_react_native.Text,
      {
        style: [
          styles.statusText,
          { color: getStatusColor(latestRequest.status) }
        ]
      },
      "Status: ",
      latestRequest.status,
      " ",
      latestRequest.status >= 500 ? "\u{1F534}" : "\u{1F7E0}"
    )))), /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.divider }), /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.metricRow }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.metricLabel }, "TTI"), /* @__PURE__ */ import_react2.default.createElement(
      import_react_native.Text,
      {
        style: [
          styles.metricValue,
          { color: getMetricColor((currentScreenMetrics == null ? void 0 : currentScreenMetrics.tti) || null, "TTI") }
        ]
      },
      (currentScreenMetrics == null ? void 0 : currentScreenMetrics.tti) !== null ? `${currentScreenMetrics == null ? void 0 : currentScreenMetrics.tti}ms` : "..."
    )), /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.divider }), /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.metricRow }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.metricLabel }, "Startup Time"), /* @__PURE__ */ import_react2.default.createElement(
      import_react_native.Text,
      {
        style: [
          styles.metricValue,
          { color: getMetricColor(startupTime, "STARTUP") }
        ]
      },
      startupTime !== null ? `${startupTime}ms` : "..."
    ))), currentScreenMetrics && Object.keys(currentScreenMetrics.reRenderCounts).length > 0 && /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.reRendersContainer }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.divider }), /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.reRendersTitle }, "Re-renders"), Object.entries(currentScreenMetrics.reRenderCounts).map(([name, count], index, array) => /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, { key: name }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.reRenderRow }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.reRenderName }, name), /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.reRenderCountContainer }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.reRenderCount }, count), /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.reRenderCountSuffix }, "x"))), index < array.length - 1 && /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.divider }))))),
    /* @__PURE__ */ import_react2.default.createElement(import_react_native.View, { style: styles.poweredByContainer }, /* @__PURE__ */ import_react2.default.createElement(import_react_native.Text, { style: styles.poweredByText }, "Powered by Optic"))
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
    marginBottom: 8
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 8
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8
  },
  iconButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "rgba(33, 33, 33, 0.95)",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain"
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: 0.5
  },
  screenNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  screenNameLabel: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.7,
    marginRight: 4
  },
  screenName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontStyle: "italic"
  },
  metricsContainer: {
    gap: 4
  },
  performanceSection: {
    gap: 2
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 1
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
    gap: 2
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 2
  },
  reRendersTitle: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2
  },
  reRenderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 1
  },
  reRenderName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600"
  },
  reRenderCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  reRenderCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500"
  },
  reRenderCountSuffix: {
    color: "#fff",
    fontSize: 10,
    opacity: 0.7,
    marginLeft: 2
  },
  networkInfo: {
    alignItems: "flex-end",
    gap: 0
  },
  statusText: {
    fontSize: 12,
    marginTop: 1
  },
  poweredByContainer: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: -4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  poweredByText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    opacity: 0.7,
    letterSpacing: 0.2
  }
});

// src/metrics/reRenders.ts
var React4 = __toESM(require("react"));
var { useEffect: useEffect2, useRef: useRef2 } = React4;
function useRenderMonitor(componentName, props) {
  if (!React4) {
    console.error("[useoptic] React is not available. Make sure React is properly imported.");
    return;
  }
  const prevProps = useRef2(null);
  const incrementReRender = useMetricsStore((state) => state.incrementReRender);
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  useEffect2(() => {
    prevProps.current = null;
  }, [currentScreen]);
  useEffect2(() => {
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

// src/metrics/screen.ts
var import_react3 = require("react");
if (!global.__OPTIC_SCREEN_TTI_CAPTURED__) {
  global.__OPTIC_SCREEN_TTI_CAPTURED__ = {};
}
if (!global.__OPTIC_SCREEN_TTI_START__) {
  global.__OPTIC_SCREEN_TTI_START__ = {};
}
function useScreenMetrics(screenName) {
  const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);
  const setTTI = useMetricsStore((state) => state.setTTI);
  const screens = useMetricsStore((state) => state.screens);
  const prevScreenRef = (0, import_react3.useRef)(null);
  const mountedRef = (0, import_react3.useRef)(true);
  const handleScreenChange = (0, import_react3.useCallback)(() => {
    const isNewScreen = prevScreenRef.current !== screenName;
    if (isNewScreen) {
      prevScreenRef.current = screenName;
      global.__OPTIC_SCREEN_TTI_CAPTURED__[screenName] = false;
      setCurrentScreen(screenName);
    }
  }, [screenName, setCurrentScreen]);
  (0, import_react3.useEffect)(() => {
    handleScreenChange();
  }, [handleScreenChange]);
  (0, import_react3.useEffect)(() => {
    mountedRef.current = true;
    if (!global.__OPTIC_SCREEN_TTI_CAPTURED__[screenName]) {
      console.log(`[useoptic] Measuring TTI for "${screenName}"`);
      global.__OPTIC_SCREEN_TTI_CAPTURED__[screenName] = true;
      global.__OPTIC_SCREEN_TTI_START__[screenName] = Date.now();
      setTTI(screenName, null);
      requestAnimationFrame(() => {
        if (mountedRef.current) {
          const start = global.__OPTIC_SCREEN_TTI_START__[screenName];
          const tti = Date.now() - start;
          setTTI(screenName, tti);
        }
      });
    } else {
      console.log(`[useoptic] TTI already captured for "${screenName}"`);
    }
    return () => {
      mountedRef.current = false;
      if (prevScreenRef.current !== screenName) {
        if (screens[screenName]) {
          setTTI(screenName, null);
        }
      }
    };
  }, [screenName, setTTI, screens]);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Overlay,
  initOptic,
  useRenderMonitor,
  useScreenMetrics
});
//# sourceMappingURL=index.js.map