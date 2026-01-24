import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'offline.html'],
            manifest: false, // We use manual manifest
            devOptions: {
                enabled: true,
                type: 'module',
            }
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'qr-entry': ['./src/flows/qr-entry/index.tsx'],
                    'pwa-home': ['./src/flows/pwa-home/index.tsx'],
                    'vendor': ['react', 'react-dom'],
                    'supabase': ['@supabase/supabase-js']
                }
            }
        }
    }
})
