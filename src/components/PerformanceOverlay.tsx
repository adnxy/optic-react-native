import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMetricsStore } from '../store/metricsStore';

export function PerformanceOverlay() {
  const { traces, fps, currentScreen } = useMetricsStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Metrics</Text>
      <Text style={styles.metric}>FPS: {fps ? `${fps.toFixed(1)}` : 'N/A'}</Text>
      <Text style={styles.metric}>Screen: {currentScreen || 'N/A'}</Text>
      <Text style={styles.metric}>Traces: {traces.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  metric: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 3,
  },
}); 