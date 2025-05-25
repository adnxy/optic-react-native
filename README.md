# optic-react-native

A lightweight performance monitoring tool for React Native applications. Track startup time, network requests, FPS, and custom traces in real-time.

![npm version](https://www.npmjs.com/package/optic-react-native)

## Features

- App startup time measurement
- Network request tracking
- Custom interaction tracing
- Draggable overlay display
- Send metrics to custom API

## Demo

<img src="https://github.com/user-attachments/assets/d7cc525f-5621-4107-9cce-ef3f8a0dac0f" width="350" alt="Optic Performance Monitor Screenshot" />

## Installation

```bash
npm install @useoptic/react-native
# or
yarn add @useoptic/react-native
```

## Quick Start

1. Initialize Optic in your app's entry point:

```typescript
import { initOptic } from '@useoptic/react-native';

initOptic();
```

2. Add the overlay component to your app:

```typescript
import { OpticProvider } from '@useoptic/react-native';

const App = () => (
  <>  
    <OpticProvider>
    <YourAppContent />
    <OpticProvider />
  </>
);
```

## Custom Metrics

### Tracking Custom Interactions

Use the tracing API to measure specific interactions in your app:

```typescript
import { startTrace, endTrace } from '@useoptic/react-native';

const handleButtonPress = async () => {
  startTrace('ButtonPress');
  
  try {
    await someAsyncOperation();
  } finally {
    endTrace('ButtonPress', 'ButtonComponent');
  }
};
```

### Tracking Re-renders

Monitor component re-renders using the `useRenderMonitor` hook:

```typescript
import { useRenderMonitor } from '@useoptic/react-native';

const MyComponent = () => {
  useRenderMonitor('MyComponent');
  // ... your component code
};
```

## Configuration

```typescript
interface InitOpticOptions {
  enabled?: boolean;     // Enable/disable all metrics (default: true)
  startup?: boolean;     // Track startup time (default: true)
  network?: boolean;     // Track network requests (default: true)
  reRenders?: boolean;   // Track component re-renders (default: true)
  traces?: boolean;      // Enable custom tracing (default: true)
  onMetricsLogged?: (metrics: any) => void; // Callback for metrics updates
}
```

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

1. Clone the repository
2. Install dependencies: `yarn install`
3. Run tests: `yarn test`
4. Build the package: `yarn build`

### Code Style

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

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
