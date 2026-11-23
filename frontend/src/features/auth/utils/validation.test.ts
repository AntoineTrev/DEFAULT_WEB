import { describe, expect, it } from 'vite-plus/test'
import { validateEmail, validateName, validatePassword, validatePasswordConfirm } from './validation'

describe('validation', () => {
    it('accepts valid emails with any TLD and rejects malformed ones', () => {
        expect(validateEmail('user@example.org')).toBe(true)
        expect(validateEmail('user.name@sub.example.co.uk')).toBe(true)
        expect(validateEmail('user@example')).toBe(false)
        expect(validateEmail('user @example.org')).toBe(false)
    })

    it('accepts 3 to 20 character names from the PocketBase pattern', () => {
        expect(validateName('abc')).toBe(true)
        expect(validateName('user.name-1_2')).toBe(true)
        expect(validateName('ab')).toBe(false)
        expect(validateName('user name')).toBe(false)
    })

    it('enforces a minimum password length of 8', () => {
        expect(validatePassword('12345678')).toBe(true)
        expect(validatePassword('1234567')).toBe(false)
    })

    it('checks confirmation against the password', () => {
        expect(validatePasswordConfirm('12345678', '12345678')).toBe(true)
        expect(validatePasswordConfirm('12345679', '12345678')).toBe(false)
        expect(validatePasswordConfirm('short', 'short')).toBe(false)
    })
})
