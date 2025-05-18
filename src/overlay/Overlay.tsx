import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions, TouchableOpacity, Clipboard, Image, Platform, Linking } from 'react-native';
import { useMetricsStore } from '../store/metricsStore';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFPSColor } from '../metrics/fps';
import { getNetworkColor } from '../metrics/network';
import { opticEnabled } from '../store/metricsStore';

const minimizeImageUrl = 'https://img.icons8.com/material-rounded/24/ffffff/minus.png';
const maximizeImageUrl = 'https://img.icons8.com/ios-filled/50/ffffff/full-screen.png';

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

const getMetricColor = (value: number | null | undefined, type: 'TTI' | 'STARTUP') => {
  if (value === null || value === undefined) return '#fff';
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
  console.log('opticEnabled', opticEnabled);
  if (!opticEnabled) return null;

  const insets = useSafeAreaInsets();
  const currentScreen = useMetricsStore((state) => state.currentScreen);
  const screens = useMetricsStore((state) => state.screens);
  const startupTime = useMetricsStore((state) => state.startupTime);
  const fps = useMetricsStore((state) => state.fps);
  const networkRequests = useMetricsStore((state) => state.networkRequests);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isNetworkExpanded, setIsNetworkExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
  const currentTTI = currentScreenMetrics?.tti;
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
      tti: currentTTI,
      startupTime,
      reRenders: currentScreenMetrics?.reRenderCounts
    };
    
    Clipboard.setString(JSON.stringify(metrics, null, 2));
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://useoptic.dev');
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

  const renderCollapsedView = () => (
    <View style={styles.collapsedContainer}>
      <View style={styles.collapsedMetrics}>
        <Text style={styles.collapsedMetric}>
          ⚡ {currentTTI !== null && currentTTI !== undefined ? `${currentTTI.toFixed(1)}ms` : '...'}
        </Text>
        <Text style={styles.collapsedMetric}>
          🚀 {startupTime !== null ? `${startupTime.toFixed(1)}ms` : '...'}
        </Text>
        <Text style={styles.collapsedMetric}>
          🎮 {fps !== null ? `${fps.toFixed(1)}` : '...'}
        </Text>
      </View>
    </View>
  );

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
                  {/* <TouchableOpacity 
                    style={styles.iconButton}
                    onPress={handleCopyMetrics}
                  >
                    <Text style={styles.iconButtonText}>📋</Text>
                  </TouchableOpacity> */}
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
              <View style={styles.metricsContainer}>
                <View style={styles.performanceSection}>
                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>TTI</Text>
                    <Text 
                      style={[
                        styles.metricValue,
                        { color: getMetricColor(currentTTI, 'TTI') }
                      ]}
                    >
                      {currentTTI !== null && currentTTI !== undefined ? `${currentTTI.toFixed(1)}ms` : '...'}
                    </Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>FPS</Text>
                    <Text 
                      style={[
                        styles.metricValue,
                        { color: getFPSColor(fps) }
                      ]}
                    >
                      {fps !== null ? `${fps.toFixed(1)}` : '...'}
                    </Text>
                  </View>
                  <View style={styles.divider} />

                  <View style={styles.metricRow}>
                    <TouchableOpacity 
                      style={styles.networkLabelContainer}
                      onPress={() => setIsNetworkExpanded(!isNetworkExpanded)}
                    >
                      <Text style={styles.metricLabel}>Network Request</Text>
                      <Text style={styles.expandIcon}>{isNetworkExpanded ? '▼' : '▶'}</Text>
                    </TouchableOpacity>
                    <View style={styles.networkInfo}>
                      {latestRequest && (
                        <>
                          <Text 
                            style={[
                              styles.metricValue,
                              { color: getNetworkColor(latestRequest.duration) }
                            ]}
                          >
                            → {Math.round(latestRequest.duration).toFixed(1)}ms
                          </Text>
                          {isNetworkExpanded && (
                            <View style={styles.expandedNetworkInfo}>
                              <View style={styles.statusContainer}>
                                <Text 
                                  style={[
                                    styles.statusCode,
                                    { color: getStatusColor(latestRequest.status) }
                                  ]}
                                >
                                  {latestRequest.status} {latestRequest.status >= 500 ? '🔴' : latestRequest.status >= 400 ? '🟠' : '🟢'}
                                </Text>
                              </View>
                              <View style={styles.urlContainer}>
                                <Text 
                                  style={styles.networkUrl}
                                  numberOfLines={1}
                                  ellipsizeMode="middle"
                                >
                                  {latestRequest.url}
                                </Text>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                    </View>
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
                      {startupTime !== null ? `${startupTime.toFixed(1)}ms` : '...'}
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
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 9999,
    elevation: 20,
    width: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  collapsedOverlay: {
    width: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  collapsedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  collapsedMetric: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
  },
  header: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
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
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  screenNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  screenName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  metricsContainer: {
    gap: 6,
  },
  performanceSection: {
    gap: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  metricLabel: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.8,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  reRendersContainer: {
    gap: 2,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 2,
  },
  reRendersTitle: {
    color: '#fff',
    fontSize: 13,
    opacity: 0.8,
    fontWeight: '600',
    marginBottom: 2,
  },
  reRenderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  reRenderName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  reRenderCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reRenderCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  reRenderCountSuffix: {
    color: '#fff',
    fontSize: 9,
    opacity: 0.7,
    marginLeft: 1,
  },
  networkLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandIcon: {
    color: '#fff',
    fontSize: 9,
    opacity: 0.6,
    marginLeft: 2,
  },
  networkInfo: {
    alignItems: 'flex-end',
    gap: 2,
  },
  expandedNetworkInfo: {
    marginTop: 2,
    width: '100%',
    alignItems: 'flex-start',
    gap: 4,
    paddingHorizontal: 4,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'center',
  },
  statusCode: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
  urlContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  networkUrl: {
    color: '#fff',
    fontSize: 11,
    opacity: 0.8,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    letterSpacing: 0.2,
    width: '100%',
    textAlign: 'left',
    maxWidth: '100%',
    flexShrink: 1,
  },
  poweredByContainer: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: -2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  poweredByText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.7,
    letterSpacing: 0.3,
    textDecorationLine: 'underline',
  },
});
