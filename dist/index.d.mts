import React from 'react';

type InitOpticOptions = {
    tti?: boolean;
    startup?: boolean;
    reRenders?: boolean;
};
/**
 * Initializes Optic performance logging systems based on options.
 * All features are enabled by default.
 */
declare function InitOptic(options?: InitOpticOptions): Promise<void>;

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

export { InitOptic, Overlay, useRenderMonitor, useScreenMetrics };
