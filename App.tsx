import React from 'react';
import { View, StyleSheet } from 'react-native';
import { initOptic, Overlay } from './src';
import { RenderTest } from './src/components/RenderTest';
import { OpticProvider } from './src/providers/OpticProvider';

// Initialize Optic with all metrics enabled
initOptic({
  enabled: true,
  metrics: {
    tti: true,
    startup: true,
    reRenders: true,
    fps: true,
    network: true,
  }
});

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