import React from 'react';
import * as zustand from 'zustand';

interface InitOpticOptions {
    enabled?: boolean;
    onMetricsLogged?: (metrics: any) => void;
    network?: boolean;
    startup?: boolean;
    reRenders?: boolean;
    traces?: boolean;
}
interface OpticConfig {
    enabled: boolean;
    onMetricsLogged?: (metrics: any) => void;
    network: boolean;
    startup: boolean;
    reRenders: boolean;
    traces: boolean;
}
declare function initOptic(options?: InitOpticOptions): OpticConfig | {
    config: OpticConfig;
    unsubscribe: () => void;
} | undefined;

interface OpticProviderProps {
    children: React.ReactNode;
    /**
     * Enable or disable specific metrics
     */
    metrics?: {
        enabled?: boolean;
        startup?: boolean;
        reRenders?: boolean;
        fps?: boolean;
        network?: boolean;
        traces?: boolean;
    };
    /**
     * Show or hide the performance overlay
     */
    showOverlay?: boolean;
}
declare const OpticProvider: React.FC<OpticProviderProps>;

interface NetworkRequest {
    url: string;
    method: string;
    duration: number;
    status: number;
    [key: string]: any;
}
interface Trace {
    interactionName: string;
    componentName: string;
    duration: number;
    timestamp: number;
}
interface MetricsState {
    currentScreen: string | null;
    screens: Record<string, {
        reRenderCounts: Record<string, number>;
        fps: number | null;
    }>;
    networkRequests: NetworkRequest[];
    traces: Trace[];
    startupTime: number | null;
    setCurrentScreen: (screenName: string | null) => void;
    incrementReRender: (componentName: string) => void;
    setStartupTime: (time: number) => void;
    setFPS: (fps: number, screenName: string) => void;
    addNetworkRequest: (request: NetworkRequest) => void;
    setTrace: (trace: Trace) => void;
}
declare const useMetricsStore: zustand.UseBoundStore<zustand.StoreApi<MetricsState>>;

/**
 * Hook to monitor and log prop changes for a component.
 * @param componentName Name of the component
 * @param props Component props
 * @param options Additional options for tracking
 */
declare function useRenderMonitor<T extends Record<string, any>>(componentName: string, props: T, options?: {
    debug?: boolean;
    ignoreProps?: string[];
    trackStack?: boolean;
}): void;

declare const startTrace: (interactionName: string) => void;
declare const endTrace: (interactionName: string, componentName: string) => void;

export { type InitOpticOptions, OpticProvider, endTrace, initOptic, startTrace, useMetricsStore, useRenderMonitor };
