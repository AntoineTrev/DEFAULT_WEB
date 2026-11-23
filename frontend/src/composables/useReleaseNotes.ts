import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ReleaseEntry } from './releaseNotesTypes'

const FALLBACK_LOCALE = 'en'

const modules = import.meta.glob<string>('../release-notes/**/*.md', {
    eager: true,
    query: '?raw',
    import: 'default',
})

function parseVersion(path: string): string | null {
    return path.match(/\/v([^/]+)\.md$/)?.[1] ?? null
}

function parseLocale(path: string): string | null {
    return path.match(/\/release-notes\/([^/]+)\//)?.[1] ?? null
}

function collect(locale: string, target: Map<string, ReleaseEntry>): void {
    for (const [path, content] of Object.entries(modules)) {
        const version = parseVersion(path)
        if (!version || parseLocale(path) !== locale) {
            continue
        }
        target.set(version, { version, content })
    }
}

function buildEntries(locale: string): ReleaseEntry[] {
    const entries = new Map<string, ReleaseEntry>()
    collect(FALLBACK_LOCALE, entries)
    if (locale !== FALLBACK_LOCALE) {
        collect(locale, entries)
    }
    return [...entries.values()].sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }))
}

export function useReleaseNotes() {
    const { locale } = useI18n()
    const entries = computed(() => buildEntries(locale.value))
    return { entries }
}
