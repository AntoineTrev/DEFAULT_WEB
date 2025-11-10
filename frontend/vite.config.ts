import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
    const envDir = path.resolve(__dirname, '../')
    const env = loadEnv(mode, envDir, '')
    return {
        envDir,
        plugins: [vue()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        base: './',
        server: {
            host: true,
            port: Number(env.VITE_FRONTEND_PORT),
            strictPort: true,
            open: false,
            hmr: {
                host: env.VITE_FRONTEND_HMR_HOST || '0.0.0.0',
                protocol: 'ws',
                port: Number(env.VITE_FRONTEND_PORT),
            },
        },
        build: {
            sourcemap: true,
            outDir: 'dist',
            publicDir: 'public',
            manifest: true,
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, './index.html'),
                },
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('vue')) {
                                return 'vue'
                            }
                            return 'vendor'
                        }
                    },
                },
            },
        },
    }
})
