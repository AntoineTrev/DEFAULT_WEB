import { describe, expect, it } from 'vite-plus/test'
import { escapeHtml, markdownToHtml } from './releaseNotesMarkdown'

describe('releaseNotesMarkdown', () => {
    it('renders headings, paragraphs and lists', () => {
        expect(markdownToHtml('# Title\n\n- first\n- second')).toBe(
            '<h1>Title</h1><ul><li>first</li><li>second</li></ul>',
        )
    })

    it('renders bold and inline code', () => {
        expect(markdownToHtml('Use `vp build` for **production**')).toBe(
            '<p>Use <code>vp build</code> for <strong>production</strong></p>',
        )
    })

    it('escapes HTML before inserting markup', () => {
        const html = markdownToHtml('<script>alert(1)</script>')
        expect(html).not.toContain('<script>')
        expect(html).toContain('&lt;script&gt;')
    })

    it('escapes quotes and ampersands', () => {
        expect(escapeHtml(`"'&`)).toBe('&quot;&#39;&amp;')
    })
})
