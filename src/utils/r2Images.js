import { API_BASE_URL } from '../config/env';

/**
 * Resolves an R2 image key/URL into a usable URL for the web frontend.
 * 
 * Handles:
 * - R2 keys (e.g. "profile/123_1234567890.jpg") → /api/r2_proxy.php?key=...
 * - Legacy full URLs with r2_proxy.php → extracts key and re-routes through proxy
 * - Already-valid external URLs (Google, Cloudflare, etc.) → returns as-is
 * - Null/empty → returns empty string
 * 
 * Mirrors the logic of UserService.getR2ImageUrl() from the Flutter app.
 */
export function getR2ImageUrl(r2Key) {
    if (!r2Key || typeof r2Key !== 'string' || r2Key.trim() === '') return '';

    let finalKey = r2Key.trim();

    // Handle legacy r2_proxy.php URLs → extract the key
    if (finalKey.includes('r2_proxy.php') && finalKey.includes('key=')) {
        try {
            const url = new URL(finalKey);
            const extracted = url.searchParams.get('key');
            if (extracted) finalKey = extracted;
        } catch { /* ignore parse errors */ }
    }

    // If it's already a valid external URL (not localhost/192.168/legacy), return as-is
    if (
        finalKey.startsWith('http') &&
        !finalKey.includes('192.168.') &&
        !finalKey.includes('localhost') &&
        !finalKey.includes('r2_proxy.php')
    ) {
        return finalKey;
    }

    // If it's a legacy full URL, extract just the path
    if (finalKey.startsWith('http')) {
        try {
            const url = new URL(finalKey);
            let path = url.pathname;
            // Remove /viax/backend prefix if present
            if (path.startsWith('/viax/backend/')) {
                path = path.substring('/viax/backend/'.length);
            } else if (path.startsWith('/')) {
                path = path.substring(1);
            }
            finalKey = path;
        } catch { /* ignore */ }
    }

    // Remove leading slash
    const cleanKey = finalKey.startsWith('/') ? finalKey.substring(1) : finalKey;

    // Build URL through the API proxy
    return `${API_BASE_URL}/r2_proxy.php?key=${encodeURIComponent(cleanKey)}`;
}
