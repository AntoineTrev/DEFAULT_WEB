// Permissive email check (any TLD), aligned with PocketBase's server validation.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Matches the PocketBase `users.name` field pattern.
const NAME_RE = /^[a-zA-Z0-9_.-]{3,20}$/
const MIN_PASSWORD_LENGTH = 8

export function validateEmail(email: string): boolean {
    return EMAIL_RE.test(email)
}

export function validateName(name: string): boolean {
    return NAME_RE.test(name)
}

export function validatePassword(password: string): boolean {
    return password.length >= MIN_PASSWORD_LENGTH
}

export function validatePasswordConfirm(confirm: string, password: string): boolean {
    return confirm === password && validatePassword(password)
}
