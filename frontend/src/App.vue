<template>
    <main class="container">
        <h1>Site Web</h1>
        {{ users }}
        <button @click="featchUsers">refresh</button>
    </main>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import PocketBase from 'pocketbase'
import { getPocketClient, pb } from '@/core/pocketbase'

const users = ref<unknown[]>([])

onMounted(async () => {
    const pocketbase = await getPocketClient()

    await featchUsers(pocketbase)
})

const featchUsers = async (pocketbase: PocketBase | undefined = undefined): Promise<unknown[]> => {
    if (!pocketbase) {
        pocketbase = pb()
    }
    const response = await pocketbase.collection('users').getFullList()
    console.log(response)
    users.value = response
    return response
}
</script>

<style scoped>
.container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
