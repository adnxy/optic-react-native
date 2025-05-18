import React from 'react';

interface MetricsState {
    currentScreen: string | null;
    screens: Record<string, {
        tti: number | null;
        reRenderCounts: Record<string, number>;
    }>;
    startupTime: number | null;
    fps: number | null;
    networkRequests: Array<{
        url: string;
        method: string;
        duration: number;
        status: number;
    }>;
    setCurrentScreen: (screenName: string | null) => void;
    setTTI: (screenName: string, tti: number | null) => void;
    incrementReRender: (componentName: string) => void;
    setStartupTime: (time: number) => void;
    setFPS: (fps: number) => void;
    addNetworkRequest: (request: {
        url: string;
        method: string;
        duration: number;
        status: number;
    }) => void;
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
    rootComponent: React.ComponentType<any> | undefined;
    reRenders: boolean;
    network: boolean;
    tti: boolean;
    startup: boolean;
    fps: boolean;
    unsubscribe: () => void;
} | {
    rootComponent: React.ComponentType<any> | undefined;
    reRenders: boolean;
    network: boolean;
    tti: boolean;
    startup: boolean;
    fps: boolean;
    unsubscribe?: undefined;
} | undefined;

declare const Overlay: React.FC;

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
