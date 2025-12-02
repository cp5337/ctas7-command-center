import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cesium(),
    wasm(),
    topLevelAwait()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 25175,
    host: true,
    strictPort: true,
    proxy: {
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/health/, '/health'),
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/repo': {
        target: 'http://localhost:15180',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/repo/, ''),
      },
      '/api/cannon': {
        target: 'http://localhost:18100',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cannon/, ''),
      },
      '/api/stat': {
        target: 'http://localhost:18108',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stat/, ''),
      },
      '/forge': {
        target: 'http://localhost:18350',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/forge/, ''),
      },
      '/playwright': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/playwright/, ''),
      },
    }
  },
  preview: {
    port: 55175,
    host: true,
    strictPort: true,
  },
});
