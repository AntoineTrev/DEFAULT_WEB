import { defineConfig, loadEnv, lazyPlugins } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
    const envDir = path.resolve(__dirname, '../')
    const env = loadEnv(mode, envDir, '')

    // Browser traffic stays same-origin; dev proxies it to the containers.
    const backendTarget = env.VITE_BACKEND_PROXY_TARGET ?? `http://localhost:${env.BACKEND_PORT ?? 8090}`
    const gatewayTarget = env.VITE_GATEWAY_PROXY_TARGET ?? 'http://localhost:3001'

    return {
        lint: {
            jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
            rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
            options: { typeAware: true, typeCheck: true },
        },
        test: {
            include: ['src/**/*.test.ts'],
            environment: 'jsdom',
        },
        staged: {
            '*': 'vp check --fix --deny-warnings',
        },
        run: {
            tasks: {
                ci: {
                    command: ['vp check --deny-warnings', 'vp test --run', 'vp build'],
                },
            },
        },
        fmt: {
            arrowParens: 'avoid',
            bracketSameLine: true,
            htmlWhitespaceSensitivity: 'ignore',
            printWidth: 120,
            semi: false,
            singleAttributePerLine: true,
            singleQuote: true,
            tabWidth: 4,
            trailingComma: 'all',
            sortPackageJson: false,
            ignorePatterns: ['src/typed-router.d.ts'],
        },
        envDir,
        plugins: lazyPlugins(() => [
            vue(),
            VueRouter({
                routesFolder: 'src/pages',
                dts: 'src/typed-router.d.ts',
            }),
        ]),
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        base: '/',
        server: {
            host: true,
            port: Number(env.VITE_FRONTEND_PORT || env.FRONTEND_PORT),
            strictPort: true,
            open: false,
            hmr: {
                host: env.VITE_FRONTEND_HMR_HOST || env.FRONTEND_HMR_HOST || 'localhost',
                protocol: 'ws',
            },
            proxy: {
                '/api': { target: backendTarget },
                '/admin-api': {
                    target: gatewayTarget,
                    rewrite: route => route.replace(/^\/admin-api/, ''),
                },
            },
        },
        build: {
            sourcemap: mode !== 'production',
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
