import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/front-thromb/',
  plugins: [react(), mkcert()],
  server: {
    // Для доступа с телефона через ZeroTier нужно слушать на всех интерфейсах
    host: '0.0.0.0', // Позволяет доступ с других устройств в сети
    port: 5173,
    strictPort: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
    proxy: {
      '/api': {
        target: 'https://10.98.12.125:8443',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://10.98.12.125:9000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/images/, ''),
      },
    },
  },
  preview: {
    port: 443,
    host: '0.0.0.0', // Для доступа с телефона через ZeroTier
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
  },
})
