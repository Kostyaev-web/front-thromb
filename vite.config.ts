import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs'
import path from 'path'


const ZEROTIER_IP = '10.98.12.125';
const API_PORT = 8443;
const IMAGES_PORT = 9000;

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
        target: `https://${ZEROTIER_IP}:${API_PORT}`,
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            proxyReq.setHeader('Origin', `https://${ZEROTIER_IP}:${API_PORT}`);
            proxyReq.setHeader('X-Forwarded-Proto', 'https');
            proxyReq.setHeader('X-Forwarded-Host', `${ZEROTIER_IP}:${API_PORT}`);
            // Передаем оригинальный Referer для отладки
            if (req.headers.referer) {
              proxyReq.setHeader('Referer', req.headers.referer);
            }
          });
        },
      },
      '/images': {
        target: `http://${ZEROTIER_IP}:${IMAGES_PORT}`,
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