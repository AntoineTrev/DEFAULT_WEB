<template>
    <main>
        <h1>Site Web</h1>
        <br />
        <span>isValid : {{ isValid }}</span>
        <br />
        <span>isSuperuser : {{ isSuperuser }}</span>
        <br />
        <span>{{ status }}</span>
        <br />
        <span>isPlaceholderData : {{ isPlaceholderData }}</span>
        <br />
        <span>Page {{ page }}/{{ totalPages }}</span>
        <br />
        <span>Items {{ perPage }}/{{ totalItems }}</span>
        <br />
        <button @click="refetch">Refetch</button>
        <br />
        <span v-if="isLoading || isPending">Loading...</span>
        <span v-else-if="error">Error : {{ error.message }}</span>
        <span v-else-if="!users || users.length === 0">No user found !</span>
        <ul v-else>
            <li
                v-for="user in users"
                :key="user.id">
                <pre>{{ user }}</pre>
            </li>
        </ul>
    </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import User from '@/schema/User.ts'
import { pb } from '@/services/pocketbase'

const {
    data: users,
    isLoading,
    error,
    status,
    isPending,
    isPlaceholderData,
    page,
    totalPages,
    perPage,
    totalItems,
    refetch,
} = User.useRead({ page: 2, perPage: 5, sortField: 'updated', sortOrder: -1 })

const isValid = computed(() => pb().authStore.isValid)
const isSuperuser = computed(() => pb().authStore.isSuperuser)
</script>
