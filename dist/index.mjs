var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
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

// src/metrics/globalRenderTracking.ts
import * as React from "react";

// src/store/metricsStore.ts
import { create } from "zustand";
var useMetricsStore = create((set, get) => ({
  currentScreen: null,
  screens: {},
  networkRequests: [],
  traces: [],
  startupTime: null,
  setCurrentScreen: (screenName) => {
    set((state) => {
      if (screenName && !state.screens[screenName]) {
        return {
          currentScreen: screenName,
          screens: __spreadProps(__spreadValues({}, state.screens), {
            [screenName]: {
              reRenderCounts: {},
              fps: null
            }
          })
        };
      }
      return { currentScreen: screenName };
    });
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
  setFPS: (fps, screenName) => {
    set((state) => ({
      screens: __spreadProps(__spreadValues({}, state.screens), {
        [screenName]: __spreadProps(__spreadValues({}, state.screens[screenName]), {
          fps
        })
      })
    }));
  },
  addNetworkRequest: (request) => {
    set((state) => ({
      networkRequests: [...state.networkRequests, request].slice(-50)
      // Keep last 50 requests
    }));
  },
  setTrace: (trace) => {
    set((state) => ({
      traces: [...state.traces, trace].slice(-10)
      // Keep last 10 traces
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
        const reRenderInfo = {
          componentName,
          timestamp: Date.now(),
          changedProps: props,
          renderCount: (renderCounts[componentName] || 0) + 1
        };
        incrementReRender(componentName, reRenderInfo);
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
    return;
  }
  const wrappedRoot = wrapWithRenderTracking(rootComponent);
  global.__OPTIC_ROOT_COMPONENT__ = wrappedRoot;
}
function initRenderTracking() {
  global.__OPTIC_RENDER_TRACKING_ENABLED__ = true;
  if (global.__OPTIC_ROOT_COMPONENT__) {
    setupGlobalRenderTracking();
  }
}

// src/metrics/network.ts
var NETWORK_THRESHOLDS = {
  GOOD: 200,
  WARNING: 500,
  CRITICAL: 1e3
};
var originalFetch = null;
var pendingRequests = /* @__PURE__ */ new Map();
var initNetworkTracking = () => {
  if (originalFetch !== null) return;
  try {
    originalFetch = global.fetch;
    global.fetch = async function(input, init) {
      const startTime = Date.now();
      const url = input instanceof Request ? input.url : input.toString();
      const method = input instanceof Request ? input.method : (init == null ? void 0 : init.method) || "GET";
      pendingRequests.set(url, { startTime, url, method });
      try {
        const response = await originalFetch(input, init);
        const responseTime = Date.now();
        const responseDuration = responseTime - startTime;
        const clonedResponse = response.clone();
        const newResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
        const originalJson = newResponse.json;
        const originalText = newResponse.text;
        newResponse.json = async function() {
          try {
            await clonedResponse.json();
            const data = await originalJson.call(this);
            const endTime = Date.now();
            const totalDuration = endTime - startTime;
            const metricsStore = useMetricsStore.getState();
            const currentScreen = metricsStore.currentScreen;
            const networkRequest = {
              url,
              method,
              duration: totalDuration,
              responseDuration,
              status: response.status,
              screen: currentScreen,
              timestamp: endTime,
              startTime,
              endTime
            };
            metricsStore.addNetworkRequest(networkRequest);
            pendingRequests.delete(url);
            return data;
          } catch (error) {
            const endTime = Date.now();
            const totalDuration = endTime - startTime;
            const metricsStore = useMetricsStore.getState();
            const currentScreen = metricsStore.currentScreen;
            const networkRequest = {
              url,
              method,
              duration: totalDuration,
              responseDuration,
              status: response.status,
              screen: currentScreen,
              timestamp: endTime,
              startTime,
              endTime,
              error: error instanceof Error ? error.message : "Unknown error"
            };
            metricsStore.addNetworkRequest(networkRequest);
            pendingRequests.delete(url);
            throw error;
          }
        };
        newResponse.text = async function() {
          try {
            const data = await originalText.call(this);
            const endTime = Date.now();
            const totalDuration = endTime - startTime;
            const metricsStore = useMetricsStore.getState();
            const currentScreen = metricsStore.currentScreen;
            const networkRequest = {
              url,
              method,
              duration: totalDuration,
              responseDuration,
              status: response.status,
              screen: currentScreen,
              timestamp: endTime,
              startTime,
              endTime
            };
            metricsStore.addNetworkRequest(networkRequest);
            pendingRequests.delete(url);
            return data;
          } catch (error) {
            const endTime = Date.now();
            const totalDuration = endTime - startTime;
            const metricsStore = useMetricsStore.getState();
            const currentScreen = metricsStore.currentScreen;
            const networkRequest = {
              url,
              method,
              duration: totalDuration,
              responseDuration,
              status: response.status,
              screen: currentScreen,
              timestamp: endTime,
              startTime,
              endTime,
              error: error instanceof Error ? error.message : "Unknown error"
            };
            metricsStore.addNetworkRequest(networkRequest);
            pendingRequests.delete(url);
            throw error;
          }
        };
        return newResponse;
      } catch (error) {
        const endTime = Date.now();
        const totalDuration = endTime - startTime;
        const metricsStore = useMetricsStore.getState();
        const currentScreen = metricsStore.currentScreen;
        const networkRequest = {
          url,
          method,
          duration: totalDuration,
          status: 0,
          screen: currentScreen,
          timestamp: endTime,
          startTime,
          endTime,
          error: error instanceof Error ? error.message : "Unknown error"
        };
        metricsStore.addNetworkRequest(networkRequest);
        pendingRequests.delete(url);
        throw error;
      }
    };
  } catch (error) {
    if (originalFetch) {
      global.fetch = originalFetch;
      originalFetch = null;
    }
  }
};
var getNetworkColor = (duration) => {
  if (duration === null || duration === void 0) return "#666666";
  if (duration <= NETWORK_THRESHOLDS.GOOD) return "#4CAF50";
  if (duration <= NETWORK_THRESHOLDS.WARNING) return "#FFC107";
  return "#F44336";
};
var getLatestNetworkRequest = () => {
  const metricsStore = useMetricsStore.getState();
  const currentScreen = metricsStore.currentScreen;
  const networkRequests = metricsStore.networkRequests;
  const screenNetworkRequests = networkRequests.filter((req) => req.screen === currentScreen);
  return screenNetworkRequests[screenNetworkRequests.length - 1];
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

// src/core/initOptic.ts
import React2 from "react";
function initOptic(options = {}) {
  const {
    enabled = true,
    onMetricsLogged,
    network = true,
    startup = true,
    reRenders = true,
    traces = true
  } = options;
  const config = {
    enabled,
    onMetricsLogged,
    network,
    startup,
    reRenders,
    traces
  };
  setOpticEnabled(enabled);
  if (!enabled) {
    return;
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
  useMetricsStore.getState();
  if (onMetricsLogged) {
    const unsubscribe = useMetricsStore.subscribe((metrics) => {
      onMetricsLogged(metrics);
    });
    return {
      config,
      unsubscribe
    };
  }
  return config;
}

// src/providers/OpticProvider.tsx
import React4, { useEffect as useEffect2 } from "react";

// src/overlay/Overlay.tsx
import React3, { useRef, useState } from "react";
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions, TouchableOpacity, Clipboard, Image, Platform, Linking, ScrollView } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
var minimizeImageUrl = "https://img.icons8.com/material-rounded/24/ffffff/minus.png";
var maximizeImageUrl = "https://img.icons8.com/ios-filled/50/ffffff/full-screen.png";
var { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
var METRICS_THRESHOLDS = {
  STARTUP: {
    good: 1e3,
    // 1 second
    warning: 2e3
    // 2 seconds
  },
  TRACE: {
    good: 50,
    // 50ms
    warning: 200
    // 200ms
  },
  FPS: {
    good: 55,
    // 55+ FPS is good
    warning: 30
    // 30+ FPS is acceptable
  }
};
var getMetricColor = (metric, value) => {
  const thresholds = METRICS_THRESHOLDS[metric];
  if (metric === "FPS") {
    if (value >= thresholds.good) return "#4CAF50";
    if (value >= thresholds.warning) return "#FFC107";
    return "#F44336";
  }
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
  if (!opticEnabled) return null;
  const insets = useSafeAreaInsets();
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  const screens = useMetricsStore((state) => state.screens);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const networkRequests = useMetricsStore((state) => state.networkRequests);
  const traces = useMetricsStore((state) => state.traces);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isNetworkExpanded, setIsNetworkExpanded] = useState(false);
  const [isTracesExpanded, setIsTracesExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandedTrace, setExpandedTrace] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;
  const [position, setPosition] = useState({
    x: (SCREEN_WIDTH - 300) / 2,
    y: insets.top + 20
  });
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const newX = position.x + gesture.dx;
        const newY = position.y + gesture.dy;
        const boundedX = Math.max(10, Math.min(newX, SCREEN_WIDTH - 290));
        const boundedY = Math.max(insets.top + 10, Math.min(newY, SCREEN_HEIGHT - 200));
        setPosition({ x: boundedX, y: boundedY });
      },
      onPanResponderRelease: () => {
        pan.setValue({ x: 0, y: 0 });
      }
    })
  ).current;
  const currentScreenMetrics = currentScreen ? screens[currentScreen] : null;
  const latestRequest = getLatestNetworkRequest();
  const latestTrace = traces[traces.length - 1];
  const handleCopyMetrics = () => {
    try {
      const metrics = {
        currentScreen: currentScreen || "No Screen",
        startupTime: startupTime ? `${startupTime.toFixed(2)}ms` : "N/A",
        fps: (currentScreenMetrics == null ? void 0 : currentScreenMetrics.fps) ? `${currentScreenMetrics.fps.toFixed(1)} FPS` : "N/A",
        latestNetworkRequest: latestRequest ? {
          url: latestRequest.url,
          duration: `${latestRequest.duration.toFixed(2)}ms`,
          status: latestRequest.status
        } : "N/A",
        latestTrace: latestTrace ? {
          interactionName: latestTrace.interactionName,
          componentName: latestTrace.componentName,
          duration: `${latestTrace.duration.toFixed(2)}ms`
        } : "N/A"
      };
      if (Platform.OS === "ios" || Platform.OS === "android") {
        Clipboard.setString(JSON.stringify(metrics, null, 2));
      }
    } catch (error) {
      console.error("Error copying metrics:", error);
    }
  };
  const handleOpenWebsite = () => {
    Linking.openURL("https://useoptic.dev");
  };
  const renderCollapsedView = () => /* @__PURE__ */ React3.createElement(View, { style: styles.collapsedContainer }, /* @__PURE__ */ React3.createElement(View, { style: styles.collapsedMetrics }, /* @__PURE__ */ React3.createElement(Text, { style: styles.collapsedMetric }, "\u{1F680} ", startupTime !== null ? `${startupTime.toFixed(1)}ms` : "..."), /* @__PURE__ */ React3.createElement(Text, { style: styles.collapsedMetric }, "\u{1F3AE} ", (currentScreenMetrics == null ? void 0 : currentScreenMetrics.fps) !== null && (currentScreenMetrics == null ? void 0 : currentScreenMetrics.fps) !== void 0 ? `${currentScreenMetrics.fps.toFixed(1)}` : "...")));
  if (!currentScreen) return null;
  return /* @__PURE__ */ React3.createElement(SafeAreaView, { style: styles.safeArea, pointerEvents: "box-none" }, /* @__PURE__ */ React3.createElement(
    Animated.View,
    __spreadValues({
      style: [
        styles.overlay,
        isCollapsed ? styles.collapsedOverlay : null,
        {
          left: position.x,
          top: position.y
        }
      ]
    }, panResponder.panHandlers),
    /* @__PURE__ */ React3.createElement(
      TouchableOpacity,
      {
        style: styles.dragHandle,
        onPress: () => setIsCollapsed(!isCollapsed)
      }
    ),
    isCollapsed ? renderCollapsedView() : /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement(View, { style: styles.header }, /* @__PURE__ */ React3.createElement(View, { style: styles.headerTop }, /* @__PURE__ */ React3.createElement(Text, { style: styles.text }, "Performance Metrics"), /* @__PURE__ */ React3.createElement(View, { style: styles.headerButtons }, /* @__PURE__ */ React3.createElement(
      TouchableOpacity,
      {
        style: [styles.iconButton],
        onPress: () => setIsMinimized(!isMinimized)
      },
      /* @__PURE__ */ React3.createElement(
        Image,
        {
          source: { uri: isMinimized ? maximizeImageUrl : minimizeImageUrl },
          style: styles.icon
        }
      )
    ))), /* @__PURE__ */ React3.createElement(View, { style: styles.screenNameContainer }, /* @__PURE__ */ React3.createElement(Text, { style: styles.screenName }, currentScreen || "No Screen"))), !isMinimized && /* @__PURE__ */ React3.createElement(ScrollView, { style: styles.content }, /* @__PURE__ */ React3.createElement(View, { style: styles.section }, /* @__PURE__ */ React3.createElement(Text, { style: styles.sectionTitle }, "Performance Metrics"), startupTime && /* @__PURE__ */ React3.createElement(Text, { style: [styles.metric, { color: getMetricColor("STARTUP", startupTime) }] }, "Startup: ", startupTime.toFixed(2), "ms"), (currentScreenMetrics == null ? void 0 : currentScreenMetrics.fps) && /* @__PURE__ */ React3.createElement(Text, { style: [styles.metric, { color: getMetricColor("FPS", currentScreenMetrics.fps) }] }, "FPS: ", currentScreenMetrics.fps.toFixed(1))), latestRequest && /* @__PURE__ */ React3.createElement(View, { style: styles.section }, /* @__PURE__ */ React3.createElement(
      TouchableOpacity,
      {
        style: styles.sectionHeader,
        onPress: () => setIsNetworkExpanded(!isNetworkExpanded)
      },
      /* @__PURE__ */ React3.createElement(Text, { style: styles.sectionTitle }, "Network Request"),
      /* @__PURE__ */ React3.createElement(Text, { style: styles.expandIcon }, isNetworkExpanded ? "\u25BC" : "\u25B6")
    ), /* @__PURE__ */ React3.createElement(View, { style: styles.networkInfo }, /* @__PURE__ */ React3.createElement(Text, { style: [styles.metric, { color: getNetworkColor(latestRequest.duration) }] }, "\u2192 ", Math.round(latestRequest.duration).toFixed(1), "ms"), isNetworkExpanded && /* @__PURE__ */ React3.createElement(View, { style: styles.expandedNetworkInfo }, /* @__PURE__ */ React3.createElement(View, { style: styles.statusContainer }, /* @__PURE__ */ React3.createElement(Text, { style: [styles.statusCode, { color: getStatusColor(latestRequest.status) }] }, latestRequest.status, " ", latestRequest.status >= 500 ? "\u{1F534}" : latestRequest.status >= 400 ? "\u{1F7E0}" : "\u{1F7E2}")), /* @__PURE__ */ React3.createElement(View, { style: styles.urlContainer }, /* @__PURE__ */ React3.createElement(Text, { style: styles.networkUrl, numberOfLines: 1, ellipsizeMode: "middle" }, latestRequest.url))))), traces.length > 0 && /* @__PURE__ */ React3.createElement(View, { style: styles.section }, /* @__PURE__ */ React3.createElement(
      TouchableOpacity,
      {
        style: styles.sectionHeader,
        onPress: () => setIsTracesExpanded(!isTracesExpanded)
      },
      /* @__PURE__ */ React3.createElement(Text, { style: styles.sectionTitle }, "Recent Traces"),
      /* @__PURE__ */ React3.createElement(Text, { style: styles.expandIcon }, isTracesExpanded ? "\u25BC" : "\u25B6")
    ), isTracesExpanded && traces.slice(-3).reverse().map((trace, idx) => /* @__PURE__ */ React3.createElement(View, { key: idx, style: styles.traceRow }, /* @__PURE__ */ React3.createElement(Text, { style: styles.traceScreen }, trace.interactionName, " \u2192 ", trace.componentName), /* @__PURE__ */ React3.createElement(Text, { style: [styles.traceDuration, { color: getMetricColor("TRACE", trace.duration) }] }, trace.duration.toFixed(1), "ms")))), /* @__PURE__ */ React3.createElement(TouchableOpacity, { style: styles.copyButton, onPress: handleCopyMetrics }, /* @__PURE__ */ React3.createElement(Text, { style: styles.copyButtonText }, "Copy Metrics"))), /* @__PURE__ */ React3.createElement(View, { style: styles.poweredByContainer }, /* @__PURE__ */ React3.createElement(TouchableOpacity, { onPress: handleOpenWebsite }, /* @__PURE__ */ React3.createElement(Text, { style: styles.poweredByText }, "Powered by Optic"))))
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
    backgroundColor: "rgba(18, 18, 23, 0.98)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    zIndex: 9999,
    elevation: 20,
    width: 320,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8
    },
    shadowOpacity: 0.4,
    shadowRadius: 8
  },
  collapsedOverlay: {
    width: "auto",
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  collapsedContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  collapsedMetrics: {
    flexDirection: "row",
    gap: 16
  },
  collapsedMetric: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600"
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 6
  },
  header: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
    paddingBottom: 6
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
    padding: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center"
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: "contain"
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3
  },
  screenNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  screenName: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontStyle: "italic"
  },
  content: {
    marginTop: 6
  },
  section: {
    marginBottom: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 10
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.2
  },
  metric: {
    color: "#fff",
    fontSize: 13,
    marginBottom: 3,
    fontWeight: "500"
  },
  traceDetails: {
    marginTop: 4,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8
  },
  traceText: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 2
  },
  copyButton: {
    backgroundColor: "rgba(33, 150, 243, 0.15)",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(33, 150, 243, 0.3)"
  },
  copyButtonText: {
    color: "#2196F3",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3
  },
  poweredByContainer: {
    alignSelf: "flex-end",
    marginTop: 6,
    marginBottom: -2,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  poweredByText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.8,
    letterSpacing: 0.3,
    textDecorationLine: "underline"
  },
  expandIcon: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },
  networkInfo: {
    marginTop: 4
  },
  expandedNetworkInfo: {
    marginTop: 6,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4
  },
  statusCode: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold"
  },
  urlContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8
  },
  networkUrl: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 2
  },
  traceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 6
  },
  traceScreen: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold"
  },
  traceDuration: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500"
  }
});

// src/providers/OpticProvider.tsx
import { useNavigation, useRoute, useNavigationContainerRef } from "@react-navigation/native";
import { usePathname, useSegments } from "expo-router";

// src/metrics/fps.ts
var FPSManager = class {
  // Update FPS every second
  constructor() {
    this.frameCount = 0;
    this.lastTime = 0;
    this.animationFrameId = null;
    this.updateInterval = 1e3;
    this.updateFPS = () => {
      const currentTime = performance.now();
      const elapsed = currentTime - this.lastTime;
      if (elapsed >= this.updateInterval) {
        const fps = Math.round(this.frameCount * 1e3 / elapsed);
        const metricsStore = useMetricsStore.getState();
        const currentScreen = metricsStore.currentScreen;
        if (currentScreen) {
          metricsStore.setFPS(fps, currentScreen);
        }
        this.frameCount = 0;
        this.lastTime = currentTime;
      }
      this.frameCount++;
      this.animationFrameId = requestAnimationFrame(this.updateFPS);
    };
    this.startTracking = () => {
      if (!this.animationFrameId) {
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.animationFrameId = requestAnimationFrame(this.updateFPS);
      }
    };
    this.stopTracking = () => {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    };
    this.lastTime = performance.now();
  }
};

// src/providers/OpticProvider.tsx
var defaultMetrics = {
  enabled: true,
  startup: true,
  reRenders: true,
  fps: true,
  network: true,
  traces: true
};
var OpticProvider = ({
  children,
  metrics = defaultMetrics,
  showOverlay = true
}) => {
  const { setCurrentScreen } = useMetricsStore();
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  const pathname = usePathname();
  const segments = useSegments();
  const navigationRef = useNavigationContainerRef();
  const fpsManager = React4.useRef(null);
  const navigation = useNavigation();
  const route = useRoute();
  useEffect2(() => {
    if (metrics.reRenders) {
      initRenderTracking();
    }
  }, [metrics.reRenders]);
  useEffect2(() => {
    if (metrics.enabled && metrics.fps) {
      fpsManager.current = new FPSManager();
      fpsManager.current.startTracking();
    }
    return () => {
      if (fpsManager.current) {
        fpsManager.current.stopTracking();
      }
    };
  }, [metrics.enabled, metrics.fps]);
  const getCurrentScreenName = () => {
    if (pathname) {
      return pathname;
    }
    if (navigationRef.current) {
      const currentRoute = navigationRef.current.getCurrentRoute();
      if (currentRoute == null ? void 0 : currentRoute.name) {
        return currentRoute.name;
      }
    }
    return segments[0] || "index";
  };
  useEffect2(() => {
    const screenName = getCurrentScreenName();
    setCurrentScreen(screenName);
  }, [pathname, segments, navigationRef.current]);
  return /* @__PURE__ */ React4.createElement(React4.Fragment, null, children, showOverlay && /* @__PURE__ */ React4.createElement(Overlay, null));
};

// src/metrics/reRenders.ts
import React5, { useEffect as useEffect3, useRef as useRef3 } from "react";
function useRenderMonitor(componentName, props, options = {}) {
  if (!React5) return;
  const { ignoreProps = [], trackStack = false } = options;
  const prevProps = useRef3(null);
  const renderCount = useRef3(0);
  const incrementReRender = useMetricsStore((state) => state.incrementReRender);
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  useEffect3(() => {
    prevProps.current = null;
    renderCount.current = 0;
  }, [currentScreen]);
  useEffect3(() => {
    if (prevProps.current) {
      const changedProps = {};
      for (const key of Object.keys(props)) {
        if (!ignoreProps.includes(key) && prevProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: prevProps.current[key],
            to: props[key]
          };
        }
      }
      if (Object.keys(changedProps).length > 0) {
        renderCount.current++;
        const reRenderInfo = {
          componentName,
          timestamp: Date.now(),
          changedProps,
          renderCount: renderCount.current
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

// src/metrics/trace.ts
var TraceManager = class {
  constructor() {
    this.activeTraces = /* @__PURE__ */ new Map();
    this.traces = [];
    this.MAX_TRACES = 10;
  }
  /**
   * Start tracing an interaction
   * @param interactionName Name of the interaction (e.g., 'OpenModal')
   */
  startTrace(interactionName) {
    if (!__DEV__) return;
    this.activeTraces.set(interactionName, Date.now());
  }
  /**
   * End tracing and record the duration
   * @param interactionName Name of the interaction
   * @param componentName Name of the component that rendered
   */
  endTrace(interactionName, componentName) {
    if (!__DEV__) return;
    const startTime = this.activeTraces.get(interactionName);
    if (!startTime) return;
    const duration = Date.now() - startTime;
    const trace = {
      interactionName,
      componentName,
      duration,
      timestamp: Date.now()
    };
    this.traces.unshift(trace);
    if (this.traces.length > this.MAX_TRACES) {
      this.traces.pop();
    }
    useMetricsStore.getState().setTrace(trace);
    this.activeTraces.delete(interactionName);
  }
  /**
   * Get all traces
   */
  getTraces() {
    return [...this.traces];
  }
  /**
   * Clear all traces
   */
  clearTraces() {
    this.traces = [];
    this.activeTraces.clear();
  }
};
var traceManager = new TraceManager();
var startTrace = traceManager.startTrace.bind(traceManager);
var endTrace = traceManager.endTrace.bind(traceManager);
export {
  OpticProvider,
  endTrace,
  initOptic,
  startTrace,
  useMetricsStore,
  useRenderMonitor
};
//# sourceMappingURL=index.mjs.map