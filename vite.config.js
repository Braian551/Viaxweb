import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (
            id.includes('react-router-dom') ||
            id.includes('react-helmet-async') ||
            id.includes('/react/') ||
            id.includes('/react-dom/')
          ) {
            return 'react';
          }

          if (id.includes('/firebase/')) {
            return 'firebase';
          }

          if (id.includes('/mapbox-gl/')) {
            return 'mapbox';
          }

          if (id.includes('/recharts/')) {
            return 'charts';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://viaxcol.online',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  css: {
    preprocessorOptions: {},
  },
});
