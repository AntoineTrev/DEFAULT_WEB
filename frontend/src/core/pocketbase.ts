// src/pocket/client.ts
import PocketBase from 'pocketbase'

const PB_URL = `http://localhost:${import.meta.env.VITE_BACKEND_PORT}`
const DEFAULT_ADMIN_EMAIL = import.meta.env.VITE_BACKEND_ADMIN_EMAIL
const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_BACKEND_ADMIN_PASSWORD

let _pb: PocketBase | null = null
export async function getPocketClient(): Promise<PocketBase> {
    if (_pb) return _pb

    _pb = new PocketBase(PB_URL)

    try {
        if (!_pb.authStore.isValid) {
            await _pb.admins.authWithPassword(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)
            console.log('[PocketBase] Auth OK:', DEFAULT_ADMIN_EMAIL)
        }
    } catch (err) {
        console.error('[PocketBase] Impossible de se connecter', err)
    }

    return _pb
}

export function pb(): PocketBase {
    if (!_pb) throw new Error('PocketBase non initialisé. Appelle getPocketClient() d’abord.')
    return _pb
}
