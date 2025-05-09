import React from 'react';
import { View, StyleSheet } from 'react-native';
import { initOptic, Overlay } from './src';
import { RenderTest } from './src/components/RenderTest';

// Initialize Optic with all metrics enabled
initOptic({
  rootComponent: App,
  tti: true,
  startup: true,
  reRenders: true,
  fps: true,
});

export default function App() {
  return (
    <View style={styles.container}>
      <RenderTest />
      <Overlay />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 