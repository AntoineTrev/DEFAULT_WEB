import { useToast } from 'primevue/usetoast'

interface RetryPolicyOptions {
    maxRetries?: number
    baseDelay?: number // en ms
    factor?: number
}

export class ApiErrorHandler {
    private static get toast() {
        return useToast()
    }

    private static isPermanent(error: any): boolean {
        const status = error?.status ?? error?.response?.status
        return (
            Boolean(error?.isAbort) || (typeof status === 'number' && status >= 400 && status < 500 && status !== 429)
        )
    }

    static logError(error: Record<string, any> | string, context?: string) {
        console.error(`[API Error] ${context ?? ''}`, error)
    }

    static showToast(error: Record<string, any> | string, context?: string) {
        const message =
            typeof error === 'string' ? error : error?.message || error?.response?.message || 'Unknown error'

        this.toast.add({
            severity: 'error',
            summary: context ?? 'Error API',
            detail: message,
            life: 5000,
        })
    }

    static async withRetry<T>(
        fn: () => Promise<T>,
        options: RetryPolicyOptions = { maxRetries: 3, baseDelay: 300, factor: 2 },
        context?: string,
    ): Promise<T> {
        const { maxRetries = 3, baseDelay = 300, factor = 2 } = options

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn()
            } catch (error: any) {
                this.logError(error, context)
                if (this.isPermanent(error) || attempt === maxRetries) {
                    this.showToast(error, context)
                    throw error
                }

                const delay = baseDelay * Math.pow(factor, attempt)
                console.warn(`Retrying (${attempt + 1}/${maxRetries}) in ${delay}ms...`)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }

        throw new Error('Max retry')
    }
}
