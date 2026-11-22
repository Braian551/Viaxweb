const LEGACY_BASE = 'https://viaxcol.online';

export function resolveR2ImageUrl(value, apiBase) {
    if (typeof value !== 'string') return '';
    let key = value.trim();

    for (let depth = 0; depth < 4 && key; depth += 1) {
        const isProxy = /r2_proxy\.php/i.test(key);
        if (!isProxy && (/^https?:\/\//i.test(key) || !key.includes('%'))) break;
        const previous = key;
        try {
            const url = new URL(key, LEGACY_BASE);
            if (/\/r2_proxy\.php$/i.test(url.pathname)) {
                key = (url.searchParams.get('key') ?? '').trim();
            } else {
                key = decodeURIComponent(key);
            }
        } catch {
            return '';
        }
        if (key === previous) return '';
    }

    if (!key || /r2_proxy\.php/i.test(key)) return '';
    if (/^https?:\/\//i.test(key)) {
        try {
            const url = new URL(key);
            if (!/^(localhost|127\.|192\.168\.)/.test(url.hostname)) {
                return url.href;
            }
            key = url.pathname.replace(/^\/viax\/backend\//, '');
        } catch {
            return '';
        }
    } else if (key.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(key)) {
        return '';
    }

    const cleanKey = key.replace(/^\/+/, '');
    return cleanKey ? `${apiBase}/r2_proxy.php?key=${encodeURIComponent(cleanKey)}` : '';
}
