import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // No dev proxy: the API base URL comes from VITE_API_URL in the environment.
  // A proxy only exists in `vite dev`, so a production build would send every
  // relative /api request to the static host and 404 — which is what it did.
  server: {
    port: 5173,
  },
});
