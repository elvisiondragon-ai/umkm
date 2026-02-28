import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'umkm-logo.png'],
      manifest: {
        name: 'UMKM eL Vision',
        short_name: 'UMKM',
        description: 'Portal Belanja UMKM Modern',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/umkm-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/umkm-logo.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // ✅ FIX: Only intercept internal app routes, never external URLs
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^https?:\/\//, // Block all absolute external URLs
        ],
        navigateFallbackAllowlist: [
          /^\/(?!api\/).*/, // Only handle internal routes (not /api/)
        ],
        // ✅ FIX: Don't cache or intercept external requests
        runtimeCaching: [
          {
            urlPattern: /^\//, // Only cache paths that start with / (internal)
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400,
              },
            },
          },
        ],
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
