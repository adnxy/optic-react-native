import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { useMetricsStore } from '../store/metricsStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const METRICS_THRESHOLDS = {
  TTI: {
    good: 20,
    warning: 50,
  },
  STARTUP: {
    good: 150,
    warning: 200,
  },
};

const getMetricColor = (value: number | null, type: 'TTI' | 'STARTUP') => {
  if (value === null) return '#fff';
  const thresholds = METRICS_THRESHOLDS[type];
  if (value <= thresholds.good) return '#4CAF50'; // Green
  if (value <= thresholds.warning) return '#FFC107'; // Yellow
  return '#F44336'; // Red
};

export const Overlay: React.FC = () => {
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  const screens = useMetricsStore((state) => state.screens);
  const startupTime = useMetricsStore((state) => state.startupTime);

  const pan = useRef(new Animated.ValueXY()).current;
  const [position, setPosition] = useState({ x: SCREEN_WIDTH - 200, y: 100 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const newX = position.x + gesture.dx;
        const newY = position.y + gesture.dy;

        // Keep within screen bounds
        const boundedX = Math.max(0, Math.min(newX, SCREEN_WIDTH - 180));
        const boundedY = Math.max(0, Math.min(newY, SCREEN_HEIGHT - 200));

        pan.setValue({ x: boundedX - position.x, y: boundedY - position.y });
      },
      onPanResponderRelease: (_, gesture) => {
        const newX = position.x + gesture.dx;
        const newY = position.y + gesture.dy;

        // Keep within screen bounds
        const boundedX = Math.max(0, Math.min(newX, SCREEN_WIDTH - 180));
        const boundedY = Math.max(0, Math.min(newY, SCREEN_HEIGHT - 200));

        setPosition({ x: boundedX, y: boundedY });
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  const currentScreenMetrics = currentScreen ? screens[currentScreen] : null;

  return (
    <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.overlay,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
            ],
            left: position.x,
            top: position.y,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.dragHandle} />
        <View style={styles.header}>
          <Text style={styles.text}>App Performance</Text>
          <Text style={styles.screenName}>
            {currentScreen || 'No Screen'}
          </Text>
        </View>
        
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>TTI:</Text>
            <Text 
              style={[
                styles.metricValue,
                { color: getMetricColor(currentScreenMetrics?.tti || null, 'TTI') }
              ]}
            >
              {currentScreenMetrics?.tti !== null ? `${currentScreenMetrics?.tti}ms` : '...'}
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Startup:</Text>
            <Text 
              style={[
                styles.metricValue,
                { color: getMetricColor(startupTime, 'STARTUP') }
              ]}
            >
              {startupTime !== null ? `${startupTime}ms` : '...'}
            </Text>
          </View>

          {currentScreenMetrics && Object.keys(currentScreenMetrics.reRenderCounts).length > 0 && (
            <View style={styles.reRendersContainer}>
              <Text style={styles.metricLabel}>Re-renders:</Text>
              {Object.entries(currentScreenMetrics.reRenderCounts).map(([name, count]) => (
                <View key={name} style={styles.reRenderRow}>
                  <Text style={styles.reRenderName}>{name}</Text>
                  <Text style={styles.reRenderCount}>{count}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'rgba(33, 33, 33, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 9999,
    elevation: 20,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    marginBottom: 12,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  screenName: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  metricsContainer: {
    gap: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  reRendersContainer: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
  },
  reRenderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  reRenderName: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.7,
  },
  reRenderCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
