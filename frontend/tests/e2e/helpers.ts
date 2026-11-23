import type { Page } from '@playwright/test'

export interface TestUser {
    id: string
    email: string
    name: string
    role?: string
    verified?: boolean
    blocked?: boolean
    created?: string
    updated?: string
}

export const admin: TestUser = {
    id: 'u-admin',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    verified: true,
    blocked: false,
    created: '2026-01-01T00:00:00.000Z',
    updated: '2026-01-01T00:00:00.000Z',
}

export const regularUser: TestUser = {
    id: 'u-user',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'user',
    verified: true,
    blocked: false,
    created: '2026-01-02T00:00:00.000Z',
    updated: '2026-01-02T00:00:00.000Z',
}

export function fakeToken(): string {
    const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
    return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ exp: Math.floor(Date.now() / 1000) + 3600, type: 'auth' })}.signature`
}

export async function mockAuth(page: Page, record: TestUser, loginStatus = 200): Promise<void> {
    const success = { token: fakeToken(), record }
    await page.route('**/api/collections/users/auth-with-password', route =>
        route.fulfill(
            loginStatus === 200
                ? { json: success }
                : { status: loginStatus, json: { code: loginStatus, message: 'Authentication failed.', data: {} } },
        ),
    )
    await page.route('**/api/collections/users/auth-refresh', route => route.fulfill({ json: success }))
}

export async function signIn(page: Page, identity = 'admin@example.com'): Promise<void> {
    await page.goto('/login')
    await page.locator('#identity').fill(identity)
    await page.locator('#password').fill('secret')
    await page.getByRole('button', { name: 'Sign in' }).click()
}
