import { defineStore } from 'pinia'
import { ref } from 'vue'
import { i18n } from '@/i18n'

export const SUPPORTED_LOCALES = ['en', 'fr'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_OPTIONS: { value: AppLocale; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
]

const STORAGE_KEY = 'app.locale'
const DEFAULT_LOCALE: AppLocale = 'en'

function isAppLocale(value: unknown): value is AppLocale {
    return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

function readStoredLocale(): AppLocale {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        return isAppLocale(stored) ? stored : DEFAULT_LOCALE
    } catch {
        return DEFAULT_LOCALE
    }
}

function applyLocale(value: AppLocale): void {
    i18n.global.locale.value = value
    if (typeof document !== 'undefined') {
        document.documentElement.lang = value
    }
}

export const useLocaleStore = defineStore('locale', () => {
    const locale = ref<AppLocale>(readStoredLocale())
    applyLocale(locale.value)

    function setLocale(value: unknown): void {
        if (!isAppLocale(value)) {
            return
        }
        locale.value = value
        applyLocale(value)
        try {
            window.localStorage.setItem(STORAGE_KEY, value)
        } catch {
            return
        }
    }

    return { locale, setLocale }
})
