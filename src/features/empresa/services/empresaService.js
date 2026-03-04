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
        const params = new URLSearchParams({ empresa_id: empresaId, incluir_solicitudes: 'true', page, per_page: perPage });
        const res = await fetch(`${API_BASE_URL}/company/conductores_documentos.php?${params}`, { headers: { Accept: 'application/json' } });
        const data = await res.json();

        if (!data?.success) {
            return data;
        }

        const conductores = data?.data?.conductores || [];
        const solicitudes = conductores.map((item) => {
            const estado = item?.es_solicitud_pendiente
                ? 'pendiente'
                : item?.estado_solicitud === 'rechazada' || item?.estado_verificacion === 'rechazado'
                    ? 'rechazada'
                    : item?.esta_vinculado || item?.estado_solicitud === 'aprobada' || item?.estado_verificacion === 'aprobado'
                        ? 'aprobada'
                        : 'pendiente';

            return {
                id: item?.solicitud_id || item?.usuario_id,
                conductor_id: item?.usuario_id,
                estado,
                es_solicitud_pendiente: Boolean(item?.es_solicitud_pendiente),
                fecha_solicitud: item?.fecha_solicitud || item?.usuario_creado_en,
                conductor_nombre: item?.nombre,
                conductor_apellido: item?.apellido,
                conductor_email: item?.email,
                conductor_foto: item?.foto_perfil,
                mensaje_conductor: item?.mensaje_conductor || '',
            };
        });

        return {
            ...data,
            data: {
                ...(data.data || {}),
                solicitudes,
            },
        };
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const gestionarSolicitud = async (empresaId, solicitudId, accion, motivo = '', procesadoPor = null) => {
    try {
        const mappedAction = accion === 'aprobar' ? 'aprobar_solicitud' : 'rechazar_solicitud';
        const res = await fetch(`${API_BASE_URL}/company/conductores_documentos.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                empresa_id: empresaId,
                conductor_id: solicitudId,
                accion: mappedAction,
                procesado_por: procesadoPor || empresaId,
                razon: motivo,
            })
        });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};
