import {
  useRenderMonitor
} from "./chunk-5T2SK47N.mjs";
import {
  __spreadValues,
  useMetricsStore
} from "./chunk-RTAHOVXP.mjs";

// src/core/initOptic.ts
async function InitOptic(options = {}) {
  const {
    tti = true,
    startup = true,
    reRenders = true
  } = options;
  if (tti) {
    const { trackTTI } = await import("./tti-ZH5VY4AJ.mjs");
    trackTTI();
    console.log("[Optic] TTI tracking enabled");
  }
  if (startup) {
    const { trackStartupTime } = await import("./startup-34QXCTCJ.mjs");
    trackStartupTime();
    console.log("[Optic] Startup tracking enabled");
  }
  if (reRenders) {
    const { setupRenderTracking } = await import("./reRenders-XK6L5BGD.mjs");
    setupRenderTracking();
    console.log("[Optic] Re-render tracking enabled");
  }
}

// src/overlay/Overlay.tsx
import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
var { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
var Overlay = () => {
  const tti = useMetricsStore((state) => state.tti);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const reRenderCounts = useMetricsStore((state) => state.reRenderCounts);
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
  const reRenderList = Object.entries(reRenderCounts).map(([name, count]) => /* @__PURE__ */ React.createElement(Text, { style: styles.metric, key: name }, name, ": ", count));
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
    /* @__PURE__ */ React.createElement(Text, { style: styles.text }, "[useoptic] Perf Overlay"),
    /* @__PURE__ */ React.createElement(Text, { style: styles.metric }, "TTI: ", tti !== null ? `${tti}ms` : "...", " "),
    /* @__PURE__ */ React.createElement(Text, { style: styles.metric }, "Startup: ", startupTime !== null ? `${startupTime}ms` : "...", " "),
    /* @__PURE__ */ React.createElement(Text, { style: styles.metric }, "Re-renders:"),
    reRenderList
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
export {
  InitOptic,
  Overlay_default as Overlay,
  useRenderMonitor
};
//# sourceMappingURL=index.mjs.map