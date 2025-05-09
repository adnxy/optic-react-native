import * as react from 'react';
import react__default from 'react';

interface InitOpticOptions {
    rootComponent?: React.ComponentType<any>;
    reRenders?: boolean;
    network?: boolean;
    tti?: boolean;
    startup?: boolean;
    fps?: boolean;
}
declare const initOptic: (options?: InitOpticOptions) => {
    rootComponent: react.ComponentType<any> | undefined;
    reRenders: boolean;
    network: boolean;
    tti: boolean;
    startup: boolean;
    fps: boolean;
};

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
