<template>
    <main class="settings-page">
        <Card class="settings-card">
            <template #title>
                <h1>{{ t('auth.changeName') }}</h1>
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
                        for="current-name">
                        <span>{{ t('auth.name') }}</span>
                        <InputText
                            id="current-name"
                            :model-value="auth.user?.name ?? ''"
                            readonly />
                    </label>

                    <label
                        class="settings-field"
                        for="new-name">
                        <span>{{ t('auth.name') }}</span>
                        <InputText
                            id="new-name"
                            v-model="newName"
                            autocomplete="username"
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
import { validateName } from '@/features/auth/utils/validation'
import '@/features/auth/ui/auth.css'

const { t } = useI18n()
const auth = useAuthStore()

const newName = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

function validate(): boolean {
    if (!newName.value || !validateName(newName.value)) {
        error.value = t('auth.validation.required')
        return false
    }
    if (newName.value === auth.user?.name) {
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
        await auth.changeName(newName.value)
        success.value = true
        newName.value = ''
    } catch (err) {
        error.value = getAuthErrorMessage(err, t)
    } finally {
        loading.value = false
    }
}
</script>
