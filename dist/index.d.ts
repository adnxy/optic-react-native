import React from 'react';
import * as zustand from 'zustand';

interface InitOpticOptions {
    rootComponent?: React.ComponentType<any>;
    reRenders?: boolean;
    network?: boolean;
    tti?: boolean;
    startup?: boolean;
    fps?: boolean;
    enabled?: boolean;
    metrics?: {
        tti?: boolean;
        startup?: boolean;
        reRenders?: boolean;
        fps?: boolean;
        network?: boolean;
    };
    onMetricsLogged?: (metrics: any) => void;
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

declare global {
    var __OPTIC_APP_TTI_START__: Record<string, number>;
}
interface OpticProviderProps {
    children: React.ReactNode;
    /**
     * Enable or disable specific metrics
     */
    metrics?: {
        tti?: boolean;
        startup?: boolean;
        reRenders?: boolean;
        fps?: boolean;
        network?: boolean;
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
interface MetricsState {
    currentScreen: string | null;
    screens: Record<string, {
        reRenderCounts: Record<string, number>;
        tti: number | null;
    }>;
    startupTime: number | null;
    fps: number | null;
    networkRequests: NetworkRequest[];
    setCurrentScreen: (screenName: string | null) => void;
    setTTI: (tti: number | null, screenName: string) => void;
    incrementReRender: (componentName: string) => void;
    setStartupTime: (time: number) => void;
    setFPS: (fps: number) => void;
    addNetworkRequest: (request: NetworkRequest) => void;
}
declare const useMetricsStore: zustand.UseBoundStore<zustand.StoreApi<MetricsState>>;

/**
 * Hook to monitor and log prop changes for a component.
 * @param componentName Name of the component
 * @param props Component props
 */
declare function useRenderMonitor<T extends Record<string, any>>(componentName: string, props: T): void;

export { type InitOpticOptions, OpticProvider, initOptic, useMetricsStore, useRenderMonitor };
