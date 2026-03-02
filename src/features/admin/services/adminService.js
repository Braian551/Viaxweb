import { API_BASE_URL } from '../../../config/env';

/**
 * Obtiene las estadísticas generales del dashboard para el administrador.
 * @param {number|string} adminId - ID del administrador realizando la petición.
 */
export const getDashboardStats = async (adminId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard_stats.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ admin_id: adminId }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, message: 'Fallo al conectar con el servidor', data: null };
    }
};

/**
 * Obtiene la lista de usuarios con paginación y filtros.
 */
export const getUsers = async (adminId, { page = 1, perPage = 20, search = '', tipoUsuario = '' } = {}) => {
    try {
        // GET params
        const params = new URLSearchParams({
            admin_id: adminId,
            page,
            per_page: perPage
        });

        if (search) params.append('search', search);
        if (tipoUsuario) params.append('tipo_usuario', tipoUsuario);

        const response = await fetch(`${API_BASE_URL}/admin/user_management.php?${params.toString()}`, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching users:', error);
        return { success: false, message: 'Fallo al conectar con el servidor', data: null };
    }
};

/**
 * Obtiene la lista de empresas con paginación y filtros.
 */
export const getCompanies = async (adminId, { page = 1, limit = 20, search = '', estado = '' } = {}) => {
    try {
        const params = new URLSearchParams({
            action: 'list',
            admin_id: adminId,
            page,
            limit
        });

        if (search) params.append('search', search);
        if (estado) params.append('estado', estado);

        const response = await fetch(`${API_BASE_URL}/admin/empresas.php?${params.toString()}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching companies:', error);
        return { success: false, message: 'Fallo al conectar con el servidor', data: null };
    }
};

/**
 * Obtiene las ganancias y finanzas de la plataforma.
 */
export const getPlatformEarnings = async (adminId, periodo = 'mes') => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/platform_earnings.php?admin_id=${adminId}&periodo=${periodo}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching platform earnings:', error);
        return { success: false, message: 'Fallo al conectar con el servidor', data: null };
    }
};

/**
 * Obtiene los logs de auditoría del sistema con paginación y filtros.
 */
export const getAuditLogs = async (adminId, { page = 1, perPage = 20, accion = '', fechaDesde = '', fechaHasta = '' } = {}) => {
    try {
        const params = new URLSearchParams({
            admin_id: adminId,
            page,
            per_page: perPage
        });

        if (accion) params.append('accion', accion);
        if (fechaDesde) params.append('fecha_desde', fechaDesde);
        if (fechaHasta) params.append('fecha_hasta', fechaHasta);

        const response = await fetch(`${API_BASE_URL}/admin/audit_logs.php?${params.toString()}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return { success: false, message: 'Fallo al conectar con el servidor', data: null };
    }
};

/**
 * Obtiene la lista de conductores y sus documentos con paginación y filtros.
 */
export const getConductorsDocuments = async (adminId, { page = 1, perPage = 20, estado = '' } = {}) => {
    try {
        const params = new URLSearchParams({
            admin_id: adminId,
            page,
            per_page: perPage
        });

        if (estado) params.append('estado_verificacion', estado);

        const response = await fetch(`${API_BASE_URL}/admin/get_conductores_documentos.php?${params.toString()}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching conductors documents:', error);
        return { success: false, message: 'Fallo al conectar con el servidor', data: null };
    }
};

/**
 * Aprueba a un conductor
 */
export const approveConductor = async (adminId, conductorId) => {
    try {
        const params = new URLSearchParams({
            admin_id: adminId,
            conductor_id: conductorId
        });
        const response = await fetch(`${API_BASE_URL}/admin/aprobar_conductor.php?${params.toString()}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });
        return await response.json();
    } catch (error) {
        console.error('Error approving conductor:', error);
        return { success: false, message: 'Fallo al conectar con el servidor' };
    }
};

/**
 * Rechaza a un conductor
 */
export const rejectConductor = async (adminId, conductorId, motivoRechazo) => {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/rechazar_conductor.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                admin_id: adminId,
                conductor_id: conductorId,
                motivo_rechazo: motivoRechazo
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error rejecting conductor:', error);
        return { success: false, message: 'Fallo al conectar con el servidor' };
    }
};
