import { computed, onScopeDispose, ref } from 'vue'
import { defineStore } from 'pinia'
import { pb } from '@/services/pocketbase'
import { authService } from '../services/auth.service'
import type { AuthUser, RegisterPayload } from '../types'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<AuthUser | null>(authService.getCurrentUser())
    const isAuthenticated = computed(() => user.value !== null)

    const unsubscribe = pb.authStore.onChange(() => {
        user.value = pb.authStore.isValid ? authService.getCurrentUser() : null
    })
    onScopeDispose(unsubscribe)

    async function login(identity: string, password: string): Promise<void> {
        user.value = await authService.login(identity, password)
    }

    async function register(payload: RegisterPayload): Promise<void> {
        user.value = await authService.register(payload)
    }

    function logout(): void {
        authService.logout()
        user.value = null
    }

    async function refresh(): Promise<void> {
        if (!pb.authStore.isValid) {
            logout()
            return
        }
        try {
            user.value = await authService.refresh()
        } catch {
            logout()
        }
    }

    async function changePassword(oldPassword: string, newPassword: string, newPasswordConfirm: string): Promise<void> {
        await authService.changePassword(oldPassword, newPassword, newPasswordConfirm)
    }

    async function changeEmail(newEmail: string): Promise<void> {
        await authService.requestEmailChange(newEmail)
    }

    async function changeName(name: string): Promise<void> {
        user.value = await authService.changeName(name)
    }

    return {
        user,
        isAuthenticated,
        login,
        register,
        logout,
        refresh,
        changePassword,
        changeEmail,
        changeName,
    }
})
