import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'icons/*.png',
      ],

      manifest: {
        name: 'San Gabriel App',
        short_name: 'San Gabriel',
        description:
          'Progressive Web App con React, TypeScript y Vite',

        theme_color: '#0f172a',
        background_color: '#0f172a',

        display: 'standalone',
        orientation: 'portrait-primary',

        start_url: '/',
        scope: '/',

        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        globPatterns: [
          '**/*.{js,css,html,svg,png,ico,woff2}',
        ],

        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api'),

            handler: 'NetworkFirst',

            options: {
              cacheName: 'api-cache',

              networkTimeoutSeconds: 8,

              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    host: true,
    port: 5173,
  },
});