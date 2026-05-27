import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true, 
    allowedHosts: [
      'www.l1-10.ephec-ti.be',
      'l1-10.ephec-ti.be'
    ],
    proxy: {
      '/api': {
        target: "http://127.0.0.1:3000", 
        changeOrigin: true
      },
      '/socket.io': {
        target: "http://127.0.0.1:3000",
        ws: true,
        changeOrigin: true
      }
    }
  }
})