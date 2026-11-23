import type { RecordModel } from 'pocketbase'
import { pb } from '@/services/pocketbase'
import { BlockedError, type AuthUser, type RegisterPayload } from '../types'

const USERS = 'users'

function toAuthUser(record: RecordModel): AuthUser {
    return {
        id: String(record.id ?? ''),
        name: String(record.name ?? ''),
        email: String(record.email ?? ''),
        verified: Boolean(record.verified),
        role: String(record.role ?? 'user'),
        blocked: Boolean(record.blocked),
        created: String(record.created ?? ''),
        updated: String(record.updated ?? ''),
        lastLogin: String(record.lastLogin ?? ''),
    }
}

function requireUserId(): string {
    const id = pb.authStore.record?.id
    if (!id) throw new Error('Not authenticated')
    return id
}

export const authService = {
    async login(identity: string, password: string): Promise<AuthUser> {
        const { record } = await pb.collection(USERS).authWithPassword<RecordModel>(identity, password)
        const user = toAuthUser(record)
        if (user.blocked) {
            pb.authStore.clear()
            throw new BlockedError()
        }
        return user
    },

    async register(payload: RegisterPayload): Promise<AuthUser> {
        await pb.collection(USERS).create<RecordModel>({
            name: payload.name,
            email: payload.email,
            password: payload.password,
            passwordConfirm: payload.passwordConfirm,
        })
        const { record } = await pb.collection(USERS).authWithPassword<RecordModel>(payload.email, payload.password)
        return toAuthUser(record)
    },

    logout(): void {
        pb.authStore.clear()
    },

    async refresh(): Promise<AuthUser> {
        const { record } = await pb.collection(USERS).authRefresh<RecordModel>()
        const user = toAuthUser(record)
        if (user.blocked) {
            pb.authStore.clear()
            throw new BlockedError()
        }
        return user
    },

    getCurrentUser(): AuthUser | null {
        const record = pb.authStore.record
        return record?.id ? toAuthUser(record) : null
    },

    async changePassword(oldPassword: string, newPassword: string, newPasswordConfirm: string): Promise<void> {
        await pb.collection(USERS).update(requireUserId(), {
            oldPassword,
            password: newPassword,
            passwordConfirm: newPasswordConfirm,
        })
    },

    async requestEmailChange(newEmail: string): Promise<void> {
        await pb.collection(USERS).requestEmailChange(newEmail)
    },

    async changeName(name: string): Promise<AuthUser> {
        const record = await pb.collection(USERS).update<RecordModel>(requireUserId(), { name })
        return toAuthUser(record)
    },
}
