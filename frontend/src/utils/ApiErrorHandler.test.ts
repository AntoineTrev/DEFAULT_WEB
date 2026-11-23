import { beforeEach, describe, expect, it, vi } from 'vite-plus/test'

const { add } = vi.hoisted(() => ({ add: vi.fn() }))
vi.mock('primevue/usetoast', () => ({ useToast: () => ({ add }) }))

import { ApiErrorHandler } from './ApiErrorHandler'

describe('ApiErrorHandler.withRetry', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        add.mockClear()
        vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('ne réessaie pas quand la promesse réussit', async () => {
        const fn = vi.fn().mockResolvedValue('ok')

        await expect(ApiErrorHandler.withRetry(fn, { maxRetries: 2, baseDelay: 0 })).resolves.toBe('ok')
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it('réessaie après un échec puis retourne le résultat', async () => {
        const fn = vi.fn().mockRejectedValueOnce(new Error('temporaire')).mockResolvedValue('ok')

        await expect(ApiErrorHandler.withRetry(fn, { maxRetries: 1, baseDelay: 0 })).resolves.toBe('ok')
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it('affiche un toast et propage l’erreur après épuisement des tentatives', async () => {
        const error = new Error('final')

        await expect(
            ApiErrorHandler.withRetry(vi.fn().mockRejectedValue(error), { maxRetries: 0, baseDelay: 0 }, 'Fetch users'),
        ).rejects.toBe(error)

        expect(add).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'error', summary: 'Fetch users', detail: 'final' }),
        )
    })
})
