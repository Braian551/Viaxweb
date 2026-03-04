import { API_BASE_URL } from '../../../config/env';
import { requestJson } from '../../../config/httpClient';

export const getEstadisticas = async (conductorId) => {
    return await requestJson(`${API_BASE_URL}/conductor/get_estadisticas.php?conductor_id=${conductorId}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const getGanancias = async (conductorId, fechaInicio, fechaFin) => {
    const params = new URLSearchParams({ conductor_id: conductorId, fecha_inicio: fechaInicio, fecha_fin: fechaFin });
    return await requestJson(`${API_BASE_URL}/conductor/get_ganancias.php?${params}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const getHistorial = async (conductorId, { page = 1, perPage = 10 } = {}) => {
    const params = new URLSearchParams({ conductor_id: conductorId, page, per_page: perPage });
    return await requestJson(`${API_BASE_URL}/conductor/get_historial.php?${params}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const getConductorProfile = async (conductorId) => {
    return await requestJson(`${API_BASE_URL}/conductor/get_profile.php?conductor_id=${conductorId}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};
