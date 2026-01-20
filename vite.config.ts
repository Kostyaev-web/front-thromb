import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import { existsSync } from 'fs'
import { resolve } from 'path'
import fs from 'fs'

// Проверяем, находимся ли мы в Tauri проекте (есть папка src-tauri)
const isTauriProject = existsSync(resolve(__dirname, 'src-tauri'))

//TODO: Поменять IP на свой ZeroTier
const API_BASE_URL = 'https://10.98.12.125:8443'

// https://vite.dev/config/
export default defineConfig({
  // Для Tauri (dev и production) не нужен base path, для web используем base path
  base: (process.env.TAURI_PLATFORM || process.env.TAURI_DEV || isTauriProject) ? '/' : '/front-thromb/',
  plugins: [react(), mkcert()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    // Для доступа с телефона через ZeroTier нужно слушать на всех интерфейсах
    host: '0.0.0.0', // Позволяет доступ с других устройств в сети
    https: {
      key: fs.readFileSync(resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(resolve(__dirname, 'cert.crt')),
    },
    watch: {
      ignored: ['**/src-tauri/**'],
    },
    proxy: {
      '/api': {
        target: API_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 443,
    host: '0.0.0.0', // Для доступа с телефона через ZeroTier
    https: {
      key: fs.readFileSync(resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(resolve(__dirname, 'cert.crt')),
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})
