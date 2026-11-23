import { expect, test, type Page } from '@playwright/test'
import { admin, mockAuth, signIn, type TestUser } from './helpers'

const users: TestUser[] = [
    { ...admin, id: 'u1', name: 'Alice', email: 'alice@example.com', role: 'user' },
    {
        id: 'u2',
        name: 'Bob',
        email: 'bob@example.com',
        role: 'user',
        verified: false,
        blocked: true,
        created: '2026-01-02T00:00:00.000Z',
        updated: '2026-01-02T00:00:00.000Z',
    },
]

async function mockAdminApi(page: Page, items: TestUser[], status = 200): Promise<void> {
    await page.route('**/admin-api/users', route =>
        route.fulfill(
            status === 200 ? { json: { items } } : { status, json: { error: 'Forbidden: admin role required.' } },
        ),
    )
    await page.route('**/admin-api/users/*/blocked', route => {
        const id = route.request().url().split('/users/')[1]?.split('/')[0]
        const item = items.find(user => user.id === id)
        return route.fulfill({ json: { item: { ...item, blocked: !item?.blocked } } })
    })
}

async function openUsers(page: Page): Promise<void> {
    await mockAuth(page, admin)
    await signIn(page)
    await page.getByRole('link', { name: /View users/ }).click()
    await expect(page).toHaveURL(/\/users$/)
}

test('lists users returned by the admin gateway', async ({ page }) => {
    await mockAdminApi(page, users)
    await openUsers(page)

    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'bob@example.com' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Blocked' })).toBeVisible()
})

test('shows the empty state when the gateway returns no users', async ({ page }) => {
    await mockAdminApi(page, [])
    await openUsers(page)

    await expect(page.getByText('No users found.')).toBeVisible()
})

test('blocks a user through the gateway with the admin token', async ({ page }) => {
    await mockAdminApi(page, users)
    await openUsers(page)

    const request = page.waitForRequest(
        req => req.url().includes('/admin-api/users/u1/blocked') && req.method() === 'PATCH',
    )
    await page.getByRole('row').filter({ hasText: 'Alice' }).getByRole('button', { name: 'Block' }).click()
    await page.getByRole('dialog').getByRole('button', { name: 'Block' }).click()

    const patch = await request
    expect(await patch.postDataJSON()).toEqual({ blocked: true })
    expect(patch.headers().authorization).toMatch(/^Bearer /)
})

test('shows a permission error when the gateway refuses the request', async ({ page }) => {
    await mockAdminApi(page, [], 403)
    await openUsers(page)

    await expect(page.getByText('You do not have permission to perform this action.')).toBeVisible()
})
