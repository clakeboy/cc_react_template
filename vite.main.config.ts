import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import { viteExternalsPlugin } from 'vite-plugin-externals'
import mpaPlugin from 'vite-plugin-mpa-plus'
// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        react(),
        checker({ typescript: true }),
        viteExternalsPlugin({
            'bootstrap':'bootstrap'
            // xlsx: "XLSX",
            // moment:'moment',
            // '@clake/react-bootstrap4':'ReactBootstrapV4',
            // 'react':'React',
            // 'react-dom':'ReactDOM',
        }),
        mpaPlugin({
            pages:{
                manage: {
                    entry: 'src/main.tsx',
                    filename: '/manage.html',
                    template: 'src/assets/template/manage/index.html',
                    inject: {
                        data: {
                            title: "SYSTEM"
                        }
                    }
                },
                app: {
                    entry: 'src/app.tsx',
                    filename: '/app.html',
                    template: 'src/assets/template/h5/index.html',
                    inject: {
                        data: {
                            title: "SYSTEM H5"
                        }
                    }
                }
            }
        })
    ],
    publicDir: './public',
    build: {
        assetsDir: 'assets',
        outDir: '../assets/html',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                // 最小化拆分包
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return "vendor"
                        // return id.toString().split('node_modules/')[1].split('/')[0].toString();
                    }
                },
                // // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
                // entryFileNames: 'js/[name].[hash].js',
                // // 用于命名代码拆分时创建的共享块的输出命名
                // // 　　chunkFileNames: 'js/[name].[hash].js',
                // // 用于输出静态资源的命名，[ext]表示文件扩展名
                // assetFileNames: '[ext]/[name].[hash].[ext]',
                // // 拆分js到模块文件夹
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : [];
                    const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]';
                    return `js/${fileName}/[name].[hash].js`;
                },
            },
            external:[
                'bootstrap'
                // 'xlsx',
                // 'dayjs',
                // '@clake/react-bootstrap4',
                // 'react',
                // 'react-dom',
            ],
        },
    },
});
