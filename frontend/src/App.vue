<template>
    <main class="container">
        <h1>Site Web</h1>
        {{ users }}
        <button @click="featchUsers">refresh</button>
    </main>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getPocketClient, pb } from '@/core/pocketbase'

const users = ref<unknown[]>([])

onMounted(async () => {
    await getPocketClient()

    featchUsers()
})

const featchUsers = () => {
    pb()
        .collection('users')
        .getFullList()
        .then(response => {
            console.log('Successfull load ', response.length, ' users.')
            users.value = response
        })
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
