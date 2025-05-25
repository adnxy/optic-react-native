import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions, TouchableOpacity, Clipboard, Image, Platform, Linking, ScrollView } from 'react-native';
import { useMetricsStore } from '../store/metricsStore';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFPSColor } from '../metrics/fps';
import { getNetworkColor, getLatestNetworkRequest } from '../metrics/network';
import { opticEnabled } from '../store/metricsStore';

const minimizeImageUrl = 'https://img.icons8.com/material-rounded/24/ffffff/minus.png';
const maximizeImageUrl = 'https://img.icons8.com/ios-filled/50/ffffff/full-screen.png';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const METRICS_THRESHOLDS = {
  STARTUP: {
    good: 1000, // 1 second
    warning: 2000, // 2 seconds
  },
  TRACE: {
    good: 50, // 50ms
    warning: 200, // 200ms
  },
  FPS: {
    good: 55, // 55+ FPS is good
    warning: 30, // 30+ FPS is acceptable
  },
};

const getMetricColor = (metric: 'STARTUP' | 'TRACE' | 'FPS', value: number) => {
  const thresholds = METRICS_THRESHOLDS[metric];
  if (metric === 'FPS') {
    if (value >= thresholds.good) return '#4CAF50';
    if (value >= thresholds.warning) return '#FFC107';
    return '#F44336';
  }
  if (value <= thresholds.good) return '#4CAF50';
  if (value <= thresholds.warning) return '#FFC107';
  return '#F44336';
};

const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return '#4CAF50'; // Green for success
  if (status >= 400) return '#F44336'; // Red for client/server errors
  return '#FFC107'; // Yellow for other status codes
};

export const Overlay: React.FC = () => {
  if (!opticEnabled) return null;

  const insets = useSafeAreaInsets();
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  const screens = useMetricsStore((state) => state.screens);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const networkRequests = useMetricsStore((state) => state.networkRequests);
  const traces = useMetricsStore((state) => state.traces);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isNetworkExpanded, setIsNetworkExpanded] = useState(false);
  const [isTracesExpanded, setIsTracesExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandedTrace, setExpandedTrace] = useState(false);

  const pan = useRef(new Animated.ValueXY()).current;
  const [position, setPosition] = useState({ 
    x: (SCREEN_WIDTH - 300) / 2,
    y: insets.top + 20
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const newX = position.x + gesture.dx;
        const newY = position.y + gesture.dy;

        // Keep within screen bounds with padding
        const boundedX = Math.max(10, Math.min(newX, SCREEN_WIDTH - 290));
        const boundedY = Math.max(insets.top + 10, Math.min(newY, SCREEN_HEIGHT - 200));

        // Update position directly without animation
        setPosition({ x: boundedX, y: boundedY });
      },
      onPanResponderRelease: () => {
        // Reset the pan value without animation
        pan.setValue({ x: 0, y: 0 });
      },
    })
  ).current;

  const currentScreenMetrics = currentScreen ? screens[currentScreen] : null;
  const latestRequest = getLatestNetworkRequest();
  const latestTrace = traces[traces.length - 1];

  const handleCopyMetrics = () => {
    try {
      const metrics = {
        currentScreen: currentScreen || 'No Screen',
        startupTime: startupTime ? `${startupTime.toFixed(2)}ms` : 'N/A',
        fps: currentScreenMetrics?.fps ? `${currentScreenMetrics.fps.toFixed(1)} FPS` : 'N/A',
        latestNetworkRequest: latestRequest ? {
          url: latestRequest.url,
          duration: `${latestRequest.duration.toFixed(2)}ms`,
          status: latestRequest.status
        } : 'N/A',
        latestTrace: latestTrace ? {
          interactionName: latestTrace.interactionName,
          componentName: latestTrace.componentName,
          duration: `${latestTrace.duration.toFixed(2)}ms`,
        } : 'N/A',
      };
      
      // Use Clipboard API instead of console.log
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Clipboard.setString(JSON.stringify(metrics, null, 2));
      }
    } catch (error) {
      console.error('Error copying metrics:', error);
    }
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://useoptic.dev');
  };

  const renderCollapsedView = () => (
    <View style={styles.collapsedContainer}>
      <View style={styles.collapsedMetrics}>
        <Text style={styles.collapsedMetric}>
          🚀 {startupTime !== null ? `${startupTime.toFixed(1)}ms` : '...'}
        </Text>
        <Text style={styles.collapsedMetric}>
          🎮 {currentScreenMetrics?.fps !== null && currentScreenMetrics?.fps !== undefined ? `${currentScreenMetrics.fps.toFixed(1)}` : '...'}
        </Text>
      </View>
    </View>
  );

  if (!currentScreen) return null;

  return (
    <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.overlay,
          isCollapsed ? styles.collapsedOverlay : null,
          {
            left: position.x,
            top: position.y,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.dragHandle} 
          onPress={() => setIsCollapsed(!isCollapsed)}
        />
        
        {isCollapsed ? (
          renderCollapsedView()
        ) : (
          <>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <Text style={styles.text}>Performance Metrics</Text>
                <View style={styles.headerButtons}>
                  <TouchableOpacity
                    style={[styles.iconButton]}
                    onPress={() => setIsMinimized(!isMinimized)}
                  >
                    <Image
                      source={{ uri: isMinimized ? maximizeImageUrl : minimizeImageUrl }}
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.screenNameContainer}>
                <Text style={styles.screenName}>
                  {currentScreen || 'No Screen'}
                </Text>
              </View>
            </View>
            
            {!isMinimized && (
              <ScrollView style={styles.content}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Performance Metrics</Text>
                  {startupTime && (
                    <Text style={[styles.metric, { color: getMetricColor('STARTUP', startupTime) }]}>Startup: {startupTime.toFixed(2)}ms</Text>
                  )}
                  {currentScreenMetrics?.fps && (
                    <Text style={[styles.metric, { color: getMetricColor('FPS', currentScreenMetrics.fps) }]}>FPS: {currentScreenMetrics.fps.toFixed(1)}</Text>
                  )}
                </View>

                {latestRequest && (
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() => setIsNetworkExpanded(!isNetworkExpanded)}
                    >
                      <Text style={styles.sectionTitle}>Network Request</Text>
                      <Text style={styles.expandIcon}>{isNetworkExpanded ? '▼' : '▶'}</Text>
                    </TouchableOpacity>
                    <View style={styles.networkInfo}>
                      <Text style={[styles.metric, { color: getNetworkColor(latestRequest.duration) }]}>→ {Math.round(latestRequest.duration).toFixed(1)}ms</Text>
                      {isNetworkExpanded && (
                        <View style={styles.expandedNetworkInfo}>
                          <View style={styles.statusContainer}>
                            <Text style={[styles.statusCode, { color: getStatusColor(latestRequest.status) }]}>
                              {latestRequest.status} {latestRequest.status >= 500 ? '🔴' : latestRequest.status >= 400 ? '🟠' : '🟢'}
                            </Text>
                          </View>
                          <View style={styles.urlContainer}>
                            <Text style={styles.networkUrl} numberOfLines={1} ellipsizeMode="middle">{latestRequest.url}</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {traces.length > 0 && (
                  <View style={styles.section}>
                    <TouchableOpacity
                      style={styles.sectionHeader}
                      onPress={() => setIsTracesExpanded(!isTracesExpanded)}
                    >
                      <Text style={styles.sectionTitle}>Recent Traces</Text>
                      <Text style={styles.expandIcon}>{isTracesExpanded ? '▼' : '▶'}</Text>
                    </TouchableOpacity>
                    {isTracesExpanded && traces.slice(-3).reverse().map((trace, idx) => (
                      <View key={idx} style={styles.traceRow}>
                        <Text style={styles.traceScreen}>{trace.interactionName} → {trace.componentName}</Text>
                        <Text style={[styles.traceDuration, { color: getMetricColor('TRACE', trace.duration) }]}>{trace.duration.toFixed(1)}ms</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity style={styles.copyButton} onPress={handleCopyMetrics}>
                  <Text style={styles.copyButtonText}>Copy Metrics</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
            <View style={styles.poweredByContainer}>
              <TouchableOpacity onPress={handleOpenWebsite}>
                <Text style={styles.poweredByText}>Powered by Optic</Text>
              </TouchableOpacity>
            </View>
          </>
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
    backgroundColor: 'rgba(18, 18, 23, 0.98)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    zIndex: 9999,
    elevation: 20,
    width: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  collapsedOverlay: {
    width: 'auto',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  collapsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  collapsedMetric: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 6,
  },
  header: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    paddingBottom: 6,
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
    padding: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  screenNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  screenName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  content: {
    marginTop: 6,
  },
  section: {
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  metric: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 3,
    fontWeight: '500',
  },
  traceDetails: {
    marginTop: 4,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
  },
  traceText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
  copyButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.3)',
  },
  copyButtonText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  poweredByContainer: {
    alignSelf: 'flex-end',
    marginTop: 6,
    marginBottom: -2,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  poweredByText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.8,
    letterSpacing: 0.3,
    textDecorationLine: 'underline',
  },
  expandIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  networkInfo: {
    marginTop: 4,
  },
  expandedNetworkInfo: {
    marginTop: 6,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusCode: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  networkUrl: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
  traceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 6,
  },
  traceScreen: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  traceDuration: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});
