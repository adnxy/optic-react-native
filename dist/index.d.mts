import * as react from 'react';
import react__default from 'react';

interface NetworkRequest {
    url: string;
    method: string;
    duration: number;
    status: number;
    [key: string]: any;
}
interface ScreenMetrics {
    tti: number | null;
    reRenderCounts: Record<string, number>;
}
interface MetricsState {
    currentScreen: string | null;
    screens: Record<string, ScreenMetrics>;
    startupTime: number | null;
    fps: number | null;
    networkRequests: NetworkRequest[];
    setCurrentScreen: (screen: string) => void;
    setTTI: (screen: string, tti: number | null) => void;
    setStartupTime: (time: number) => void;
    setFPS: (fps: number) => void;
    addNetworkRequest: (request: NetworkRequest) => void;
    incrementReRender: (componentName: string) => void;
}

interface InitOpticOptions {
    rootComponent?: React.ComponentType<any>;
    reRenders?: boolean;
    network?: boolean;
    tti?: boolean;
    startup?: boolean;
    fps?: boolean;
    enabled?: boolean;
    onMetricsLogged?: (metrics: MetricsState) => void;
}
declare function initOptic(options?: InitOpticOptions): {
    rootComponent: react.ComponentType<any> | undefined;
    reRenders: boolean;
    network: boolean;
    tti: boolean;
    startup: boolean;
    fps: boolean;
    unsubscribe: () => void;
} | {
    rootComponent: react.ComponentType<any> | undefined;
    reRenders: boolean;
    network: boolean;
    tti: boolean;
    startup: boolean;
    fps: boolean;
    unsubscribe?: undefined;
} | undefined;

declare const Overlay: react__default.FC;

/**
 * Hook to monitor and log prop changes for a component.
 * @param componentName Name of the component
 * @param props Component props
 */
declare function useRenderMonitor<T extends Record<string, any>>(componentName: string, props: T): void;

declare global {
    var __OPTIC_SCREEN_TTI_CAPTURED__: Record<string, boolean>;
    var __OPTIC_SCREEN_TTI_START__: Record<string, number>;
}
/**
 * Hook to track screen performance metrics.
 * @param screenName Name of the current screen
 */
declare function useScreenMetrics(screenName: string): void;

export { Overlay, initOptic, useRenderMonitor, useScreenMetrics };
