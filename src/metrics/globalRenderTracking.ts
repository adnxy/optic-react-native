import * as React from 'react';
import { useMetricsStore } from '../store/metricsStore';

declare global {
  var __OPTIC_ROOT_COMPONENT__: React.ComponentType<any> | undefined;
  var __OPTIC_RENDER_TRACKING_ENABLED__: boolean;
}

// Store to keep track of component renders
const renderCounts: Record<string, number> = {};

// Create a wrapper component that tracks renders
const withRenderTracking = (WrappedComponent: React.ComponentType<any>) => {
  const RenderTrackingWrapper: React.FC<any> = (props) => {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
    const incrementReRender = useMetricsStore((state) => state.incrementReRender);
    
    React.useEffect(() => {
      if (global.__OPTIC_RENDER_TRACKING_ENABLED__) {
        incrementReRender(componentName);
        renderCounts[componentName] = (renderCounts[componentName] || 0) + 1;
      }
    });

    return React.createElement(WrappedComponent, props);
  };

  return RenderTrackingWrapper;
};

// Function to wrap any component with render tracking
export function wrapWithRenderTracking<T extends React.ComponentType<any>>(
  component: T
): T {
  if (!component) return component;
  
  // Skip if already wrapped
  if ((component as any).__OPTIC_WRAPPED__) return component;
  
  const wrapped = withRenderTracking(component);
  (wrapped as any).__OPTIC_WRAPPED__ = true;
  return wrapped as T;
}

// Function to enable/disable render tracking
export function setRenderTrackingEnabled(enabled: boolean) {
  global.__OPTIC_RENDER_TRACKING_ENABLED__ = enabled;
  console.log(`[useoptic] Render tracking ${enabled ? 'enabled' : 'disabled'}`);
}

// Function to wrap the root component
export function setupGlobalRenderTracking() {
  // Get the root component
  const rootComponent = global.__OPTIC_ROOT_COMPONENT__;
  if (!rootComponent) {
    console.warn('[useoptic] Root component not found. Make sure to set global.__OPTIC_ROOT_COMPONENT__ before calling setupGlobalRenderTracking');
    return;
  }

  // Wrap the root component with render tracking
  const wrappedRoot = wrapWithRenderTracking(rootComponent);
  global.__OPTIC_ROOT_COMPONENT__ = wrappedRoot;
  
  console.log('[useoptic] Global render tracking enabled');
}

// Function to set the root component
export function setRootComponent(component: React.ComponentType<any>) {
  if (!component) return;
  
  console.log('[useoptic] Setting root component:', component.name || 'Unknown');
  global.__OPTIC_ROOT_COMPONENT__ = component;
  
  // If render tracking is enabled, wrap the component
  if (global.__OPTIC_RENDER_TRACKING_ENABLED__) {
    setupGlobalRenderTracking();
  }
}

// Initialize render tracking
export function initRenderTracking() {
  // Set initial state
  global.__OPTIC_RENDER_TRACKING_ENABLED__ = true;
  
  // Wrap the root component if it exists
  if (global.__OPTIC_ROOT_COMPONENT__) {
    setupGlobalRenderTracking();
  }
  
  console.log('[useoptic] Render tracking initialized');
} 