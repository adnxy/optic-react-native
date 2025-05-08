import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { useMetricsStore } from '../store/metricsStore';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Overlay: React.FC = () => {
  const tti = useMetricsStore((state) => state.tti);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const reRenderCounts = useMetricsStore((state) => state.reRenderCounts);

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

  const reRenderList = Object.entries(reRenderCounts).map(([name, count]: [string, number]) => (
    <Text style={styles.metric} key={name}>
      {name}: {count}
    </Text>
  ));

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
        <Text style={styles.text}>[useoptic] Perf Overlay</Text>
        <Text style={styles.metric}>TTI: {tti !== null ? `${tti}ms` : '...'} </Text>
        <Text style={styles.metric}>Startup: {startupTime !== null ? `${startupTime}ms` : '...'} </Text>
        <Text style={styles.metric}>Re-renders:</Text>
        {reRenderList}
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
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    zIndex: 9999,
    elevation: 20,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
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
