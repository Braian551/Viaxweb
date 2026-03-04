export async function requestJson(url, options = {}, fallbackMessage = 'Error de conexión con el servidor') {
    try {
        const response = await fetch(url, options);

        if (response.status !== 200) {
            let details = '';
            try {
                details = (await response.text())?.trim();
            } catch {
                details = '';
            }

            return {
                success: false,
                status: response.status,
                message: details || `Error HTTP ${response.status}`,
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
