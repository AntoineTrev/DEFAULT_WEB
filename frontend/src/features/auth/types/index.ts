export interface AuthUser {
    id: string
    name: string
    email: string
    verified: boolean
    role: string
    blocked: boolean
    created: string
    updated: string
    lastLogin: string
}

export interface LoginPayload {
    identity: string
    password: string
}

export interface RegisterPayload {
    name: string
    email: string
    password: string
    passwordConfirm: string
}

export interface ChangePasswordPayload {
    oldPassword: string
    newPassword: string
    newPasswordConfirm: string
}

export interface ChangeEmailPayload {
    newEmail: string
}

export interface ChangeNamePayload {
    name: string
}

export class BlockedError extends Error {
    constructor() {
        super('blocked')
        this.name = 'BlockedError'
    }
}
