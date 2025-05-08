import {
  useMetricsStore
} from "./chunk-LNPKIR6M.mjs";
import {
  useRenderMonitor
} from "./chunk-6Y6SVZSH.mjs";
import "./chunk-FJBZBVPE.mjs";

// src/core/initOptic.ts
async function InitOptic(options = {}) {
  const {
    tti = true,
    startup = true,
    reRenders = true
  } = options;
  if (tti) {
    await import("./tti-3ZTUN5M7.mjs");
    console.log("[Optic] TTI tracking enabled");
  }
  if (startup) {
    await import("./startup-BRR7TTT4.mjs");
    console.log("[Optic] Startup tracking enabled");
  }
  if (reRenders) {
    await import("./reRenders-S3OCHAUR.mjs");
    console.log("[Optic] Re-render tracking enabled");
  }
}

// src/overlay/Overlay.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
var Overlay = () => {
  const tti = useMetricsStore((state) => state.tti);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const reRenderCounts = useMetricsStore((state) => state.reRenderCounts);
  const reRenderList = Object.entries(reRenderCounts).map(([name, count]) => /* @__PURE__ */ React.createElement(Text, { style: styles.metric, key: name }, name, ": ", count));
  return /* @__PURE__ */ React.createElement(View, { style: styles.overlay, pointerEvents: "none" }, /* @__PURE__ */ React.createElement(Text, { style: styles.text }, "[useoptic] Perf Overlay"), /* @__PURE__ */ React.createElement(Text, { style: styles.metric }, "TTI: ", tti !== null ? `${tti}ms` : "...", " "), /* @__PURE__ */ React.createElement(Text, { style: styles.metric }, "Startup: ", startupTime !== null ? `${startupTime}ms` : "...", " "), /* @__PURE__ */ React.createElement(Text, { style: styles.metric }, "Re-renders:"), reRenderList);
};
var styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 24,
    right: 16,
    backgroundColor: "rgba(20, 20, 20, 0.85)",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 20,
    minWidth: 180
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