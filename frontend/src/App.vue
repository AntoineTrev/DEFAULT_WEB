<template>
    <Toast />
    <AppNavbar />
    <main class="app-main">
        <RouterView />
    </main>
</template>

<script lang="ts" setup>
import Toast from 'primevue/toast'
import { RouterView } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
</script>

<style scoped>
.app-main {
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
}
</style>
