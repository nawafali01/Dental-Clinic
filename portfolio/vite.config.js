import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // 1. Express backend (localhost:5000) for website public endpoints
      '/api/services':     { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/doctors':      { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/gallery':      { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/tips':         { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/symptoms':     { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/appointments': { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/ai':           { target: 'http://localhost:5000', changeOrigin: true, secure: false },
      '/api/health':       { target: 'http://localhost:5000', changeOrigin: true, secure: false },

      // 2. Real Dental CRM FastAPI backend (Faraz's machine: 192.168.18.195:8000)
      // Handles /api/v1/auth/login, /api/v1/users, and other CRM endpoints
      '/api/v1': {
        target: 'http://192.168.18.195:8000',
        changeOrigin: true,
        secure: false,
      },
      // Fallback for any other /api route
      '/api': {
        target: 'http://192.168.18.195:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

