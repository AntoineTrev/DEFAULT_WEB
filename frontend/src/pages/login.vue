<template>
    <main class="auth-page">
        <Card class="auth-card">
            <template #title>
                <h1>{{ t('auth.title') }}</h1>
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
                        for="identity">
                        <span>{{ t('auth.email') }}</span>
                        <InputText
                            id="identity"
                            v-model="identity"
                            autocomplete="username"
                            required />
                    </label>

                    <label
                        class="auth-field"
                        for="password">
                        <span>{{ t('auth.password') }}</span>
                        <Password
                            v-model="password"
                            input-id="password"
                            :feedback="false"
                            autocomplete="current-password"
                            fluid
                            required />
                    </label>

                    <Button
                        type="submit"
                        :label="t('auth.signIn')"
                        :loading="loading"
                        fluid />
                </form>
            </template>
            <template #footer>
                <p class="auth-links">
                    {{ t('auth.noAccount') }}
                    <RouterLink to="/register">{{ t('auth.register') }}</RouterLink>
                </p>
            </template>
        </Card>
    </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { useAuthStore } from '@/features/auth/stores/auth'
import { getAuthErrorMessage } from '@/features/auth/utils/errors'
import '@/features/auth/ui/auth.css'

const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const identity = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function submit() {
    error.value = null
    if (!identity.value) {
        error.value = t('auth.failed')
        return
    }
    loading.value = true
    try {
        await auth.login(identity.value, password.value)
        await router.push('/')
    } catch (err) {
        error.value = getAuthErrorMessage(err, t)
    } finally {
        loading.value = false
    }
}
</script>
