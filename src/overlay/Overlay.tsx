import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMetricsStore } from '../store/metricsStore';

const Overlay: React.FC = () => {
  const tti = useMetricsStore((state) => state.tti);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const reRenderCounts = useMetricsStore((state) => state.reRenderCounts);

  const reRenderList = Object.entries(reRenderCounts).map(([name, count]: [string, number]) => (
    <Text style={styles.metric} key={name}>
      {name}: {count}
    </Text>
  ));

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Text style={styles.text}>[useoptic] Perf Overlay</Text>
      <Text style={styles.metric}>TTI: {tti !== null ? `${tti}ms` : '...'} </Text>
      <Text style={styles.metric}>Startup: {startupTime !== null ? `${startupTime}ms` : '...'} </Text>
      <Text style={styles.metric}>Re-renders:</Text>
      {reRenderList}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 24,
    right: 16,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 20,
    minWidth: 180,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metric: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
});

export default Overlay;
