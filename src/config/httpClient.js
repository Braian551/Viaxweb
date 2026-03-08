export async function requestJson(url, options = {}, fallbackMessage = 'Error de conexión con el servidor') {
    try {
        const response = await fetch(url, options);

        if (response.status !== 200) {
            let details = '';
            let errorCode = null;
            try {
                const raw = (await response.text())?.trim();
                // Try to parse as JSON to extract a readable message
                if (raw && raw.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(raw);
                        details = parsed.message || raw;
                        errorCode = parsed.error_code || null;
                    } catch {
                        details = raw;
                    }
                } else {
                    details = raw || '';
                }
            } catch {
                details = '';
            }

            return {
                success: false,
                status: response.status,
                message: details || `Error HTTP ${response.status}`,
                ...(errorCode && { error_code: errorCode }),
            };
        }

        return await response.json();
    } catch (error) {
        console.error('HTTP request error:', error);
        return {
            success: false,
            message: fallbackMessage,
        };
    }
}
