<template>
    <main class="settings-page">
        <Card class="settings-card">
            <template #title>
                <h1>{{ t('auth.changePassword') }}</h1>
            </template>
            <template #content>
                <Message
                    v-if="error"
                    severity="error"
                    :closable="false">
                    {{ error }}
                </Message>
                <Message
                    v-if="success"
                    severity="success"
                    :closable="false">
                    {{ t('auth.success') }}
                </Message>

                <form
                    class="settings-form"
                    novalidate
                    @submit.prevent="submit">
                    <label
                        class="settings-field"
                        for="current-password">
                        <span>{{ t('auth.oldPassword') }}</span>
                        <Password
                            v-model="payload.oldPassword"
                            input-id="current-password"
                            :feedback="false"
                            autocomplete="current-password"
                            fluid
                            required />
                    </label>

                    <label
                        class="settings-field"
                        for="new-password">
                        <span>{{ t('auth.newPassword') }}</span>
                        <Password
                            v-model="payload.newPassword"
                            input-id="new-password"
                            :feedback="false"
                            autocomplete="new-password"
                            fluid
                            required />
                    </label>

                    <label
                        class="settings-field"
                        for="confirm-password">
                        <span>{{ t('auth.passwordConfirm') }}</span>
                        <Password
                            v-model="payload.newPasswordConfirm"
                            input-id="confirm-password"
                            :feedback="false"
                            autocomplete="new-password"
                            fluid
                            required />
                    </label>

                    <Button
                        type="submit"
                        :label="t('common.save')"
                        :loading="loading"
                        fluid />
                </form>
            </template>
        </Card>
    </main>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { useAuthStore } from '@/features/auth/stores/auth'
import type { ChangePasswordPayload } from '@/features/auth/types'
import { getAuthErrorMessage } from '@/features/auth/utils/errors'
import { validatePassword, validatePasswordConfirm } from '@/features/auth/utils/validation'
import '@/features/auth/ui/auth.css'

const { t } = useI18n()
const auth = useAuthStore()

const payload = reactive<ChangePasswordPayload>({
    oldPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
})

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

function validate(): boolean {
    if (!payload.oldPassword) {
        error.value = t('auth.validation.required')
        return false
    }
    if (!validatePassword(payload.newPassword)) {
        error.value = t('auth.validation.passwordTooShort')
        return false
    }
    if (!validatePasswordConfirm(payload.newPasswordConfirm, payload.newPassword)) {
        error.value = t('auth.validation.passwordMismatch')
        return false
    }
    return true
}

async function submit() {
    error.value = null
    success.value = false
    if (!validate()) return
    loading.value = true
    try {
        await auth.changePassword(payload.oldPassword, payload.newPassword, payload.newPasswordConfirm)
        success.value = true
        payload.oldPassword = ''
        payload.newPassword = ''
        payload.newPasswordConfirm = ''
    } catch (err) {
        error.value = getAuthErrorMessage(err, t)
    } finally {
        loading.value = false
    }
}
</script>
