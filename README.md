# @useoptic/react-native

A lightweight performance monitoring tool for React Native applications. Track TTI, startup time, component re-renders, network requests, FPS, and memory usage in real-time.


![npm version](https://img.shields.io/npm/v/@useoptic/react-native)
![license](https://img.shields.io/npm/l/@useoptic/react-native)
![React Native](https://img.shields.io/badge/React%20Native-%3E%3D0.70.0-blue)

## Features

- 📊 Real-time performance metrics
- 🚀 Time to Interactive (TTI) tracking
- ⏱️ App startup time measurement
- 🔄 Component re-render monitoring
- 🌐 Network request tracking
- 📈 FPS monitoring
- 💾 Memory usage tracking
- 📱 Draggable overlay display

## Demo

<img src="https://github.com/user-attachments/assets/ff4fe58f-7511-49a7-b33e-87d41388cac6" width="350" alt="Optic Performance Monitor Screenshot" />

## Installation

```bash
npm install @useoptic/react-native
# or
yarn add @useoptic/react-native
```

## Usage

1. Initialize Optic in your app's entry point:

```typescript
import { initOptic } from '@useoptic/react-native';

initOptic()
```

2. Add the overlay component:

```typescript
import { Overlay } from '@useoptic/react-native';

const App = () => (
  <>
    <YourAppContent />
    <Overlay />
  </>
);
```

## API

### `initOptic(options?)`

```typescript
interface InitOpticOptions {
  enabled?: boolean;     // Enable/disable all metrics (default: true)
  tti?: boolean;         // Track TTI (default: true)
  startup?: boolean;     // Track startup time (default: true)
  reRenders?: boolean;   // Track re-renders (default: true)
  network?: boolean;     // Track network requests (default: false)
  fps?: boolean;         // Track FPS (default: true)
  memory?: boolean;      // Track memory usage (default: true)
  onMetricsLogged?: (metrics: any) => void; // Callback for metrics updates
}
```

### `Overlay`

A draggable overlay component that displays:
- TTI and startup time
- Component re-render counts
- Network request status and duration
- FPS with color coding
- Memory usage
- Minimizable view
- Copy metrics to clipboard

## Metrics Thresholds

### Network Requests
- 🟢 ≤ 200ms
- 🟡 ≤ 500ms
- 🔴 > 500ms

### FPS
- 🟢 ≥ 60 FPS
- 🟡 ≥ 30 FPS
- 🔴 < 30 FPS

### Memory Usage
- 🟢 ≤ 60%
- 🟡 ≤ 80%
- 🔴 > 80%

## Troubleshooting

- **Overlay not visible**: Ensure it's mounted at root level and `initOptic()` was called
- **Missing metrics**: Verify features are enabled in `initOptic` options
- **Network tracking**: Enable `network: true` in options
- **Performance impact**: Disable unused features in development

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT © Optic

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
  useRenderMonitor('Home');
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
