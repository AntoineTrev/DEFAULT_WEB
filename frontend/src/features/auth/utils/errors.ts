import { ClientResponseError } from 'pocketbase'
import { BlockedError } from '../types'

export type Translator = (key: string) => string

function fieldErrorCode(data: unknown, field: string): string | undefined {
    const fields = (data as { data?: Record<string, unknown> } | null)?.data
    const code = (fields?.[field] as { code?: unknown } | undefined)?.code
    return typeof code === 'string' ? code : undefined
}

export function getAuthErrorMessage(error: unknown, t: Translator): string {
    if (error instanceof BlockedError) return t('auth.blocked')

    const status = (error as { status?: unknown })?.status
    if (status === 403) return t('users.forbidden')

    if (error instanceof ClientResponseError) {
        if (error.status === 403) return t('users.forbidden')
        if (error.status === 400) {
            const emailCode = fieldErrorCode(error.data, 'email')
            if (emailCode)
                return t(
                    emailCode.includes('not_unique') ? 'auth.validation.emailTaken' : 'auth.validation.emailInvalid',
                )
            if (fieldErrorCode(error.data, 'passwordConfirm')) return t('auth.validation.passwordMismatch')
            if (fieldErrorCode(error.data, 'password')) return t('auth.validation.passwordTooShort')
            if (fieldErrorCode(error.data, 'name')) return t('auth.validation.nameTaken')
        }
        // 400 (including auth failures), 401 and 429 share the same user-facing message.
        return t('auth.failed')
    }

    return t('auth.failed')
}
