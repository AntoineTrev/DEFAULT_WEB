import { expect, test } from '@playwright/test'
import { admin, fakeToken, mockAuth, regularUser, signIn } from './helpers'

test('signs in with a users account and reaches the protected home', async ({ page }) => {
    await mockAuth(page, admin)
    await signIn(page)

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()
    await expect(page.getByRole('link', { name: /View users/ })).toBeVisible()
})

test('shows an inline error when credentials are rejected', async ({ page }) => {
    await mockAuth(page, admin, 400)
    await signIn(page)

    await expect(page).toHaveURL(/\/login(\?|$)/)
    await expect(page.getByText('Invalid email or password.')).toBeVisible()
})

test('refuses a blocked account', async ({ page }) => {
    await mockAuth(page, { ...admin, blocked: true })
    await signIn(page)

    await expect(page.getByText('This account is blocked. Contact an administrator.')).toBeVisible()
    await expect(page).toHaveURL(/\/login(\?|$)/)
})

test('redirects anonymous visitors to the sign-in page', async ({ page }) => {
    await page.goto('/users')
    await expect(page).toHaveURL(/\/login(\?|$)/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
})

test('denies the users page to a non-admin account', async ({ page }) => {
    await mockAuth(page, regularUser)
    await signIn(page, 'alice@example.com')
    await expect(page).toHaveURL('/')

    await page.goto('/users')
    await expect(page).toHaveURL('/')
})

test('registers a new account and signs it in', async ({ page }) => {
    const token = fakeToken()
    await page.route('**/api/collections/users/records', route =>
        route.fulfill({ json: { ...regularUser, id: 'u-new' } }),
    )
    await page.route('**/api/collections/users/auth-with-password', route =>
        route.fulfill({ json: { token, record: regularUser } }),
    )
    await page.route('**/api/collections/users/auth-refresh', route =>
        route.fulfill({ json: { token, record: regularUser } }),
    )

    await page.goto('/register')
    await page.locator('#name').fill('Alice')
    await page.locator('#email').fill('alice@example.com')
    await page.locator('#password').fill('password123')
    await page.locator('#password-confirm').fill('password123')
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible()
})

test('logs out and requires a new sign-in', async ({ page }) => {
    await mockAuth(page, admin)
    await signIn(page)

    await page.getByRole('button', { name: 'User menu: Admin' }).click()
    await page.getByRole('menuitem', { name: 'Log out' }).click()

    await expect(page).toHaveURL(/\/login(\?|$)/)
    await page.goto('/')
    await expect(page).toHaveURL(/\/login(\?|$)/)
})
