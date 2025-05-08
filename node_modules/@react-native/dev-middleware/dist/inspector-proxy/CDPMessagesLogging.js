"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
var _timers = require("timers");
var _util = _interopRequireDefault(require("util"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const debug = require("debug")("Metro:InspectorProxy");
const debugCDPMessages = require("debug")("Metro:InspectorProxyCDPMessages");
const CDP_MESSAGES_BATCH_DEBUGGING_THROTTLE_MS = 5000;
function getCDPLogPrefix(destination) {
  return _util.default.format(
    "[(Debugger) %s (Proxy) %s (Device)]",
    destination === "DebuggerToProxy"
      ? "->"
      : destination === "ProxyToDebugger"
      ? "<-"
      : "  ",
    destination === "ProxyToDevice"
      ? "->"
      : destination === "DeviceToProxy"
      ? "<-"
      : "  "
  );
}
class CDPMessagesLogging {
  #cdpMessagesLoggingBatchingFn = {
    DebuggerToProxy: () => {},
    ProxyToDebugger: () => {},
    DeviceToProxy: () => {},
    ProxyToDevice: () => {},
  };
  constructor() {
    if (debug.enabled) {
      this.#initializeThrottledCDPMessageLogging();
    }
  }
  #initializeThrottledCDPMessageLogging() {
    const batchingCounters = {
      DebuggerToProxy: 0,
      ProxyToDebugger: 0,
      DeviceToProxy: 0,
      ProxyToDevice: 0,
    };
    Object.keys(batchingCounters).forEach((destination) => {
      let timeout = null;
      this.#cdpMessagesLoggingBatchingFn[destination] = () => {
        if (timeout == null) {
          timeout = (0, _timers.setTimeout)(() => {
            debug(
              "%s %s CDP messages received in the last %ss.",
              getCDPLogPrefix(destination),
              String(batchingCounters[destination]).padStart(5),
              CDP_MESSAGES_BATCH_DEBUGGING_THROTTLE_MS / 1000
            );
            batchingCounters[destination] = 0;
            timeout = null;
          }, CDP_MESSAGES_BATCH_DEBUGGING_THROTTLE_MS).unref();
        }
        batchingCounters[destination]++;
      };
    });
  }
  log(destination, message) {
    if (debugCDPMessages.enabled) {
      debugCDPMessages("%s message: %s", getCDPLogPrefix(destination), message);
    }
    if (debug.enabled) {
      this.#cdpMessagesLoggingBatchingFn[destination]();
    }
  }
}
exports.default = CDPMessagesLogging;
