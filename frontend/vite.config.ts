import { defineConfig, loadEnv, lazyPlugins } from 'vite-plus'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
    const envDir = path.resolve(__dirname, '../')
    const env = loadEnv(mode, envDir, '')

    const buildEnvForDev: Record<string, string> = {}
    for (const key in env) {
        if (['BACKEND_PORT', 'BACKEND_ADMIN_EMAIL', 'BACKEND_ADMIN_PASSWORD'].includes(key)) {
            buildEnvForDev[`import.meta.env.VITE_${key}`] = JSON.stringify(env[key])
        }
    }

    return {
        lint: {
            jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
            rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
            options: { typeAware: true, typeCheck: true },
        },
        test: {
            include: ['src/**/*.test.ts'],
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
            ignorePatterns: [],
        },
        envDir,
        plugins: lazyPlugins(() => [vue()]),
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        base: './',
        server: {
            host: true,
            port: Number(env.VITE_FRONTEND_PORT || env.FRONTEND_PORT),
            strictPort: true,
            open: false,
            hmr: {
                host: env.VITE_FRONTEND_HMR_HOST || env.FRONTEND_HMR_HOST || 'localhost',
                protocol: 'ws',
            },
        },
        define: {
            ...buildEnvForDev,
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
