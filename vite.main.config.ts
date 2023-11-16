import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import checker from 'vite-plugin-checker'
import { viteExternalsPlugin } from 'vite-plugin-externals'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        checker({ typescript: true }),
        viteExternalsPlugin({
            'bootstrap':'bootstrap'
    ],
    publicDir: "./public",
    build: {
        assetsDir: "assets",
        outDir: '../assets/html',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return "vendor"
                    }
                },
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : [];
                    const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]';
                    return `js/${fileName}/[name].[hash].js`;
                },
            },
            external:[
                'bootstrap'
            ],
        },
    }
})
