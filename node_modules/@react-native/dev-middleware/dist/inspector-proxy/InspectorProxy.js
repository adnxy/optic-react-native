"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = void 0;
var _getBaseUrlFromRequest = _interopRequireDefault(
  require("../utils/getBaseUrlFromRequest")
);
var _Device = _interopRequireDefault(require("./Device"));
var _nullthrows = _interopRequireDefault(require("nullthrows"));
var _timers = require("timers");
var _url = _interopRequireDefault(require("url"));
var _ws = _interopRequireDefault(require("ws"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : { default: e };
}
const debug = require("debug")("Metro:InspectorProxy");
const WS_DEVICE_URL = "/inspector/device";
const WS_DEBUGGER_URL = "/inspector/debug";
const PAGES_LIST_JSON_URL = "/json";
const PAGES_LIST_JSON_URL_2 = "/json/list";
const PAGES_LIST_JSON_VERSION_URL = "/json/version";
const HEARTBEAT_TIMEOUT_MS = 60000;
const HEARTBEAT_INTERVAL_MS = 10000;
const PROXY_IDLE_TIMEOUT_MS = 10000;
const INTERNAL_ERROR_CODE = 1011;
class InspectorProxy {
  #projectRoot;
  #serverBaseUrl;
  #devices;
  #deviceCounter = 0;
  #eventReporter;
  #experiments;
  #customMessageHandler;
  #logger;
  #lastMessageTimestamp = 0;
  constructor(
    projectRoot,
    serverBaseUrl,
    eventReporter,
    experiments,
    logger,
    customMessageHandler
  ) {
    this.#projectRoot = projectRoot;
    this.#serverBaseUrl = new URL(serverBaseUrl);
    this.#devices = new Map();
    this.#eventReporter = eventReporter;
    this.#experiments = experiments;
    this.#logger = logger;
    this.#customMessageHandler = customMessageHandler;
  }
  getPageDescriptions({
    requestorRelativeBaseUrl,
    logNoPagesForConnectedDevice = false,
  }) {
    let result = [];
    Array.from(this.#devices.entries()).forEach(([deviceId, device]) => {
      const devicePages = device
        .getPagesList()
        .map((page) =>
          this.#buildPageDescription(
            deviceId,
            device,
            page,
            requestorRelativeBaseUrl
          )
        );
      if (
        logNoPagesForConnectedDevice &&
        devicePages.length === 0 &&
        device.dangerouslyGetSocket()?.readyState === _ws.default.OPEN
      ) {
        this.#logger?.warn(
          `Waiting for a DevTools connection to app='%s' on device='%s'.
    Try again when it's established. If no connection occurs, try to:
    - Restart the app
    - Ensure a stable connection to the device
    - Ensure that the app is built in a mode that supports debugging`,
          device.getApp(),
          device.getName()
        );
      }
      result = result.concat(devicePages);
    });
    return result;
  }
  processRequest(request, response, next) {
    const pathname = _url.default.parse(request.url).pathname;
    if (
      pathname === PAGES_LIST_JSON_URL ||
      pathname === PAGES_LIST_JSON_URL_2
    ) {
      this.#sendJsonResponse(
        response,
        this.getPageDescriptions({
          requestorRelativeBaseUrl:
            (0, _getBaseUrlFromRequest.default)(request) ?? this.#serverBaseUrl,
          logNoPagesForConnectedDevice: true,
        })
      );
    } else if (pathname === PAGES_LIST_JSON_VERSION_URL) {
      this.#sendJsonResponse(response, {
        Browser: "Mobile JavaScript",
        "Protocol-Version": "1.1",
      });
    } else {
      next();
    }
  }
  createWebSocketListeners() {
    return {
      [WS_DEVICE_URL]: this.#createDeviceConnectionWSServer(),
      [WS_DEBUGGER_URL]: this.#createDebuggerConnectionWSServer(),
    };
  }
  #buildPageDescription(deviceId, device, page, requestorRelativeBaseUrl) {
    const { host, protocol } = requestorRelativeBaseUrl;
    const webSocketScheme = protocol === "https:" ? "wss" : "ws";
    const webSocketUrlWithoutProtocol = `${host}${WS_DEBUGGER_URL}?device=${deviceId}&page=${page.id}`;
    const devtoolsFrontendUrl =
      `devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&${webSocketScheme}=` +
      encodeURIComponent(webSocketUrlWithoutProtocol);
    return {
      id: `${deviceId}-${page.id}`,
      title: page.title,
      description: page.description ?? page.app,
      appId: page.app,
      type: "node",
      devtoolsFrontendUrl,
      webSocketDebuggerUrl: `${webSocketScheme}://${webSocketUrlWithoutProtocol}`,
      ...(page.vm != null
        ? {
            vm: page.vm,
          }
        : null),
      deviceName: device.getName(),
      reactNative: {
        logicalDeviceId: deviceId,
        capabilities: (0, _nullthrows.default)(page.capabilities),
      },
    };
  }
  #sendJsonResponse(response, object) {
    const data = JSON.stringify(object, null, 2);
    response.writeHead(200, {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-cache",
      "Content-Length": Buffer.byteLength(data).toString(),
      Connection: "close",
    });
    response.end(data);
  }
  #isIdle() {
    return (
      new Date().getTime() - this.#lastMessageTimestamp > PROXY_IDLE_TIMEOUT_MS
    );
  }
  #trackLastMessageTimestamp(socket) {
    socket.on("message", (message) => {
      if (message.toString().includes('"event":"getPages"')) {
        return;
      }
      this.#lastMessageTimestamp = new Date().getTime();
    });
  }
  #createDeviceConnectionWSServer() {
    const wss = new _ws.default.Server({
      noServer: true,
      perMessageDeflate: true,
      maxPayload: 0,
    });
    wss.on("connection", async (socket, req) => {
      const fallbackDeviceId = String(this.#deviceCounter++);
      const query = _url.default.parse(req.url || "", true).query || {};
      const deviceId = query.device || fallbackDeviceId;
      const deviceName = query.name || "Unknown";
      const appName = query.app || "Unknown";
      const isProfilingBuild = query.profiling === "true";
      try {
        const deviceRelativeBaseUrl =
          (0, _getBaseUrlFromRequest.default)(req) ?? this.#serverBaseUrl;
        const oldDevice = this.#devices.get(deviceId);
        let newDevice;
        const deviceOptions = {
          id: deviceId,
          name: deviceName,
          app: appName,
          socket,
          projectRoot: this.#projectRoot,
          eventReporter: this.#eventReporter,
          createMessageMiddleware: this.#customMessageHandler,
          deviceRelativeBaseUrl,
          serverRelativeBaseUrl: this.#serverBaseUrl,
          isProfilingBuild,
        };
        if (oldDevice) {
          oldDevice.dangerouslyRecreateDevice(deviceOptions);
          newDevice = oldDevice;
        } else {
          newDevice = new _Device.default(deviceOptions);
        }
        this.#devices.set(deviceId, newDevice);
        this.#logger?.info(
          "Connection established to app='%s' on device='%s'.",
          appName,
          deviceName
        );
        debug(
          "Got new device connection: name='%s', app=%s, device=%s, via=%s",
          deviceName,
          appName,
          deviceId,
          deviceRelativeBaseUrl.origin
        );
        const debuggerSessionIDs = {
          appId: newDevice?.getApp() || null,
          deviceId,
          deviceName: newDevice?.getName() || null,
          pageId: null,
        };
        this.#startHeartbeat({
          socketName: "Device",
          socket,
          intervalMs: HEARTBEAT_INTERVAL_MS,
          debuggerSessionIDs,
          timeoutEventName: "device_timeout",
          heartbeatEventName: "device_heartbeat",
        });
        this.#trackLastMessageTimestamp(socket);
        socket.on("close", (code, reason) => {
          this.#logger?.info(
            "Connection closed to device='%s' for app='%s' with code='%s' and reason='%s'.",
            deviceName,
            appName,
            String(code),
            reason
          );
          this.#eventReporter?.logEvent({
            type: "device_connection_closed",
            code,
            reason,
            isIdle: this.#isIdle(),
            ...debuggerSessionIDs,
          });
          if (this.#devices.get(deviceId)?.dangerouslyGetSocket() === socket) {
            this.#devices.delete(deviceId);
          }
        });
      } catch (error) {
        this.#logger?.error(
          "Connection failed to be established with app='%s' on device='%s' with error:",
          appName,
          deviceName,
          error
        );
        socket.close(INTERNAL_ERROR_CODE, error?.toString() ?? "Unknown error");
      }
    });
    return wss;
  }
  #createDebuggerConnectionWSServer() {
    const wss = new _ws.default.Server({
      noServer: true,
      perMessageDeflate: false,
      maxPayload: 0,
    });
    wss.on("connection", async (socket, req) => {
      const query = _url.default.parse(req.url || "", true).query || {};
      const deviceId = query.device;
      const pageId = query.page;
      const debuggerRelativeBaseUrl =
        (0, _getBaseUrlFromRequest.default)(req) ?? this.#serverBaseUrl;
      const device = deviceId ? this.#devices.get(deviceId) : undefined;
      const debuggerSessionIDs = {
        appId: device?.getApp() || null,
        deviceId,
        deviceName: device?.getName() || null,
        pageId,
      };
      try {
        if (deviceId == null || pageId == null) {
          throw new Error("Incorrect URL - must provide device and page IDs");
        }
        if (device == null) {
          throw new Error("Unknown device with ID " + deviceId);
        }
        this.#logger?.info(
          "Connection established to DevTools for app='%s' on device='%s'.",
          device.getApp() || "unknown",
          device.getName() || "unknown"
        );
        this.#startHeartbeat({
          socketName: "DevTools",
          socket,
          intervalMs: HEARTBEAT_INTERVAL_MS,
          debuggerSessionIDs,
          timeoutEventName: "debugger_timeout",
          heartbeatEventName: "debugger_heartbeat",
        });
        device.handleDebuggerConnection(socket, pageId, {
          debuggerRelativeBaseUrl,
          userAgent: req.headers["user-agent"] ?? query.userAgent ?? null,
        });
        this.#trackLastMessageTimestamp(socket);
        socket.on("close", (code, reason) => {
          this.#logger?.info(
            "Connection closed to DevTools for app='%s' on device='%s' with code='%s' and reason='%s'.",
            device.getApp() || "unknown",
            device.getName() || "unknown",
            String(code),
            reason
          );
          this.#eventReporter?.logEvent({
            type: "debugger_connection_closed",
            code,
            reason,
            isIdle: this.#isIdle(),
            ...debuggerSessionIDs,
          });
        });
      } catch (error) {
        this.#logger?.error(
          "Connection failed to be established with DevTools for app='%s' on device='%s' with error:",
          device?.getApp() || "unknown",
          device?.getName() || "unknown",
          error
        );
        socket.close(INTERNAL_ERROR_CODE, error?.toString() ?? "Unknown error");
        this.#eventReporter?.logEvent({
          type: "connect_debugger_frontend",
          status: "error",
          error,
          ...debuggerSessionIDs,
        });
      }
    });
    return wss;
  }
  #startHeartbeat({
    socketName,
    socket,
    intervalMs,
    debuggerSessionIDs,
    timeoutEventName,
    heartbeatEventName,
  }) {
    let latestPingMs = Date.now();
    let terminateTimeout;
    const pingTimeout = (0, _timers.setTimeout)(() => {
      if (socket.readyState !== _ws.default.OPEN) {
        pingTimeout.refresh();
        return;
      }
      if (!terminateTimeout) {
        terminateTimeout = (0, _timers.setTimeout)(() => {
          if (socket.readyState !== _ws.default.OPEN) {
            terminateTimeout?.refresh();
            return;
          }
          socket.terminate();
          const isIdle = this.#isIdle();
          this.#logger?.error(
            "Connection terminated with %s for app='%s' on device='%s' with idle='%s' after not responding for %s seconds.",
            socketName,
            debuggerSessionIDs.appId ?? "unknown",
            debuggerSessionIDs.deviceName ?? "unknown",
            isIdle ? "true" : "false",
            String(HEARTBEAT_TIMEOUT_MS / 1000)
          );
          this.#eventReporter?.logEvent({
            type: timeoutEventName,
            duration: HEARTBEAT_TIMEOUT_MS,
            isIdle,
            ...debuggerSessionIDs,
          });
        }, HEARTBEAT_TIMEOUT_MS).unref();
      }
      latestPingMs = Date.now();
      socket.ping();
    }, intervalMs).unref();
    socket.on("pong", () => {
      const roundtripDuration = Date.now() - latestPingMs;
      const isIdle = this.#isIdle();
      debug(
        "[heartbeat ping-pong] [%s] %sms for app='%s' on device='%s' with idle='%s'",
        socketName.padStart(7).padEnd(8),
        String(roundtripDuration).padStart(5),
        debuggerSessionIDs.appId,
        debuggerSessionIDs.deviceName,
        isIdle ? "true" : "false"
      );
      this.#eventReporter?.logEvent({
        type: heartbeatEventName,
        duration: roundtripDuration,
        isIdle,
        ...debuggerSessionIDs,
      });
      terminateTimeout?.refresh();
      pingTimeout.refresh();
    });
    socket.on("message", () => {
      terminateTimeout?.refresh();
    });
    socket.on("close", (code, reason) => {
      terminateTimeout && (0, _timers.clearTimeout)(terminateTimeout);
      (0, _timers.clearTimeout)(pingTimeout);
    });
  }
}
exports.default = InspectorProxy;
