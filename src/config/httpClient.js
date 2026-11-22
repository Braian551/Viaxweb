export const SESSION_EXPIRED_EVENT = 'viax:session-expired';

const errorMessage = (status, message, fallback, sessionRequired) => {
    if (status === 401 && sessionRequired) return 'Tu sesión venció. Inicia sesión para continuar.';
    if (status === 403) return 'No tienes permiso para realizar esta acción.';
    if (status === 404 || status >= 500) return 'Esta función no está disponible por el momento.';
    return typeof message === 'string' && message.length <= 240 && !/[<>]/.test(message)
        ? message
        : fallback;
};

export async function requestJson(url, options = {}, fallback = 'Error de conexión con el servidor.') {
    const { sessionRequired = false, ...fetchOptions } = options;

    try {
        const response = await fetch(url, { credentials: 'same-origin', ...fetchOptions });
        const contentType = response.headers.get('content-type') ?? '';
        const data = /(?:\/json|\+json)(?:;|$)/i.test(contentType)
            ? await response.json().catch(() => null)
            : null;

        if (response.ok && data && typeof data === 'object') return data;

        if (response.status === 401 && sessionRequired) {
            globalThis.dispatchEvent?.(new Event(SESSION_EXPIRED_EVENT));
        }
        return {
            success: false,
            status: response.status,
            message: errorMessage(response.status, data?.message ?? data?.error, fallback, sessionRequired),
            ...(typeof data?.error_code === 'string' ? { error_code: data.error_code } : {}),
        };
    } catch {
        return { success: false, message: fallback };
    }
}
