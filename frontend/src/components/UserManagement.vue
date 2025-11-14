<template>
    <main class="p-4">
        <h1 class="text-2xl font-bold mb-4">Utilisateurs</h1>

        <div class="mb-2">
            <span>isValid : {{ isValid }}</span>
            |
            <span>isSuperuser : {{ isSuperuser }}</span>
            |
            <span>Status : {{ status }}</span>
        </div>

        <DataTable
            :value="users"
            :lazy="true"
            :loading="isLoading || isPending"
            :totalRecords="totalItems"
            :rows="perPage"
            :first="(page - 1) * perPage"
            paginator
            :rowsPerPageOptions="[5, 10, 20]"
            dataKey="id"
            @page="onPage"
            @sort="onSort"
            sortMode="single"
            class="shadow-md rounded-2xl">
            <template #empty>
                <div class="text-center p-4">Aucun utilisateur trouvé.</div>
            </template>

            <Column
                field="avatar"
                header="Avatar"
                style="width: 100px">
                <template #body="{ data }">
                    <img
                        v-if="data.avatar"
                        :src="data.avatar"
                        alt="avatar"
                        class="w-10 h-10 rounded-full" />
                </template>
            </Column>

            <Column
                field="name"
                header="Nom"
                sortable />
            <Column
                field="email"
                header="Email"
                sortable />

            <Column
                field="verified"
                header="Vérifié"
                sortable>
                <template #body="{ data }">
                    <span :class="data.verified ? 'text-green-600' : 'text-red-500'">
                        {{ data.verified ? 'Oui' : 'Non' }}
                    </span>
                </template>
            </Column>

            <Column
                field="updated"
                header="Dernière mise à jour"
                sortable>
                <template #body="{ data }">
                    {{ new Date(data.updated).toLocaleString() }}
                </template>
            </Column>
        </DataTable>

        <div class="mt-4">
            <Button
                label="Refetch"
                @click="refetch"
                icon="pi pi-refresh" />
        </div>

        <div class="mt-2 text-sm text-gray-600">Page {{ page }} / {{ totalPages }} — {{ totalItems }} utilisateurs</div>
    </main>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { pb } from '@/services/pocketbase'
import Column from 'primevue/column'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import useStore from '@/stores/useStore.ts'
import User from '@/schema/User'

const page = ref(1)
const perPage = ref(5)
const sortField = ref('updated')
const sortOrder = ref(-1)

const {
    data: users,
    isLoading,
    error,
    status,
    isPending,
    isPlaceholderData,
    totalPages,
    totalItems,
    refetch,
} = useStore(User).read({
    page,
    perPage,
    sortField,
    sortOrder,
})

function onPage(event: any) {
    page.value = event.page + 1
    perPage.value = event.rows
    refetch()
}

function onSort(event: any) {
    console.log(event)
    sortField.value = event.sortField
    sortOrder.value = event.sortOrder
    refetch()
}

const isValid = computed(() => pb().authStore.isValid)
const isSuperuser = computed(() => pb().authStore.isSuperuser)
</script>

<style scoped>
:deep(.p-datatable) {
    font-size: 0.9rem;
}
</style>
