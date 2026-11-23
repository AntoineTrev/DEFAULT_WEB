<template>
    <main class="page">
        <Card class="home-card">
            <template #title>
                <h1>{{ t('home.title') }}</h1>
            </template>
            <template #subtitle>
                <p class="welcome">{{ t('home.subtitle') }}</p>
            </template>
            <template #content>
                <RouterLink
                    to="/users"
                    class="action">
                    {{ t('home.viewUsers') }}
                    <i
                        class="pi pi-arrow-right"
                        aria-hidden="true" />
                </RouterLink>
            </template>
        </Card>
    </main>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import Card from 'primevue/card'

const { t } = useI18n()
</script>

<style scoped>
.page {
    display: flex;
    justify-content: center;
    min-height: 100vh;
    padding: 4rem 1rem;
    background: var(--p-surface-50, #f8fafc);
}

.home-card {
    width: min(100%, 40rem);
}

h1 {
    margin: 0;
    font-size: 1.75rem;
}

.welcome {
    margin: 0.5rem 0;
    color: var(--p-text-muted-color, #64748b);
}

.action {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
    background: var(--p-primary-color, #0f62fe);
    color: var(--p-primary-contrast-color, #fff);
    font-weight: 600;
    text-decoration: none;
}

.action:focus-visible {
    outline: 2px solid currentcolor;
    outline-offset: 2px;
}
</style>
