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
  // The API base URL comes from VITE_API_URL. There is no dev proxy: a proxy
  // exists only in `vite dev`, so a production build would send requests to
  // the static host and 404.
  server: {
    port: 5173,
  },

  // Cloudflare Pages serves the SPA. public/_redirects sends every
  // client-side route back to index.html, so refreshes and shared links work.
  // Build settings: framework Vite, build command `npm run build`, output `dist`.
});
