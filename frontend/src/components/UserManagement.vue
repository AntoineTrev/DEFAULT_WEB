<template>
    <main class="page">
        <section
            class="panel"
            aria-labelledby="users-title">
            <header class="panel-header">
                <div>
                    <h1 id="users-title">{{ t('users.title') }}</h1>
                    <p class="subtitle">{{ t('users.subtitle') }}</p>
                </div>
                <Button
                    :label="t('users.refresh')"
                    icon="pi pi-refresh"
                    outlined
                    :loading="isLoading || isPending"
                    @click="refetch()" />
            </header>

            <Message
                v-if="error"
                severity="error"
                :closable="false"
                class="notice">
                {{ t('users.loadError') }}
            </Message>

            <IconField class="search">
                <InputIcon class="pi pi-search" />
                <InputText
                    v-model="searchInput"
                    :placeholder="t('users.searchPlaceholder')"
                    :aria-label="t('users.searchLabel')"
                    @input="onSearchInput" />
            </IconField>

            <div
                class="table-shell"
                role="region"
                :aria-label="t('users.regionLabel')"
                tabindex="0">
                <DataTable
                    :value="users"
                    :lazy="true"
                    :loading="isLoading || isPending"
                    :total-records="totalItems"
                    :rows="perPage"
                    :first="(page - 1) * perPage"
                    paginator
                    :rows-per-page-options="[5, 10, 20]"
                    data-key="id"
                    scrollable
                    scroll-height="500px"
                    sort-mode="single"
                    @page="onPage"
                    @sort="onSort">
                    <template #empty>
                        <div class="empty">{{ t('users.empty') }}</div>
                    </template>

                    <Column
                        :header="t('users.avatar')"
                        :style="{ width: '6rem' }">
                        <template #body="{ data }">
                            <Avatar
                                v-if="avatarSrc(data)"
                                :image="avatarSrc(data)"
                                shape="circle"
                                size="large"
                                :alt="t('users.avatarAlt', { name: data.name })" />
                            <Avatar
                                v-else
                                shape="circle"
                                size="large"
                                :label="initials(data.name)" />
                        </template>
                    </Column>

                    <Column
                        field="name"
                        :header="t('users.name')"
                        sortable />
                    <Column
                        field="email"
                        :header="t('users.email')"
                        sortable />

                    <Column
                        field="verified"
                        :header="t('users.verified')"
                        sortable>
                        <template #body="{ data }">
                            <Tag
                                :severity="data.verified ? 'success' : 'danger'"
                                :value="data.verified ? t('users.yes') : t('users.no')" />
                        </template>
                    </Column>

                    <Column
                        field="updated"
                        :header="t('users.updated')"
                        sortable>
                        <template #body="{ data }">
                            <time :datetime="data.updated">{{ formatDate(data.updated) }}</time>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <p class="summary">
                {{ t('users.summary', { page: page ?? 1, totalPages: totalPages ?? 1, count: totalItems ?? 0 }) }}
            </p>
        </section>
    </main>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable, { type DataTablePageEvent, type DataTableSortEvent } from 'primevue/datatable'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import { pb } from '@/services/pocketbase'
import useStore from '@/stores/useStore.ts'
import User from '@/schema/User'

const { t } = useI18n()

const page = ref(1)
const perPage = ref(5)
const sortField = ref('updated')
const sortOrder = ref(-1)
const searchInput = ref('')
const filters = ref('')

let searchTimer: ReturnType<typeof setTimeout> | undefined

const {
    data: users,
    error,
    isLoading,
    isPending,
    totalPages,
    totalItems,
    refetch,
} = useStore(User).read({ page, perPage, sortField, sortOrder, filters })

function onPage(event: DataTablePageEvent) {
    page.value = event.page + 1
    perPage.value = event.rows
}

function onSort(event: DataTableSortEvent) {
    sortField.value = typeof event.sortField === 'string' ? event.sortField : 'updated'
    sortOrder.value = event.sortOrder === -1 ? -1 : 1
}

function onSearchInput() {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        filters.value = searchInput.value
    }, 300)
}

onBeforeUnmount(() => clearTimeout(searchTimer))

const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' })

function formatDate(value: string) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

function initials(name = '') {
    return (
        name
            .trim()
            .split(/\s+/)
            .map(part => part[0] ?? '')
            .slice(0, 2)
            .join('')
            .toUpperCase() || '?'
    )
}

// shortcut: relative filenames are trusted only as PocketBase file names, not as URLs
function avatarSrc(record: User): string | undefined {
    const value = record.avatar
    if (!value) return undefined
    if (/^https?:\/\//i.test(value)) {
        try {
            return new URL(value).toString()
        } catch {
            return undefined
        }
    }
    if (!/^[\w.-]+$/.test(value)) return undefined
    return pb.files.getURL(record, value) || undefined
}
</script>

<style scoped>
.page {
    display: flex;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem 1rem;
    background: var(--p-surface-50, #f8fafc);
}

.panel {
    width: min(100%, 1100px);
    padding: 1.5rem;
    border: 1px solid var(--p-surface-200, #e5e7eb);
    border-radius: 1rem;
    background: var(--p-surface-0, #fff);
    box-shadow: 0 10px 30px rgb(15 23 42 / 6%);
}

.panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

h1 {
    margin: 0;
    font-size: 1.5rem;
}

.subtitle,
.summary {
    margin: 0.25rem 0 0;
    color: var(--p-surface-500, #64748b);
    font-size: 0.875rem;
}

.notice,
.search {
    margin-bottom: 1rem;
}

.search {
    max-width: 24rem;
}

.table-shell {
    border-radius: 0.75rem;
}

.empty {
    padding: 1rem;
    text-align: center;
    color: var(--p-surface-500, #64748b);
}

.summary {
    margin-top: 1rem;
}

:deep(.p-datatable) {
    font-size: 0.9rem;
}

@media (max-width: 640px) {
    .page {
        padding: 1rem 0.5rem;
    }

    .panel {
        padding: 1rem;
    }

    .panel-header {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
