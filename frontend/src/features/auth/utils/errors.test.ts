import { describe, expect, it } from 'vite-plus/test'
import { ClientResponseError } from 'pocketbase'
import { BlockedError } from '../types'
import { getAuthErrorMessage } from './errors'

const t = (key: string) => `msg:${key}`

describe('getAuthErrorMessage', () => {
    it('maps a blocked account', () => {
        expect(getAuthErrorMessage(new BlockedError(), t)).toBe('msg:auth.blocked')
    })

    it('maps auth failures', () => {
        for (const status of [400, 401, 429]) {
            expect(getAuthErrorMessage(new ClientResponseError({ status }), t)).toBe('msg:auth.failed')
        }
    })

    it('maps a forbidden response', () => {
        expect(getAuthErrorMessage(new ClientResponseError({ status: 403 }), t)).toBe('msg:users.forbidden')
    })

    it('maps PocketBase field validation errors', () => {
        const error = (data: object) => new ClientResponseError({ status: 400, data })
        expect(getAuthErrorMessage(error({ data: { email: { code: 'validation_email_not_unique' } } }), t)).toBe(
            'msg:auth.validation.emailTaken',
        )
        expect(getAuthErrorMessage(error({ data: { name: { code: 'validation_not_unique' } } }), t)).toBe(
            'msg:auth.validation.nameTaken',
        )
        expect(getAuthErrorMessage(error({ data: { password: { code: 'validation_length_out_of_range' } } }), t)).toBe(
            'msg:auth.validation.passwordTooShort',
        )
        expect(getAuthErrorMessage(error({ data: { passwordConfirm: { code: 'validation_values_match' } } }), t)).toBe(
            'msg:auth.validation.passwordMismatch',
        )
    })

    it('falls back to the generic auth message for unknown errors', () => {
        expect(getAuthErrorMessage(new TypeError('Failed to fetch'), t)).toBe('msg:auth.failed')
        expect(getAuthErrorMessage('oops', t)).toBe('msg:auth.failed')
    })
})
