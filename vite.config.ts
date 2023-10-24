import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({ typescript: true }),
  ],
  publicDir: "./public",
  build: {
    assetsDir: "assets"
  },
  server: {
    proxy: {
      '^/serv/.*': {
        target: 'http://localhost:12352',
        changeOrigin: true
      }
    }
  }
})
