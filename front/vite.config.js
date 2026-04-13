import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// По умолчанию HTTP — без предупреждений браузера на ПК.
// Для телефона по Wi‑Fi (камера QR): npm run dev:https → открывать https://<IP>:3000
const useHttps = process.env.DEV_HTTPS === '1' || process.env.DEV_HTTPS === 'true'

export default defineConfig({
  plugins: [react(), ...(useHttps ? [basicSsl()] : [])],
  server: {
    port: 3000,
    host: true,
    ...(useHttps ? { https: true } : {}),
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})