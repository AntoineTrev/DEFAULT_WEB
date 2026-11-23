import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { useAuthStore } from '@/features/auth/stores/auth'
import { pb } from '@/services/pocketbase'

const PUBLIC_PATHS = new Set(['/login', '/register'])
const ADMIN_PATHS = new Set(['/users'])

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

router.beforeEach(async to => {
    const auth = useAuthStore()

    if (pb.authStore.token) {
        try {
            await auth.refresh()
        } catch {
            // Refresh clears stale auth itself; a network error must not block navigation.
        }
    }

    const isPublic = PUBLIC_PATHS.has(to.path) || to.meta.public === true
    const requiresAdmin = ADMIN_PATHS.has(to.path) || to.meta.requiresAdmin === true

    if (!isPublic && !auth.isAuthenticated) {
        return { path: '/login', query: { redirect: to.fullPath } }
    }
    if (requiresAdmin && auth.user?.role !== 'admin') {
        return { path: '/' }
    }
    if (isPublic && auth.isAuthenticated) {
        return { path: '/' }
    }
    return true
})
