/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './tests/e2e',
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:4173',
        ...devices['Desktop Chrome'],
    },
    webServer: {
        command: 'yarn vp dev --host 127.0.0.1 --port 4173 --strictPort',
        url: 'http://127.0.0.1:4173',
        // A stale dev server can serve a half-invalidated module graph after a unit run.
        reuseExistingServer: false,
        timeout: 120_000,
    },
})
