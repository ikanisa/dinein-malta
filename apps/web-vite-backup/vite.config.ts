import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true,
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
    plugins: [
      // SWC is 2-3x faster than Babel for React transforms
      react(),
      // Vite PWA Plugin with Workbox
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'DineIn Malta',
          short_name: 'DineIn',
          description: 'The premium dining experience. Order, pay, and enjoy with DineIn.',
          theme_color: '#0E1120',
          background_color: '#0E1120',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          categories: ['food', 'lifestyle', 'shopping'],
          icons: [
            {
              src: '/icons/icon-57.png',
              sizes: '57x57',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-76.png',
              sizes: '76x76',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-120.png',
              sizes: '120x120',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-152.png',
              sizes: '152x152',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-167.png',
              sizes: '167x167',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-192-maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          shortcuts: [
            {
              name: "View Menu",
              short_name: "Menu",
              description: "Browse the menu",
              url: "/",
              icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
            },
            {
              name: "Scan QR",
              short_name: "Scan",
              description: "Scan to order",
              url: "/scan",
              icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,avif,woff,woff2}'],
          navigateFallback: '/offline.html',
          navigateFallbackAllowlist: [/^(?!\/__).*/],
          runtimeCaching: [
            // Menu data: Cache-first strategy (1 hour)
            {
              urlPattern: ({ url }) => {
                return url.pathname.includes('/rest/v1/vendors') ||
                  url.pathname.includes('/rest/v1/menu_items') ||
                  (url.pathname.includes('/rest/v1/') && url.searchParams.has('vendor_id'));
              },
              handler: 'CacheFirst',
              options: {
                cacheName: 'menu-data-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 // 1 hour
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Orders: Network-first strategy
            {
              urlPattern: ({ url }) => {
                return url.pathname.includes('/rest/v1/orders') ||
                  url.pathname.includes('/functions/order');
              },
              handler: 'NetworkFirst',
              options: {
                cacheName: 'orders-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 5 // 5 minutes
                },
                networkTimeoutSeconds: 5,
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Other Supabase API: Network-first
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60
                },
                networkTimeoutSeconds: 5
              }
            },
            // Static assets: Cache-first
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|woff|woff2|ttf|eot)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'static-assets-cache',
                expiration: {
                  maxEntries: 500,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            },
            // JS/CSS: StaleWhileRevalidate
            {
              urlPattern: /\.(?:js|css)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'js-css-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7
                }
              }
            }
          ],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true
        },
        devOptions: {
          enabled: false
        }
      }),
      // Brotli compression (best compression ratio)
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
      }),
      // Gzip compression (fallback for older browsers)
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
      }),
      // Bundle visualizer (only in production build)
      visualizer({
        open: false,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    define: {
      // Only define env vars if they have actual values to prevent "undefined" string injection
      ...(env.VITE_GA_MEASUREMENT_ID && { 'process.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(env.VITE_GA_MEASUREMENT_ID) }),
      ...(env.VITE_SUPABASE_URL && { 'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL) }),
      ...(env.VITE_SUPABASE_ANON_KEY && { 'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY) }),
      ...(env.VITE_SENTRY_DSN && { 'process.env.VITE_SENTRY_DSN': JSON.stringify(env.VITE_SENTRY_DSN) }),
      ...(env.VITE_SENTRY_TRACES_SAMPLE_RATE && { 'process.env.VITE_SENTRY_TRACES_SAMPLE_RATE': JSON.stringify(env.VITE_SENTRY_TRACES_SAMPLE_RATE) }),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? ['console.log', 'console.info'] : [],
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-lazy-load-image-component') || id.includes('react-window')) {
                return 'react-vendor';
              }
              if (id.includes('react-router-dom') || id.includes('@remix-run')) {
                return 'router-vendor';
              }
              if (id.includes('@supabase')) {
                return 'supabase-vendor';
              }
              if (id.includes('framer-motion')) {
                return 'animation-vendor';
              }
              if (id.includes('web-vitals') || id.includes('@sentry')) {
                return 'monitoring-vendor';
              }
              // Other vendor code stays in default chunk
              return undefined;
            }

            // Application chunks - Let Vite handle this automatically to avoid circular dependencies
            // The previous manual configuration caused circular chunks between contexts, services, and pages
            return undefined;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            if (/\.(png|jpe?g|svg|gif|webp|avif|ico)$/.test(name)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(name)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[ext]/[name]-[hash][extname]';
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      copyPublicDir: true,
    },
    publicDir: 'public',
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
      exclude: ['@capacitor/core'],
    },
  };
});
