import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions, TouchableOpacity, Clipboard } from 'react-native';
import { useMetricsStore } from '../store/metricsStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFPSColor } from '../metrics/fps';
import { getNetworkColor } from '../metrics/network';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const METRICS_THRESHOLDS = {
  TTI: {
    good: 100,
    warning: 300,
  },
  STARTUP: {
    good: 100,
    warning: 300,
  },
};

const getMetricColor = (value: number | null, type: 'TTI' | 'STARTUP') => {
  if (value === null) return '#fff';
  const thresholds = METRICS_THRESHOLDS[type];
  if (value <= thresholds.good) return '#4CAF50'; // Green
  if (value <= thresholds.warning) return '#FFC107'; // Yellow
  return '#F44336'; // Red
};

const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return '#4CAF50'; // Green for success
  if (status >= 400) return '#F44336'; // Red for client/server errors
  return '#FFC107'; // Yellow for other status codes
};

export const Overlay: React.FC = () => {
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  const screens = useMetricsStore((state) => state.screens);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const fps = useMetricsStore((state) => state.fps);
  const networkRequests = useMetricsStore((state) => state.networkRequests);
  const [isMinimized, setIsMinimized] = useState(false);

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
  const latestRequest = networkRequests[networkRequests.length - 1];

  const handleCopyMetrics = () => {
    const metrics = {
      currentScreen,
      fps,
      networkRequest: latestRequest ? {
        url: latestRequest.url,
        duration: Math.round(latestRequest.duration),
        status: latestRequest.status
      } : null,
      tti: currentScreenMetrics?.tti,
      startupTime,
      reRenders: currentScreenMetrics?.reRenderCounts
    };
    
    Clipboard.setString(JSON.stringify(metrics, null, 2));
  };

  // Debug logging for network requests
  React.useEffect(() => {
    if (latestRequest) {
      console.log('[useoptic] Overlay received network request:', {
        url: latestRequest.url,
        duration: Math.round(latestRequest.duration),
        status: latestRequest.status
      });
    }
  }, [latestRequest]);

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
          <View style={styles.headerTop}>
            <Text style={styles.text}>🔍 Performance Metrics</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleCopyMetrics}
              >
                <Text style={styles.iconButtonText}>📋</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => setIsMinimized(!isMinimized)}
              >
                <Text style={styles.iconButtonText}>
                  {isMinimized ? '⬆️' : '⬇️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.screenName}>
            {currentScreen || 'No Screen'}
          </Text>
        </View>
        
        {!isMinimized && (
          <View style={styles.metricsContainer}>
            <View style={styles.performanceSection}>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>FPS</Text>
                <Text 
                  style={[
                    styles.metricValue,
                    { color: getFPSColor(fps) }
                  ]}
                >
                  {fps !== null ? `${fps}` : '...'}
                </Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Network Request</Text>
                <View style={styles.networkInfo}>
                  <Text 
                    style={[
                      styles.metricValue,
                      { color: getNetworkColor(latestRequest?.duration) }
                    ]}
                  >
                    {latestRequest ? `${Math.round(latestRequest.duration)}ms` : '...'}
                  </Text>
                  {latestRequest && (
                    <Text 
                      style={[
                        styles.statusText,
                        { color: getStatusColor(latestRequest.status) }
                      ]}
                    >
                      {latestRequest.status === 0 ? 'Failed' : `Status: ${latestRequest.status}`}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.divider} />

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>TTI</Text>
                <Text 
                  style={[
                    styles.metricValue,
                    { color: getMetricColor(currentScreenMetrics?.tti || null, 'TTI') }
                  ]}
                >
                  {currentScreenMetrics?.tti !== null ? `${currentScreenMetrics?.tti}ms` : '...'}
                </Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Startup Time</Text>
                <Text 
                  style={[
                    styles.metricValue,
                    { color: getMetricColor(startupTime, 'STARTUP') }
                  ]}
                >
                  {startupTime !== null ? `${startupTime}ms` : '...'}
                </Text>
              </View>
            </View>

            {currentScreenMetrics && Object.keys(currentScreenMetrics.reRenderCounts).length > 0 && (
              <View style={styles.reRendersContainer}>
                <View style={styles.divider} />
                <Text style={styles.reRendersTitle}>Re-renders</Text>
                {Object.entries(currentScreenMetrics.reRenderCounts).map(([name, count], index, array) => (
                  <React.Fragment key={name}>
                    <View style={styles.reRenderRow}>
                      <Text style={styles.reRenderName}>{name}</Text>
                      <View style={styles.reRenderCountContainer}>
                        <Text style={styles.reRenderCount}>{count}</Text>
                        <Text style={styles.reRenderCountSuffix}>x</Text>
                      </View>
                    </View>
                    {index < array.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>
        )}
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
    marginBottom: 8,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconButtonText: {
    fontSize: 16,
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
    marginTop: 4,
    fontStyle: 'italic',
  },
  metricsContainer: {
    gap: 8,
  },
  performanceSection: {
    gap: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
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
    gap: 4,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  reRendersTitle: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2,
  },
  reRenderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  reRenderName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  reRenderCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reRenderCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  reRenderCountSuffix: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.7,
    marginLeft: 2,
  },
  networkInfo: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
});
