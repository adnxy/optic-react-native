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
var import_zustand, useMetricsStore;
var init_metricsStore = __esm({
  "src/store/metricsStore.ts"() {
    "use strict";
    import_zustand = require("zustand");
    useMetricsStore = (0, import_zustand.create)((set) => ({
      tti: null,
      startupTime: null,
      reRenderCounts: {},
      setTTI: (tti) => set({ tti }),
      setStartupTime: (startupTime) => set({ startupTime }),
      incrementReRender: (componentName) => set((state) => ({
        reRenderCounts: __spreadProps(__spreadValues({}, state.reRenderCounts), {
          [componentName]: (state.reRenderCounts[componentName] || 0) + 1
        })
      }))
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
  setTimeout(() => {
    const start = global.__OPTIC_APP_START_TIME__ || Date.now();
    const duration = Date.now() - start;
    useMetricsStore.getState().setStartupTime(duration);
    console.log(`[useoptic] Startup time: ${duration}ms`);
  }, 0);
}
var init_startup = __esm({
  "src/metrics/startup.ts"() {
    "use strict";
    init_metricsStore();
    if (global.__OPTIC_APP_START_TIME__ === void 0) {
      global.__OPTIC_APP_START_TIME__ = Date.now();
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
  Overlay: () => Overlay_default,
  useRenderMonitor: () => useRenderMonitor
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
var Overlay = () => {
  const tti = useMetricsStore((state) => state.tti);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const reRenderCounts = useMetricsStore((state) => state.reRenderCounts);
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
  const reRenderList = Object.entries(reRenderCounts).map(([name, count]) => /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.metric, key: name }, name, ": ", count));
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
    /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.text }, "[useoptic] Perf Overlay"),
    /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.metric }, "TTI: ", tti !== null ? `${tti}ms` : "...", " "),
    /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.metric }, "Startup: ", startupTime !== null ? `${startupTime}ms` : "...", " "),
    /* @__PURE__ */ import_react.default.createElement(import_react_native.Text, { style: styles.metric }, "Re-renders:"),
    reRenderList
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
    backgroundColor: "rgba(20, 20, 20, 0.85)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 20,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 4
  },
  metric: {
    color: "#fff",
    fontSize: 12,
    marginBottom: 2
  }
});
var Overlay_default = Overlay;

// src/index.ts
init_reRenders();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  InitOptic,
  Overlay,
  useRenderMonitor
});
//# sourceMappingURL=index.js.map