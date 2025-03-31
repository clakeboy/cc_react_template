import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
import mpaPlugin from 'vite-plugin-mpa-plus'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({ typescript: true }),
    mpaPlugin({
      pages:{
        manage: {
          entry: 'src/main.tsx',
          filename: '/manage.html',
          template: 'src/assets/template/manage/dev.html',
          inject: {
            data: {
              title: "SYSTEM"
            }
          }
        },
        app: {
          entry: 'src/app.tsx',
          filename: '/app.html',
          template: 'src/assets/template/h5/dev.html',
          inject: {
            data: {
              title: "SYSTEM H5"
            }
          }
        }
      }
    })
  ],
  publicDir: "./public",
  build: {
    assetsDir: "assets",
    outDir: '../assets/html',
    // outDir: '../publish/assets/html', //不打包前端发布
  },
  server: {
    proxy: {
      '^/serv/.*': {
        target: 'http://localhost:12355',
        changeOrigin: true
      }
    }
  }
})
