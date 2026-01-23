import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: false, // We use manual manifest
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}']
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
