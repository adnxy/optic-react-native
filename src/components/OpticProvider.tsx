import React from 'react';
import { View } from 'react-native';
import { useMetricsStore } from '../store/metricsStore';
import { Overlay } from '../overlay/Overlay';

// Define the types we need since we don't want to add @react-navigation/native as a dependency
interface NavigationState {
  routes: Array<{
    name: string;
    [key: string]: any;
  }>;
  index: number;
}

interface NavigationContainerProps {
  onStateChange?: (state: NavigationState | undefined) => void;
  [key: string]: any;
}

interface OpticProviderProps {
  children: React.ReactNode;
}

export function OpticProvider({ children }: OpticProviderProps) {
  const setCurrentScreen = useMetricsStore((state) => state.setCurrentScreen);

  // Function to handle navigation state changes
  const handleNavigationStateChange = (state: NavigationState | undefined) => {
    if (state?.routes && state.routes.length > 0) {
      const currentRoute = state.routes[state.index];
      if (currentRoute?.name) {
        setCurrentScreen(currentRoute.name);
      }
    }
  };

  // Clone children and add onStateChange prop to NavigationContainer
  const childrenWithNavigationTracking = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Check if the child is a NavigationContainer by checking its displayName
      const displayName = (child.type as any)?.displayName || (child.type as any)?.name;
      if (displayName === 'NavigationContainer') {
        return React.cloneElement(child, {
          onStateChange: handleNavigationStateChange,
        } as Partial<NavigationContainerProps>);
      }
    }
    return child;
  });

  return (
    <View style={{ flex: 1 }}>
      {childrenWithNavigationTracking}
      <Overlay />
    </View>
  );
} 