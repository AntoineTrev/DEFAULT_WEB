import { beforeEach, describe, expect, it } from 'vite-plus/test'
import { createPinia, setActivePinia } from 'pinia'
import { i18n } from '@/i18n'
import { useLocaleStore } from './locale'

describe('locale store', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.lang = 'en'
        i18n.global.locale.value = 'en'
        setActivePinia(createPinia())
    })

    it('uses English by default', () => {
        const store = useLocaleStore()
        expect(store.locale).toBe('en')
        expect(document.documentElement.lang).toBe('en')
    })

    it('switches language, i18n locale and html lang', () => {
        const store = useLocaleStore()
        store.setLocale('fr')
        expect(store.locale).toBe('fr')
        expect(i18n.global.locale.value).toBe('fr')
        expect(document.documentElement.lang).toBe('fr')
        expect(localStorage.getItem('app.locale')).toBe('fr')
    })

    it('restores the stored locale and rejects unknown values', () => {
        localStorage.setItem('app.locale', 'fr')
        expect(useLocaleStore().locale).toBe('fr')
        useLocaleStore().setLocale('de')
        expect(i18n.global.locale.value).toBe('fr')
    })
})
