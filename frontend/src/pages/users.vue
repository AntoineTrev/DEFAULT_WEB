<template>
    <main class="users-page">
        <Card class="users-card">
            <template #title>
                <div class="header">
                    <h1>{{ t('users.title') }}</h1>
                    <Button
                        :label="t('users.refresh')"
                        icon="pi pi-refresh"
                        outlined
                        :loading="loading"
                        @click="load" />
                </div>
            </template>
            <template #content>
                <Message
                    v-if="error"
                    severity="error"
                    :closable="false">
                    {{ error }}
                </Message>

                <DataTable
                    :value="items"
                    :loading="loading"
                    data-key="id"
                    scrollable>
                    <template #empty>
                        <div class="empty">{{ t('users.empty') }}</div>
                    </template>

                    <Column
                        field="name"
                        :header="t('users.name')" />
                    <Column
                        field="email"
                        :header="t('users.email')" />
                    <Column
                        field="verified"
                        :header="t('users.verified')">
                        <template #body="{ data }">
                            <Tag
                                :severity="data.verified ? 'success' : 'danger'"
                                :value="data.verified ? t('users.yes') : t('users.no')" />
                        </template>
                    </Column>
                    <Column :header="t('users.blocked')">
                        <template #body="{ data }">
                            <Tag
                                :severity="data.blocked ? 'danger' : 'success'"
                                :value="data.blocked ? t('users.blocked') : t('users.active')" />
                        </template>
                    </Column>
                    <Column :header="t('users.block')">
                        <template #body="{ data }">
                            <Button
                                :label="data.blocked ? t('users.unblock') : t('users.block')"
                                :icon="data.blocked ? 'pi pi-check' : 'pi pi-ban'"
                                :severity="data.blocked ? 'success' : 'danger'"
                                outlined
                                size="small"
                                @click="confirmTarget = data" />
                        </template>
                    </Column>
                </DataTable>

                <Dialog
                    :visible="confirmTarget !== null"
                    :header="confirmTarget?.blocked ? t('users.unblock') : t('users.block')"
                    modal
                    :draggable="false"
                    @update:visible="confirmTarget = null">
                    <p v-if="confirmTarget">{{ confirmTarget.name }}</p>
                    <template #footer>
                        <Button
                            :label="t('common.cancel')"
                            outlined
                            @click="confirmTarget = null" />
                        <Button
                            :label="confirmTarget?.blocked ? t('users.unblock') : t('users.block')"
                            :loading="saving"
                            @click="applyBlock" />
                    </template>
                </Dialog>
            </template>
        </Card>
    </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { listUsers, setBlocked } from '@/features/admin/services/admin.service'
import { getAuthErrorMessage } from '@/features/auth/utils/errors'

interface AdminUser {
    id: string
    name: string
    email: string
    verified: boolean
    blocked: boolean
    created: string
    updated: string
    lastLogin?: string
}

const { t } = useI18n()

const items = ref<AdminUser[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const confirmTarget = ref<AdminUser | null>(null)

async function load() {
    loading.value = true
    error.value = null
    try {
        items.value = (await listUsers()).items
    } catch (err) {
        error.value = getAuthErrorMessage(err, t)
    } finally {
        loading.value = false
    }
}

async function applyBlock() {
    if (!confirmTarget.value) return
    saving.value = true
    error.value = null
    try {
        await setBlocked(confirmTarget.value.id, !confirmTarget.value.blocked)
        confirmTarget.value = null
        await load()
    } catch (err) {
        error.value = getAuthErrorMessage(err, t)
    } finally {
        saving.value = false
    }
}

onMounted(load)
</script>

<style scoped>
.users-page {
    display: flex;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem 1rem;
    background: var(--p-surface-50, #f8fafc);
}

.users-card {
    width: min(100%, 1100px);
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

h1 {
    margin: 0;
    font-size: 1.5rem;
}

.empty {
    padding: 1rem;
    text-align: center;
    color: var(--p-text-muted-color, #64748b);
}
</style>
