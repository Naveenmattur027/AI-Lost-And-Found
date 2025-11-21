import { defineConfig } from 'vite'

export default defineConfig({
  // ...other config (plugins etc.)
  server: {
    host: true, // allow all network interfaces
    port: Number(process.env.PORT) || 5173,
    hmr: {
      host: process.env.HOSTNAME || process.env.VITE_HOST || 'ai-lost-and-found-1.onrender.com'
    },
    allowedHosts: [process.env.VITE_HOST || 'ai-lost-and-found-1.onrender.com']
  },
  preview: {
    port: Number(process.env.PORT) || 5173,
    strictPort: true
  }
})
