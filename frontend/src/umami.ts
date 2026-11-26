// Injecte le tracker Umami seulement si le build fournit un website id.
export function loadUmami(): void {
    const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID
    const scriptUrl = import.meta.env.VITE_UMAMI_SCRIPT_URL
    if (!websiteId || !scriptUrl) return
    const script = document.createElement('script')
    script.src = `${scriptUrl}?website=${websiteId}`
    script.defer = true
    document.head.append(script)
}
