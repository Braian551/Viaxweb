import { API_BASE_URL } from '../../../config/env';
import { requestJson } from '../../../config/httpClient';

/**
 * Obtiene las estadísticas generales del dashboard para el administrador.
 * @param {number|string} adminId - ID del administrador realizando la petición.
 */
export const getDashboardStats = async (adminId) => {
    return await requestJson(
        `${API_BASE_URL}/admin/dashboard_stats.php`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ admin_id: adminId }),
        },
        'Fallo al conectar con el servidor'
    );
};

/**
 * Obtiene la lista de usuarios con paginación y filtros.
 */
export const getUsers = async (adminId, { page = 1, perPage = 20, search = '', tipoUsuario = '' } = {}) => {
    const params = new URLSearchParams({
        admin_id: adminId,
        page,
        per_page: perPage
    });

    if (search) params.append('search', search);
    if (tipoUsuario) params.append('tipo_usuario', tipoUsuario);

    return await requestJson(
        `${API_BASE_URL}/admin/user_management.php?${params.toString()}`,
        {
            method: 'GET',
            headers: { Accept: 'application/json' },
        },
        'Fallo al conectar con el servidor'
    );
};

/**
 * Actualiza datos de un usuario (misma lógica que app móvil: PUT user_management.php)
 */
export const updateUser = async (adminId, userId, payload = {}) => {
    return await requestJson(
        `${API_BASE_URL}/admin/user_management.php`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                admin_id: adminId,
                user_id: userId,
                ...payload,
            }),
        },
        'Fallo al conectar con el servidor'
    );
};

/**
 * Activa o desactiva un usuario usando updateUser (es_activo)
 */
export const toggleUserStatus = async (adminId, userId, isActive) => {
    return updateUser(adminId, userId, { es_activo: isActive ? 1 : 0 });
};

/**
 * Obtiene la lista de empresas con paginación y filtros.
 */
export const getCompanies = async (adminId, { page = 1, limit = 20, search = '', estado = '' } = {}) => {
    const params = new URLSearchParams({
        action: 'list',
        admin_id: adminId,
        page,
        limit
    });

    if (search) params.append('search', search);
    if (estado) params.append('estado', estado);

    return await requestJson(
        `${API_BASE_URL}/admin/empresas.php?${params.toString()}`,
        {
            method: 'GET',
            headers: { Accept: 'application/json' },
        },
        'Fallo al conectar con el servidor'
    );
};

/**
 * Obtiene las ganancias y finanzas de la plataforma.
 */
export const getPlatformEarnings = async (adminId, periodo = 'mes') => {
    try {
        const primary = await requestJson(
            `${API_BASE_URL}/admin/platform_earnings.php?periodo=${periodo}`,
            { method: 'GET', headers: { Accept: 'application/json' } },
            'Fallo al conectar con el servidor'
        );

        if (primary?.success !== false) return primary;

        // Fallback para despliegues con rewrite sin extensión .php
        return await requestJson(
            `${API_BASE_URL}/admin/platform_earnings?periodo=${periodo}`,
            { method: 'GET', headers: { Accept: 'application/json' } },
            'Fallo al conectar con el servidor'
        );
    } catch (error) {
        console.error('Error fetching platform earnings:', error);
        return { success: false, message: 'Fallo al conectar con el servidor', data: null };
    }
};

/**
 * Obtiene los logs de auditoría del sistema con paginación y filtros.
 */
export const getAuditLogs = async (adminId, { page = 1, perPage = 20, accion = '', fechaDesde = '', fechaHasta = '' } = {}) => {
    const params = new URLSearchParams({
        admin_id: adminId,
        page,
        per_page: perPage
    });

    if (accion) params.append('accion', accion);
    if (fechaDesde) params.append('fecha_desde', fechaDesde);
    if (fechaHasta) params.append('fecha_hasta', fechaHasta);

    return await requestJson(
        `${API_BASE_URL}/admin/audit_logs.php?${params.toString()}`,
        {
            method: 'GET',
            headers: { Accept: 'application/json' },
        },
        'Fallo al conectar con el servidor'
    );
};

/**
 * Obtiene la lista de conductores y sus documentos con paginación y filtros.
 */
export const getConductorsDocuments = async (adminId, { page = 1, perPage = 20, estado = '' } = {}) => {
    const params = new URLSearchParams({
        admin_id: adminId,
        page,
        per_page: perPage
    });

    if (estado) params.append('estado_verificacion', estado);

    return await requestJson(
        `${API_BASE_URL}/admin/get_conductores_documentos.php?${params.toString()}`,
        {
            method: 'GET',
            headers: { Accept: 'application/json' },
        },
        'Fallo al conectar con el servidor'
    );
};

/**
 * Aprueba a un conductor
 */
export const approveConductor = async (adminId, conductorId) => {
    const params = new URLSearchParams({
        admin_id: adminId,
        conductor_id: conductorId
    });

    return await requestJson(
        `${API_BASE_URL}/admin/aprobar_conductor.php?${params.toString()}`,
        {
            method: 'GET',
            headers: { Accept: 'application/json' },
        },
        'Fallo al conectar con el servidor'
    );
};

/**
 * Rechaza a un conductor
 */
export const rejectConductor = async (adminId, conductorId, motivoRechazo) => {
    return await requestJson(
        `${API_BASE_URL}/admin/rechazar_conductor.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                admin_id: adminId,
                conductor_id: conductorId,
                motivo_rechazo: motivoRechazo
            })
        },
        'Fallo al conectar con el servidor'
    );
};

// ═══ Pagos empresa → plataforma ═══

/** Obtener empresas deudoras con la plataforma */
export const getEmpresasDeudoras = async () => {
    return await requestJson(
        `${API_BASE_URL}/admin/empresas_deudoras.php`,
        { headers: { Accept: 'application/json' } },
        'Error cargando empresas deudoras'
    );
};

/** Obtener reportes de pago de empresas */
export const getEmpresaPaymentReports = async ({ empresaId, estado, limit = 50 } = {}) => {
    const params = new URLSearchParams();
    if (empresaId) params.append('empresa_id', empresaId);
    if (estado) params.append('estado', estado);
    if (limit) params.append('limit', limit);
    return await requestJson(
        `${API_BASE_URL}/admin/empresa_payment_reports.php?${params}`,
        { headers: { Accept: 'application/json' } },
        'Error cargando reportes de pago'
    );
};

/** Gestionar reporte de pago (aprobar/rechazar/confirmar) */
export const manageEmpresaPaymentReport = async (data) => {
    return await requestJson(
        `${API_BASE_URL}/admin/empresa_payment_reports.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
        },
        'Error procesando reporte'
    );
};

/** Obtener configuración bancaria del administrador */
export const getAdminBankConfig = async (adminId) => {
    return await requestJson(
        `${API_BASE_URL}/admin/bank_config.php?admin_id=${adminId}`,
        { headers: { Accept: 'application/json' } },
        'Error cargando configuración bancaria'
    );
};

/** Actualizar configuración bancaria del administrador */
export const updateAdminBankConfig = async (data) => {
    return await requestJson(
        `${API_BASE_URL}/admin/bank_config.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
        },
        'Error actualizando configuración bancaria'
    );
};

/** Obtener perfil fiscal del emisor principal */
export const getAdminEmitterProfile = async (adminId) => {
    return await requestJson(
        `${API_BASE_URL}/admin/emisor_profile.php?admin_id=${adminId}`,
        { headers: { Accept: 'application/json' } },
        'Error cargando perfil fiscal del emisor'
    );
};

/** Actualizar perfil fiscal del emisor principal */
export const updateAdminEmitterProfile = async (data) => {
    return await requestJson(
        `${API_BASE_URL}/admin/emisor_profile.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
        },
        'Error actualizando perfil fiscal del emisor'
    );
};

/** Catálogo de bancos Colombia (misma API usada por Empresa en app móvil) */
export const getColombiaBanks = async () => {
    return await requestJson(
        `${API_BASE_URL}/company/colombia_banks.php`,
        { headers: { Accept: 'application/json' } },
        'Error cargando bancos'
    );
};

/** Obtener facturas */
export const getFacturas = async ({ empresaId, tipo, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (empresaId) params.append('empresa_id', empresaId);
    if (tipo) params.append('tipo', tipo);
    return await requestJson(
        `${API_BASE_URL}/admin/facturas.php?${params}`,
        { headers: { Accept: 'application/json' } },
        'Error cargando facturas'
    );
};

/** Registrar pago manual de empresa a plataforma */
export const registrarPagoComisionAdmin = async (data) => {
    return await requestJson(
        `${API_BASE_URL}/admin/registrar_pago_empresa.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
        },
        'Error registrando pago manual'
    );
};
