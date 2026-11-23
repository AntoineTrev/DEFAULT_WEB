import { defineStore } from 'pinia'
import { ref } from 'vue'

export const THEME_OPTIONS = ['light', 'dark'] as const
export type AppTheme = (typeof THEME_OPTIONS)[number]

export const LIGHT_THEME: AppTheme = 'light'
export const DARK_THEME: AppTheme = 'dark'

const STORAGE_KEY = 'app.theme'
const DARK_MODE_CLASS = 'dark-mode'

function isAppTheme(value: unknown): value is AppTheme {
    return typeof value === 'string' && (THEME_OPTIONS as readonly string[]).includes(value)
}

function readStoredTheme(): AppTheme {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return isAppTheme(stored) ? stored : LIGHT_THEME
    } catch {
        return LIGHT_THEME
    }
}

function applyTheme(value: AppTheme): void {
    if (typeof document === 'undefined') {
        return
    }
    document.documentElement.classList.toggle(DARK_MODE_CLASS, value === DARK_THEME)
}

export const useThemeStore = defineStore('theme', () => {
    const theme = ref<AppTheme>(readStoredTheme())
    applyTheme(theme.value)

    function setTheme(value: AppTheme): void {
        theme.value = value
        applyTheme(value)
        try {
            window.localStorage.setItem(STORAGE_KEY, value)
        } catch {
            return
        }
    }

    function toggleTheme(): void {
        setTheme(theme.value === DARK_THEME ? LIGHT_THEME : DARK_THEME)
    }

    return { theme, setTheme, toggleTheme }
})
