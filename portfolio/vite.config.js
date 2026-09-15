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
      // Proxy all /api requests to Faraz's FastAPI backend (192.168.18.195)
      // This avoids CORS issues — browser sees requests on the same origin.
      '/api': {
        target: 'http://192.168.18.195:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

