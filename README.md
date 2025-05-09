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

## Testing Re-renders

### 1. Using the RenderTest Component

```typescript
import { RenderTest } from '@useoptic/react-native';

const YourScreen = () => {
  return (
    <View>
      <YourContent />
      <RenderTest />
    </View>
  );
};
```

The RenderTest component provides:
- State update testing
- Network request testing
- Child component re-render testing

### 2. Testing Network Requests

```typescript
// Example network request test
const testNetworkRequest = async () => {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};
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