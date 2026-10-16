import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: '/react-animated-layouts/',
  resolve: {
    alias: {
      'react-animated-layouts': fileURLToPath(new URL('../src/index.ts', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: { fs: { allow: ['..'] } },
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2020' },
});
