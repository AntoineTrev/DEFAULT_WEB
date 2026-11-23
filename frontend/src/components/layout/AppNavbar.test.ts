import { beforeEach, describe, expect, it } from 'vite-plus/test'
import { shallowMount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppNavbar from './AppNavbar.vue'
import { i18n } from '@/i18n'
import { useLocaleStore } from '@/stores/locale'
import { useThemeStore } from '@/stores/theme'

const stubs = {
    Button: { template: '<button><slot /></button>' },
    Select: { name: 'Select', template: '<div class="select-stub" />' },
    Menu: { template: '<div />' },
    RouterLink: { props: ['to'], template: '<a><slot /></a>' },
    ReleaseNotesModal: { template: '<div />' },
}

async function mountNavbar() {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [{ path: '/', component: { template: '<div />' } }],
    })
    await router.push('/')
    await router.isReady()
    return shallowMount(AppNavbar, {
        global: { plugins: [i18n, router], stubs },
    })
}

describe('AppNavbar', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.classList.remove('dark-mode')
        document.documentElement.lang = 'en'
        i18n.global.locale.value = 'en'
        setActivePinia(createPinia())
    })

    it('renders the brand and the navigation links', async () => {
        const wrapper = await mountNavbar()
        expect(wrapper.text()).toContain('DEFAULT_WEB')
        expect(wrapper.text()).toContain('Home')
        expect(wrapper.text()).toContain('Users')
    })

    it('toggles dark mode from the theme button', async () => {
        const wrapper = await mountNavbar()
        const button = wrapper.findAll('button').find(item => item.attributes('aria-label') === 'Switch to dark mode')
        expect(button).toBeDefined()

        await button!.trigger('click')
        expect(useThemeStore().theme).toBe('dark')
        expect(document.documentElement.classList.contains('dark-mode')).toBe(true)
    })

    it('updates the locale when the language selector changes', async () => {
        const wrapper = await mountNavbar()
        const select = wrapper.find('.select-stub')
        expect(select.attributes('aria-label')).toBe('Language')

        await wrapper.findComponent({ name: 'Select' }).vm.$emit('update:model-value', 'fr')
        expect(useLocaleStore().locale).toBe('fr')
        expect(document.documentElement.lang).toBe('fr')
        expect(i18n.global.locale.value).toBe('fr')
    })
})
