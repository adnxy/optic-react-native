import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  format: ['esm', 'cjs'],
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  external: ['react', 'react-native'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});