# @useoptic/react-native

A lightweight, zero-configuration performance monitoring tool for React Native applications. Track Time to Interactive (TTI), startup time, component re-renders, and network requests in real-time with a convenient overlay.


![npm version](https://img.shields.io/npm/v/@useoptic/react-native)
![license](https://img.shields.io/npm/l/@useoptic/react-native)
![React Native](https://img.shields.io/badge/React%20Native-%3E%3D0.70.0-blue)

## Features

- 📊 Real-time performance metrics
- 🚀 Time to Interactive (TTI) tracking
- ⏱️ App startup time measurement
- 🔄 Component re-render monitoring
- 🌐 Network request tracking
- 📱 Non-intrusive overlay display
- 🪶 Lightweight with zero dependencies
- 📦 TypeScript support out of the box

## Demo

<img src="https://github.com/user-attachments/assets/ff4fe58f-7511-49a7-b33e-87d41388cac6" width="350" alt="Optic Performance Monitor Screenshot" />

## Installation

```bash
npm install @useoptic/react-native
# or
yarn add @useoptic/react-native
```

## Quick Start

1. Initialize Optic early in your app:

```typescript
import { initOptic } from '@useoptic/react-native';

// In your app's entry point
initOptic({
  reRenders: true,
  network: true,
  tti: true,
  startup: true,
  fps: true
});
```

2. Add the overlay component:

```typescript
import { Overlay } from '@useoptic/react-native';

const App = () => {
  return (
    <>
      <YourAppContent />
      <Overlay />
    </>
  );
};
```

## API Reference

### `initOptic(options?)`

Initialize the performance monitoring system.

```typescript
interface InitOpticOptions {
  rootComponent?: React.ComponentType<any>; // Root component to wrap
  tti?: boolean;      // Enable TTI tracking (default: true)
  startup?: boolean;  // Enable startup time tracking (default: true)
  reRenders?: boolean; // Enable re-render tracking (default: true)
  network?: boolean;  // Enable network request tracking (default: false)
  fps?: boolean;     // Enable FPS tracking (default: true)
}
```

Example:
```typescript
initOptic({ 
  rootComponent: App,
  tti: true, 
  startup: true, 
  reRenders: true,
  network: true,
  fps: true 
});
```

### `Overlay`

A React component that displays performance metrics with the following features:
- Draggable interface
- Minimizable view
- Copy metrics to clipboard
- Color-coded metrics based on performance thresholds
- Network request status and duration tracking

```typescript
import { Overlay } from '@useoptic/react-native';

// Add to your app's root
<Overlay />
```

## Metrics Explained

### Time to Interactive (TTI)
Measures the time until your app becomes interactive. Lower values indicate better initial performance.

### Startup Time
Tracks the duration from app launch to ready state. This helps identify initialization bottlenecks.

### Re-renders
Monitors component re-render frequency and prop changes. Useful for identifying unnecessary re-renders and optimization opportunities.

### Network Requests
Tracks network request performance:
- Request duration
- Status codes
- Success/failure states
- Color-coded based on performance thresholds:
  - Green: ≤ 200ms
  - Yellow: ≤ 500ms
  - Red: > 500ms

### FPS (Frames Per Second)
Monitors app frame rate:
- Real-time FPS display
- Color-coded based on performance:
  - Green: ≥ 60 FPS
  - Yellow: ≥ 30 FPS
  - Red: < 30 FPS

## Troubleshooting

### Overlay Not Visible
- Ensure `Overlay` is mounted at the root level of your app
- Check if any other components might be covering it (z-index issues)
- Verify that `initOptic()` was called before rendering the overlay

### Missing Metrics
- Make sure `initOptic()` is called early in your app's lifecycle
- Check that the feature isn't disabled in the options
- For re-render tracking, verify `useRenderMonitor` is properly implemented

### Network Requests Not Showing
- Ensure `network: true` is set in `initOptic` options
- Check if the fetch API is being intercepted properly
- Verify that requests are being made after initialization

### Performance Impact
The library is designed to be lightweight, but if you notice performance issues:
- Disable features you don't need in `initOptic` options
- Remove `useRenderMonitor` from frequently updating components
- Consider using the library only in development builds

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

Copyright (c) 2024 Optic

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 

## Optic React Native

### Initialization Options

#### `enabled`
- **Type:** `boolean`
- **Default:** `true`
- **Description:** If set to `false`, disables all metrics and hides the overlay. Useful for turning off performance tracking in production or for specific builds.

#### `onMetricsLogged`
- **Type:** `(metrics: any) => void`
- **Description:** Callback function that is called whenever metrics are updated. You can use this to log metrics, send them to an API, or perform custom analytics.

#### Example Usage

```js
import { initOptic } from '@useoptic/react-native';

initOptic({
  enabled: true, // Set to false to disable metrics and overlay
  onMetricsLogged: (metrics) => {
    // Log metrics or send to your API
    fetch('https://your-api.com/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics),
    });
  },
  // ...other options
});
```

---

For more details on all options, see the API documentation section. 

## Testing Re-render Tracking with `useRenderMonitor`

To test and visualize component re-renders in the overlay, use the `useRenderMonitor` hook in your components. This will increment the re-render count for the component in the metrics overlay.

### Example Usage

```tsx
import React from 'react';
import { useRenderMonitor } from '@useoptic/react-native';

export const TestComponent = () => {
  useRenderMonitor('TestComponent');
  const [count, setCount] = React.useState(0);

  return (
    <View>
      <Text>Render count: {count}</Text>
      <Button title="Re-render" onPress={() => setCount(count + 1)} />
    </View>
  );
};
```

- The name you pass to `useRenderMonitor` will appear in the "Re-renders" section of the overlay.
- Each time the component re-renders, the count will increment in real time.

Add this component to your app and interact with it to see re-render tracking in action in the overlay.

--- 
