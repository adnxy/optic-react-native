/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

type SuccessResult<Props extends {} | void = {}> =
  /**
   * > 13 |   ...Props,
   *      |   ^^^^^^^^ Unsupported feature: Translating "object types with spreads in the middle or at the end" is currently not supported.
   **/
  any;
type ErrorResult<ErrorT = unknown, Props extends {} | void = {}> =
  /**
   * > 20 |   ...Props,
   *      |   ^^^^^^^^ Unsupported feature: Translating "object types with spreads in the middle or at the end" is currently not supported.
   **/
  any;
type CodedErrorResult<ErrorCode extends string> = {
  status: "coded_error";
  errorCode: ErrorCode;
  errorDetails?: string;
};
export type DebuggerSessionIDs = {
  appId: string | null;
  deviceName: string | null;
  deviceId: string | null;
  pageId: string | null;
};
export type ReportableEvent =
  | /**
   * > 40 |       ...
   *      |       ^^^
   * > 41 |         | SuccessResult<{
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^
   * > 42 |             targetDescription: string,
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^
   * > 43 |             prefersFuseboxFrontend: boolean,
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^
   * > 44 |             ...DebuggerSessionIDs,
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^
   * > 45 |           }>
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^
   * > 46 |         | ErrorResult<mixed>
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^
   * > 47 |         | CodedErrorResult<"NO_APPS_FOUND">,
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Unsupported feature: Translating "object types with spreads in the middle or at the end" is currently not supported.
   **/
  any
  | /**
   * > 51 |       ...
   *      |       ^^^
   * > 52 |         | SuccessResult<{
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^
   * > 53 |             ...DebuggerSessionIDs,
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^
   * > 54 |             frontendUserAgent: string | null,
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^
   * > 55 |           }>
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^
   * > 56 |         | ErrorResult<mixed, DebuggerSessionIDs>,
   *      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ Unsupported feature: Translating "object types with spreads in the middle or at the end" is currently not supported.
   **/
  any
  | /**
   * > 66 |       ...DebuggerSessionIDs,
   *      |       ^^^^^^^^^^^^^^^^^^^^^ Unsupported feature: Translating "object types with spreads in the middle or at the end" is currently not supported.
   **/
  any
  | /**
   * > 82 |       ...DebuggerSessionIDs,
   *      |       ^^^^^^^^^^^^^^^^^^^^^ Unsupported feature: Translating "object types with spreads in the middle or at the end" is currently not supported.
   **/
  any
  | { type: "fusebox_console_notice" }
  | /**
   * > 94 |       ...DebuggerSessionIDs,
   *      |       ^^^^^^^^^^^^^^^^^^^^^ Unsupported feature: Translating "object types with spreads in the middle or at the end" is currently not supported.
   **/
  any
  | /**
   * > 100 |       ...DebuggerSessionIDs,
   *       |       ^^^^^^^^^^^^^^^^^^^^^ Unsupported feature: Translating "object types with spreads in the middle or at the end" is currently not supported.
   **/
  any
  | /**
   * > 106 |       ...DebuggerSessionIDs,
   *       |       ^^^^^^^^^^^^^^^^^^^^^ Unsupported feature: Translating "object types with spreads in the middle or at the end" is currently not supported.
   **/
  any
  | /**
   * > 113 |       ...DebuggerSessionIDs,
   *       |       ^^^^^^^^^^^^^^^^^^^^^ Unsupported feature: Translating "object types with spreads in the middle or at the end" is currently not supported.
   **/
  any;
/**
 * A simple interface for logging events, to be implemented by integrators of
 * `dev-middleware`.
 *
 * This is an unstable API with no semver guarantees.
 */
export interface EventReporter {
  logEvent(event: ReportableEvent): void;
}
