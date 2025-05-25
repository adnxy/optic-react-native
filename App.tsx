import React from 'react';
import { View, StyleSheet } from 'react-native';
import { initOptic } from './src';
import { Overlay } from './src/overlay/Overlay';
import { RenderTest } from './src/components/RenderTest';
import { OpticProvider } from './src/providers/OpticProvider';
import { initRenderTracking } from './src/metrics/globalRenderTracking';

// Initialize Optic with all metrics enabled
initOptic({
  enabled: true,
  network: true,
  startup: true,
  reRenders: true,
  traces: true
});

// Initialize re-render tracking
initRenderTracking();

export default function App() {
  return (
    <OpticProvider>
      <View style={styles.container}>
        <RenderTest />
        <Overlay />
      </View>
    </OpticProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 