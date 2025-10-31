import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fix refresh issue for React Router
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true,
    // Vite automatically handles history fallback for React,
    // but some versions need this workaround.
    middlewareMode: false,
  },
  preview: {
    port: 4173,
  },
})
