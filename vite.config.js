import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // In dev, forward /api requests to the local Express server so the
    // browser never talks to Gemini (and never sees the API key).
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
})
