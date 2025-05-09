import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

// Child component that will re-render when parent state changes
const ChildComponent = React.memo(({ count }: { count: number }) => {
  console.log('ChildComponent rendered');
  return (
    <View style={styles.childContainer}>
      <Text style={styles.text}>Child Count: {count}</Text>
    </View>
  );
});

// Component that will re-render on prop changes
const PropChangeComponent = React.memo(({ value }: { value: string }) => {
  console.log('PropChangeComponent rendered');
  return (
    <View style={styles.childContainer}>
      <Text style={styles.text}>Prop Value: {value}</Text>
    </View>
  );
});

export const RenderTest: React.FC = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleStateUpdate = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const testNetworkRequest = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
      const data = await response.json();
      console.log('[useoptic] Test network request completed:', data);
    } catch (error) {
      console.error('[useoptic] Test network request failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  console.log('RenderTest rendered');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Render Test Component</Text>
      
      <View style={styles.section}>
        <Text style={styles.title}>State Updates</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleStateUpdate}
        >
          <Text style={styles.buttonText}>Update State</Text>
        </TouchableOpacity>
        <Text style={styles.text}>Count: {count}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Network Test</Text>
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testNetworkRequest}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Loading...' : 'Test Network Request'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Child Component Re-renders</Text>
        <ChildComponent count={count} />
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setCount(c => c + 1)}
        >
          <Text style={styles.buttonText}>Update Child</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  childContainer: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 6,
    marginVertical: 8,
  },
}); 