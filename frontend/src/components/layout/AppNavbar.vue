<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import Select from 'primevue/select'
import ReleaseNotesModal from '@/components/common/ReleaseNotesModal.vue'
import { useAuthStore } from '@/features/auth/stores/auth'
import { LOCALE_OPTIONS, useLocaleStore } from '@/stores/locale'
import { DARK_THEME, useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const localeStore = useLocaleStore()
const themeStore = useThemeStore()

const menu = ref<InstanceType<typeof Menu>>()
const releaseModal = ref<InstanceType<typeof ReleaseNotesModal>>()

const displayName = computed(() => auth.user?.name ?? '')
const isDark = computed(() => themeStore.theme === DARK_THEME)
const isLoginPage = computed(() => route.path === '/login')

const menuItems = computed<MenuItem[]>(() => [
    { label: t('nav.users'), icon: 'pi pi-users', command: () => router.push({ path: '/users' }) },
    {
        label: t('nav.changePassword'),
        icon: 'pi pi-key',
        command: () => router.push({ path: '/settings/password' }),
    },
    {
        label: t('nav.changeEmail'),
        icon: 'pi pi-envelope',
        command: () => router.push({ path: '/settings/email' }),
    },
    {
        label: t('nav.changeName'),
        icon: 'pi pi-user-edit',
        command: () => router.push({ path: '/settings/username' }),
    },
    { separator: true },
    { label: t('nav.logout'), icon: 'pi pi-sign-out', command: logout },
])

function toggleMenu(event: Event): void {
    menu.value?.toggle(event)
}

function logout(): void {
    auth.logout()
    router.push({ path: '/login' })
}
</script>

<template>
    <header class="app-navbar">
        <div class="app-navbar__inner flex flex-wrap align-items-center justify-content-between gap-2 px-3 sm:px-6">
            <RouterLink
                to="/"
                class="app-navbar__brand"
                :aria-label="t('nav.home')">
                <i
                    class="pi pi-server"
                    aria-hidden="true" />
                <span>DEFAULT_WEB</span>
            </RouterLink>

            <nav
                class="app-navbar__actions flex align-items-center gap-2"
                :aria-label="t('nav.navigation')">
                <RouterLink
                    to="/"
                    class="app-navbar__link hidden md:inline-flex">
                    {{ t('nav.home') }}
                </RouterLink>
                <RouterLink
                    to="/users"
                    class="app-navbar__link hidden md:inline-flex">
                    {{ t('nav.users') }}
                </RouterLink>

                <Select
                    :model-value="localeStore.locale"
                    :options="LOCALE_OPTIONS"
                    option-label="label"
                    option-value="value"
                    checkmark
                    class="app-navbar__language"
                    :aria-label="t('nav.language')"
                    :title="t('nav.language')"
                    @update:model-value="localeStore.setLocale" />

                <Button
                    type="button"
                    severity="secondary"
                    text
                    rounded
                    class="app-navbar__icon"
                    :aria-label="isDark ? t('nav.themeLight') : t('nav.themeDark')"
                    :title="isDark ? t('nav.themeLight') : t('nav.themeDark')"
                    @click="themeStore.toggleTheme">
                    <i
                        :class="isDark ? 'pi pi-sun' : 'pi pi-moon'"
                        aria-hidden="true" />
                </Button>

                <Button
                    type="button"
                    severity="secondary"
                    text
                    rounded
                    class="app-navbar__icon"
                    :aria-label="t('releases.show')"
                    :title="t('releases.show')"
                    @click="releaseModal?.open()">
                    <i
                        class="pi pi-book"
                        aria-hidden="true" />
                </Button>
                <ReleaseNotesModal ref="releaseModal" />

                <template v-if="auth.isAuthenticated">
                    <Button
                        type="button"
                        severity="secondary"
                        text
                        class="app-navbar__user"
                        :aria-label="t('nav.userMenu', { name: displayName })"
                        :title="t('nav.userMenu', { name: displayName })"
                        @click="toggleMenu">
                        <i
                            class="pi pi-user"
                            aria-hidden="true" />
                        <span class="app-navbar__username hidden md:inline-flex">{{ displayName }}</span>
                        <i
                            class="pi pi-angle-down"
                            aria-hidden="true" />
                    </Button>
                    <Menu
                        ref="menu"
                        :model="menuItems"
                        popup />
                </template>
                <Button
                    v-else-if="!isLoginPage"
                    type="button"
                    class="app-navbar__login"
                    :label="t('nav.login')"
                    icon="pi pi-sign-in"
                    @click="router.push({ path: '/login' })" />
            </nav>
        </div>
    </header>
</template>

<style scoped lang="scss">
.app-navbar {
    position: sticky;
    top: 0;
    z-index: 20;
    border-bottom: 1px solid var(--p-content-border-color);
    background: var(--p-content-background);
    color: var(--p-text-color);
}

.app-navbar__inner {
    max-width: 72rem;
    min-height: 3.5rem;
    margin: 0 auto;
}

.app-navbar__brand {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--p-primary-color);
    font-size: 1.125rem;
    font-weight: 600;
    text-decoration: none;
}

.app-navbar__link {
    color: var(--p-text-color);
    text-decoration: none;

    &:hover {
        color: var(--p-primary-color);
    }
}

.app-navbar__language {
    width: 5.5rem;

    @media (min-width: 768px) {
        width: 7rem;
    }
}

.app-navbar__user {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.app-navbar__username {
    max-width: 12rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
