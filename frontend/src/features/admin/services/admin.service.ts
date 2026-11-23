import { pb } from '@/services/pocketbase'

export class AdminError extends Error {
    constructor(
        readonly status: number,
        message: string,
    ) {
        super(message)
    }
}

export interface AdminUser {
    id: string
    name: string
    email: string
    verified: boolean
    blocked: boolean
    created: string
    updated: string
    lastLogin?: string
}

async function adminRequest(path: string, init: RequestInit = {}): Promise<Response> {
    const response = await fetch(`/admin-api${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${pb.authStore.token}`,
        },
    })

    if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null
        throw new AdminError(response.status, body?.error ?? `Admin request failed (${response.status})`)
    }
    return response
}

export async function listUsers(): Promise<{ items: AdminUser[] }> {
    const response = await adminRequest('/users')
    return response.json()
}

export async function setBlocked(id: string, blocked: boolean): Promise<void> {
    await adminRequest(`/users/${encodeURIComponent(id)}/blocked`, {
        method: 'PATCH',
        body: JSON.stringify({ blocked }),
    })
}
