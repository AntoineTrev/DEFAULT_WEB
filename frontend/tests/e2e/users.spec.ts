import { expect, test, type Page } from '@playwright/test'

const users = [
    {
        id: 'u1',
        email: 'alice@example.com',
        name: 'Alice',
        avatar: '',
        verified: true,
        updated: '2026-01-01T00:00:00.000Z',
    },
    {
        id: 'u2',
        email: 'bob@example.com',
        name: 'Bob',
        avatar: '',
        verified: false,
        updated: '2026-01-02T00:00:00.000Z',
    },
]

async function mockPocketBase(page: Page, items: typeof users) {
    await page.route('**/api/collections/_superusers/auth-with-password', route =>
        route.fulfill({ json: { token: '', record: {}, meta: {} } }),
    )
    await page.route('**/api/collections/users/records*', route =>
        route.fulfill({
            json: { page: 1, perPage: 5, totalItems: items.length, totalPages: 1, items },
        }),
    )
}

test('affiche les utilisateurs renvoyés par PocketBase', async ({ page }) => {
    await mockPocketBase(page, users)

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Utilisateurs' })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Alice', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: 'bob@example.com' })).toBeVisible()
    await expect(page.getByText('2 utilisateurs')).toBeVisible()
})

test('affiche un état vide quand PocketBase ne renvoie aucun utilisateur', async ({ page }) => {
    await mockPocketBase(page, [])

    await page.goto('/')

    await expect(page.getByText('Aucun utilisateur trouvé.')).toBeVisible()
})
