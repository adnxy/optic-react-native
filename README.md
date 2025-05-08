# @useoptic/react-native

A lightweight, zero-configuration performance monitoring tool for React Native applications. Track Time to Interactive (TTI), startup time, and component re-renders in real-time with a convenient overlay.

![npm version](https://img.shields.io/npm/v/@useoptic/react-native)
![license](https://img.shields.io/npm/l/@useoptic/react-native)
![React Native](https://img.shields.io/badge/React%20Native-%3E%3D0.70.0-blue)

## Features

- 📊 Real-time performance metrics
- 🚀 Time to Interactive (TTI) tracking
- ⏱️ App startup time measurement
- 🔄 Component re-render monitoring
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
import { InitOptic } from '@useoptic/react-native';

// In your app's entry point
InitOptic();
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

3. Monitor component re-renders:

```typescript
import { useRenderMonitor } from '@useoptic/react-native';

const MyComponent = (props) => {
  useRenderMonitor('MyComponent', props);
  return <View>...</View>;
};
```

## API Reference

### `InitOptic(options?)`

Initialize the performance monitoring system.

```typescript
interface InitOpticOptions {
  tti?: boolean;      // Enable TTI tracking (default: true)
  startup?: boolean;  // Enable startup time tracking (default: true)
  reRenders?: boolean; // Enable re-render tracking (default: true)
}
```

Example:
```typescript
InitOptic({ tti: true, startup: true, reRenders: false });
```

### `Overlay`

A React component that displays performance metrics.

```typescript
import { Overlay } from '@useoptic/react-native';

// Add to your app's root
<Overlay />
```

### `useRenderMonitor(componentName, props)`

A hook to track component re-renders.

Parameters:
- `componentName`: string - Identifier for the component
- `props`: object - Component props to monitor for changes

```typescript
const MyComponent = (props) => {
  useRenderMonitor('MyComponent', props);
  // ... rest of your component
};
```

## Metrics Explained

### Time to Interactive (TTI)
Measures the time until your app becomes interactive. Lower values indicate better initial performance.

### Startup Time
Tracks the duration from app launch to ready state. This helps identify initialization bottlenecks.

### Re-renders
Monitors component re-render frequency and prop changes. Useful for identifying unnecessary re-renders and optimization opportunities.

## Troubleshooting

### Overlay Not Visible
- Ensure `Overlay` is mounted at the root level of your app
- Check if any other components might be covering it (z-index issues)
- Verify that `InitOptic()` was called before rendering the overlay

### Missing Metrics
- Make sure `InitOptic()` is called early in your app's lifecycle
- Check that the feature isn't disabled in the options
- For re-render tracking, verify `useRenderMonitor` is properly implemented

### Performance Impact
The library is designed to be lightweight, but if you notice performance issues:
- Disable features you don't need in `InitOptic` options
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