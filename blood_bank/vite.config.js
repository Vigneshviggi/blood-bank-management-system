import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://blood-bank-management-system-a2vx.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
