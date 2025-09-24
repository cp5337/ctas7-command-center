import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5174,
    host: true,
    strictPort: true,
  },
  preview: {
    port: 5175,
    host: true,
    strictPort: true,
  },
});
