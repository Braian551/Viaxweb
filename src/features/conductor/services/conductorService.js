import { API_BASE_URL } from '../../../config/env';

export const getEstadisticas = async (conductorId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/conductor/get_estadisticas.php?conductor_id=${conductorId}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const getGanancias = async (conductorId, fechaInicio, fechaFin) => {
    try {
        const params = new URLSearchParams({ conductor_id: conductorId, fecha_inicio: fechaInicio, fecha_fin: fechaFin });
        const res = await fetch(`${API_BASE_URL}/conductor/get_ganancias.php?${params}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const getHistorial = async (conductorId, { page = 1, perPage = 10 } = {}) => {
    try {
        const params = new URLSearchParams({ conductor_id: conductorId, page, per_page: perPage });
        const res = await fetch(`${API_BASE_URL}/conductor/get_historial.php?${params}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const getConductorProfile = async (conductorId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/conductor/get_profile.php?conductor_id=${conductorId}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};
