import { expect, test } from '@playwright/test'
import { admin, mockAuth, signIn } from './helpers'

test('persists and toggles the dark theme', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('app.theme', 'dark'))
    await page.goto('/login')

    await expect(page.locator('html')).toHaveClass(/dark-mode/)
    await page.getByRole('button', { name: 'Switch to light mode' }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark-mode/)
    expect(await page.evaluate(() => localStorage.getItem('app.theme'))).toBe('light')
})

test('restores French from local storage', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('app.locale', 'fr'))
    await page.goto('/login')

    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible()
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')
})

test('opens the release notes from the navigation bar', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Show release notes' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Bilingual interface and dark mode')).toBeVisible()
})

test('changes the account password', async ({ page }) => {
    await mockAuth(page, admin)
    await page.route('**/api/collections/users/records/*', route => route.fulfill({ json: admin }))
    await signIn(page)
    await page.goto('/settings/password')

    const request = page.waitForRequest(
        req => req.url().includes('/api/collections/users/records/') && req.method() === 'PATCH',
    )
    await page.locator('#current-password').fill('old-password')
    await page.locator('#new-password').fill('new-password')
    await page.locator('#confirm-password').fill('new-password')
    await page.getByRole('button', { name: 'Save' }).click()

    expect((await request).postDataJSON()).toMatchObject({ oldPassword: 'old-password', password: 'new-password' })
    await expect(page.getByText('Changes saved successfully.')).toBeVisible()
})

test('requests an email change', async ({ page }) => {
    await mockAuth(page, admin)
    await page.route('**/api/collections/users/request-email-change', route => route.fulfill({ json: {} }))
    await signIn(page)
    await page.goto('/settings/email')

    const request = page.waitForRequest(req => req.url().includes('/request-email-change') && req.method() === 'POST')
    await page.locator('#new-email').fill('new@example.com')
    await page.getByRole('button', { name: 'Save' }).click()

    expect((await request).postDataJSON()).toEqual({ newEmail: 'new@example.com' })
    await expect(page.getByText('Changes saved successfully.')).toBeVisible()
})

test('changes the displayed name', async ({ page }) => {
    await mockAuth(page, admin)
    await page.route('**/api/collections/users/records/*', route =>
        route.fulfill({ json: { ...admin, name: 'Renamed' } }),
    )
    await signIn(page)
    await page.goto('/settings/username')

    await page.locator('#new-name').fill('Renamed')
    await page.getByRole('button', { name: 'Save' }).click()

    await expect(page.getByText('Changes saved successfully.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'User menu: Renamed' })).toBeVisible()
})
