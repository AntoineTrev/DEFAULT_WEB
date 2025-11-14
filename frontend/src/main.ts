import './styles.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import App from './App.vue'

import 'primeicons/primeicons.css'

import { getPocketClient } from '@/services/pocketbase'
await getPocketClient()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(PiniaColada)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
    },
})
app.use(ToastService)
app.mount('#app')
