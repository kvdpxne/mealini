// vite.config.ts
import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Mealini',
        short_name: 'Mealini',
        description: 'Współdzielona lodówka i lista zakupów',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
          {src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: "maskable"},
          {src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: "maskable"},
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})