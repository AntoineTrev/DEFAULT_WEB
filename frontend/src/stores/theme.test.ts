import { beforeEach, describe, expect, it } from 'vite-plus/test'
import { createPinia, setActivePinia } from 'pinia'
import { DARK_THEME, LIGHT_THEME, useThemeStore } from './theme'

describe('theme store', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.classList.remove('dark-mode')
        setActivePinia(createPinia())
    })

    it('starts in light mode', () => {
        const store = useThemeStore()
        expect(store.theme).toBe(LIGHT_THEME)
        expect(document.documentElement.classList.contains('dark-mode')).toBe(false)
    })

    it('toggles and persists dark mode', () => {
        const store = useThemeStore()
        store.toggleTheme()
        expect(store.theme).toBe(DARK_THEME)
        expect(document.documentElement.classList.contains('dark-mode')).toBe(true)
        expect(localStorage.getItem('app.theme')).toBe(DARK_THEME)
    })

    it('restores a valid stored theme', () => {
        localStorage.setItem('app.theme', DARK_THEME)
        expect(useThemeStore().theme).toBe(DARK_THEME)
        expect(document.documentElement.classList.contains('dark-mode')).toBe(true)
    })

    it('ignores an invalid stored theme', () => {
        localStorage.setItem('app.theme', 'neon')
        expect(useThemeStore().theme).toBe(LIGHT_THEME)
    })
})
