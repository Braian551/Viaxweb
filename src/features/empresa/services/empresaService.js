import { API_BASE_URL } from '../../../config/env';

export const getEmpresaProfile = async (empresaId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/empresa/profile.php?empresa_id=${empresaId}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const getEmpresaSettings = async (empresaId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/empresa/settings.php?empresa_id=${empresaId}&action=get_settings`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const updateEmpresaSettings = async (data) => {
    try {
        const res = await fetch(`${API_BASE_URL}/empresa/settings.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...data, action: 'update_settings' })
        });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const getConductoresEmpresa = async (empresaId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/conductor/get_pendientes_empresa.php?empresa_id=${empresaId}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const getSolicitudesVinculacion = async (empresaId, { page = 1, perPage = 20 } = {}) => {
    try {
        const params = new URLSearchParams({ empresa_id: empresaId, action: 'listar', page, per_page: perPage });
        const res = await fetch(`${API_BASE_URL}/conductor/solicitudes_vinculacion.php?${params}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const gestionarSolicitud = async (empresaId, solicitudId, accion, motivo = '') => {
    try {
        const res = await fetch(`${API_BASE_URL}/conductor/solicitudes_vinculacion.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ empresa_id: empresaId, solicitud_id: solicitudId, action: accion, motivo_rechazo: motivo })
        });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};
