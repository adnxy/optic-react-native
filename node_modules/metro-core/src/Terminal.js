"use strict";

const throttle = require("lodash.throttle");
const readline = require("readline");
const tty = require("tty");
const util = require("util");
const { promisify } = util;
const moveCursor = promisify(readline.moveCursor);
const clearScreenDown = promisify(readline.clearScreenDown);
const streamWrite = promisify((stream, chunk, callback) => {
  return stream.write(chunk, callback);
});
function chunkString(str, size) {
  const ANSI_COLOR = "\x1B\\[([0-9]{1,2}(;[0-9]{1,2})?)?m";
  const SKIP_ANSI = `(?:${ANSI_COLOR})*`;
  return str.match(new RegExp(`(?:${SKIP_ANSI}.){1,${size}}`, "g")) || [];
}
function getTTYStream(stream) {
  if (
    stream instanceof tty.WriteStream &&
    stream.isTTY &&
    stream.columns >= 1
  ) {
    return stream;
  }
  return null;
}
class Terminal {
  constructor(stream, { ttyPrint = true } = {}) {
    this._logLines = [];
    this._nextStatusStr = "";
    this._statusStr = "";
    this._stream = stream;
    this._ttyStream = ttyPrint ? getTTYStream(stream) : null;
    this._updatePromise = null;
    this._isUpdating = false;
    this._isPendingUpdate = false;
    this._shouldFlush = false;
    this._writeStatusThrottled = throttle(
      (status) => this._stream.write(status),
      3500
    );
  }
  _scheduleUpdate() {
    if (this._isUpdating) {
      this._isPendingUpdate = true;
      return;
    }
    this._isUpdating = true;
    this._updatePromise = this._update().then(async () => {
      while (this._isPendingUpdate) {
        if (!this._shouldFlush) {
          await new Promise((resolve) => setTimeout(resolve, 33));
        }
        this._isPendingUpdate = false;
        await this._update();
      }
      this._isUpdating = false;
      this._shouldFlush = false;
    });
  }
  async waitForUpdates() {
    await (this._updatePromise || Promise.resolve());
  }
  async flush() {
    if (this._isUpdating) {
      this._shouldFlush = true;
    }
    await this.waitForUpdates();
    this._writeStatusThrottled.flush();
  }
  async _update() {
    const ttyStream = this._ttyStream;
    const nextStatusStr = this._nextStatusStr;
    const statusStr = this._statusStr;
    const logLines = this._logLines;
    this._statusStr = nextStatusStr;
    this._logLines = [];
    if (statusStr === nextStatusStr && logLines.length === 0) {
      return;
    }
    if (ttyStream && statusStr.length > 0) {
      const statusLinesCount = statusStr.split("\n").length - 1;
      await moveCursor(ttyStream, -ttyStream.columns, -statusLinesCount - 1);
      await clearScreenDown(ttyStream);
    }
    if (logLines.length > 0) {
      await streamWrite(this._stream, logLines.join("\n") + "\n");
    }
    if (ttyStream) {
      if (nextStatusStr.length > 0) {
        await streamWrite(this._stream, nextStatusStr + "\n");
      }
    } else {
      this._writeStatusThrottled(
        nextStatusStr.length > 0 ? nextStatusStr + "\n" : ""
      );
    }
  }
  status(format, ...args) {
    const { _nextStatusStr } = this;
    const statusStr = util.format(format, ...args);
    this._nextStatusStr = this._ttyStream
      ? chunkString(statusStr, this._ttyStream.columns).join("\n")
      : statusStr;
    this._scheduleUpdate();
    return _nextStatusStr;
  }
  log(format, ...args) {
    this._logLines.push(util.format(format, ...args));
    this._scheduleUpdate();
  }
  persistStatus() {
    this.log(this._nextStatusStr);
    this._nextStatusStr = "";
  }
}
module.exports = Terminal;
