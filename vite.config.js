import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Expose env vars to the client bundle
    // Set VITE_API_URL in .env.local. For production, default to same-origin HTTPS proxy.
    __API_URL__: JSON.stringify(process.env.VITE_API_URL ?? '/api'),
  },
  server: {
    port: 5173,
  },
  css: {
    preprocessorOptions: {},
  },
});
