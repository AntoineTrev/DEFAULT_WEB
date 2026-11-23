export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

function inlineMarkdown(value: string): string {
    return escapeHtml(value)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
}

export function markdownToHtml(md: string): string {
    const html: string[] = []
    let inList = false

    for (const rawLine of md.split(/\r?\n/)) {
        const line = rawLine.trimEnd()

        if (line.startsWith('- ')) {
            if (!inList) {
                html.push('<ul>')
                inList = true
            }
            html.push(`<li>${inlineMarkdown(line.slice(2))}</li>`)
            continue
        }

        if (inList) {
            html.push('</ul>')
            inList = false
        }

        if (line.startsWith('### ')) {
            html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`)
        } else if (line.startsWith('## ')) {
            html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`)
        } else if (line.startsWith('# ')) {
            html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`)
        } else if (line !== '') {
            html.push(`<p>${inlineMarkdown(line)}</p>`)
        }
    }

    if (inList) {
        html.push('</ul>')
    }

    return html.join('')
}
