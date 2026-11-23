<template>
    <main class="auth-page">
        <Card class="auth-card">
            <template #title>
                <h1>{{ t('auth.registerTitle') }}</h1>
            </template>
            <template #subtitle>
                <p class="auth-subtitle">{{ t('auth.haveAccount') }}</p>
            </template>
            <template #content>
                <form
                    class="auth-form"
                    novalidate
                    @submit.prevent="submit">
                    <Message
                        v-if="error"
                        severity="error"
                        :closable="false">
                        {{ error }}
                    </Message>

                    <label
                        class="auth-field"
                        for="name">
                        <span>{{ t('auth.name') }}</span>
                        <InputText
                            id="name"
                            v-model="payload.name"
                            autocomplete="username"
                            required />
                    </label>

                    <label
                        class="auth-field"
                        for="email">
                        <span>{{ t('auth.email') }}</span>
                        <InputText
                            id="email"
                            v-model="payload.email"
                            type="email"
                            autocomplete="email"
                            required />
                    </label>

                    <label
                        class="auth-field"
                        for="password">
                        <span>{{ t('auth.password') }}</span>
                        <Password
                            v-model="payload.password"
                            input-id="password"
                            :feedback="false"
                            autocomplete="new-password"
                            fluid
                            required />
                    </label>

                    <label
                        class="auth-field"
                        for="password-confirm">
                        <span>{{ t('auth.passwordConfirm') }}</span>
                        <Password
                            v-model="payload.passwordConfirm"
                            input-id="password-confirm"
                            :feedback="false"
                            autocomplete="new-password"
                            fluid
                            required />
                    </label>

                    <Button
                        type="submit"
                        :label="t('auth.register')"
                        :loading="loading"
                        fluid />
                </form>
            </template>
            <template #footer>
                <p class="auth-links">
                    {{ t('auth.haveAccount') }}
                    <RouterLink to="/login">{{ t('auth.signIn') }}</RouterLink>
                </p>
            </template>
        </Card>
    </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { useAuthStore } from '@/features/auth/stores/auth'
import type { RegisterPayload } from '@/features/auth/types'
import { getAuthErrorMessage } from '@/features/auth/utils/errors'
import {
    validateEmail,
    validateName,
    validatePassword,
    validatePasswordConfirm,
} from '@/features/auth/utils/validation'
import '@/features/auth/ui/auth.css'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const payload = reactive<RegisterPayload>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
})

const loading = ref(false)
const error = ref<string | null>(null)

function validate(): boolean {
    if (!payload.name) {
        error.value = t('auth.validation.required')
        return false
    }
    if (!validateName(payload.name)) {
        error.value = t('auth.validation.required')
        return false
    }
    if (!validateEmail(payload.email)) {
        error.value = t('auth.validation.emailInvalid')
        return false
    }
    if (!validatePassword(payload.password)) {
        error.value = t('auth.validation.passwordTooShort')
        return false
    }
    if (!validatePasswordConfirm(payload.passwordConfirm, payload.password)) {
        error.value = t('auth.validation.passwordMismatch')
        return false
    }
    return true
}

async function submit() {
    error.value = null
    if (!validate()) return
    loading.value = true
    try {
        await auth.register(payload)
        await router.push('/')
    } catch (err) {
        error.value = getAuthErrorMessage(err, t)
    } finally {
        loading.value = false
    }
}
</script>
