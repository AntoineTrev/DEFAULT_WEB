<template>
    <main class="settings-page">
        <Card class="settings-card">
            <template #title>
                <h1>{{ t('auth.changeEmail') }}</h1>
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
                        for="current-email">
                        <span>{{ t('auth.currentEmail') }}</span>
                        <InputText
                            id="current-email"
                            :model-value="auth.user?.email ?? ''"
                            readonly />
                    </label>

                    <label
                        class="settings-field"
                        for="new-email">
                        <span>{{ t('auth.newEmail') }}</span>
                        <InputText
                            id="new-email"
                            v-model="newEmail"
                            type="email"
                            autocomplete="email"
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { useAuthStore } from '@/features/auth/stores/auth'
import { getAuthErrorMessage } from '@/features/auth/utils/errors'
import { validateEmail } from '@/features/auth/utils/validation'
import '@/features/auth/ui/auth.css'

const { t } = useI18n()
const auth = useAuthStore()

const newEmail = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

function validate(): boolean {
    if (!newEmail.value || !validateEmail(newEmail.value)) {
        error.value = t('auth.validation.emailInvalid')
        return false
    }
    if (newEmail.value === auth.user?.email) {
        error.value = t('auth.validation.sameAsCurrent')
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
        await auth.changeEmail(newEmail.value)
        success.value = true
        newEmail.value = ''
    } catch (err) {
        error.value = getAuthErrorMessage(err, t)
    } finally {
        loading.value = false
    }
}
</script>
