import './styles.scss'
import 'primeicons/primeicons.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import App from './App.vue'
import { i18n } from '@/i18n'

const app = createApp(App)
app.use(createPinia())
app.use(PiniaColada)
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: { darkModeSelector: '.dark-mode' },
    },
})
app.use(ToastService)
app.use(i18n)
app.mount('#app')
