import PocketBase from 'pocketbase'

// Relative base URL: /api is proxied by Vite in dev and Caddy in prod, so no
// backend host or port (and no credentials) ever reaches the browser bundle.
export const pb = new PocketBase()
