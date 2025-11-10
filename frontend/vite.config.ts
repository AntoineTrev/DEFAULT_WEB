import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        base: './',
        server: {
            port: Number(env.VITE_FRONTEND_PORT) || 5173,
            open: env.VITE_OPEN_BROWSER === 'true',
            strictPort: true,
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
                    manualChunks: {
                        vue: ['vue'],
                    },
                },
            },
        },
    }
})
