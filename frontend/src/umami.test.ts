import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { loadUmami } from './umami'

const scriptSelector = 'script[src^="https://analytics.test/script.js"]'

describe('loadUmami', () => {
    afterEach(() => {
        vi.unstubAllEnvs()
        document.head.querySelectorAll<HTMLScriptElement>(scriptSelector).forEach(script => script.remove())
    })

    it('injects nothing when the build provides no tracker config', () => {
        vi.stubEnv('VITE_UMAMI_WEBSITE_ID', '')
        vi.stubEnv('VITE_UMAMI_SCRIPT_URL', '')

        loadUmami()

        expect(document.head.querySelector(scriptSelector)).toBeNull()
    })

    it('injects nothing when only one setting is provided', () => {
        vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'site-42')
        vi.stubEnv('VITE_UMAMI_SCRIPT_URL', '')

        loadUmami()

        expect(document.head.querySelector(scriptSelector)).toBeNull()
    })

    it('injects a deferred script pointing at the configured website', () => {
        vi.stubEnv('VITE_UMAMI_WEBSITE_ID', 'site-42')
        vi.stubEnv('VITE_UMAMI_SCRIPT_URL', 'https://analytics.test/script.js')

        loadUmami()

        const script = document.head.querySelector<HTMLScriptElement>(scriptSelector)
        expect(script?.getAttribute('src')).toBe('https://analytics.test/script.js?website=site-42')
        expect(script?.defer).toBe(true)
    })
})
