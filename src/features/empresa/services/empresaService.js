import { API_BASE_URL } from '../../../config/env';
import { requestJson } from '../../../config/httpClient';

export const getEmpresaProfile = async (empresaId) => {
    return await requestJson(`${API_BASE_URL}/empresa/profile.php?empresa_id=${empresaId}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const getEmpresaSettings = async (empresaId) => {
    return await requestJson(`${API_BASE_URL}/empresa/settings.php?empresa_id=${empresaId}&action=get_settings`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const getEmpresaBalance = async (empresaId) => {
    return await requestJson(`${API_BASE_URL}/company/get_balance.php?empresa_id=${empresaId}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const toggleEmpresaVehicle = async (payload) => {
    return await requestJson(`${API_BASE_URL}/company/vehicles.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
    }, 'Error al actualizar tipo de vehículo');
};

export const getEmpresaReports = async (empresaId, periodo = '7d') => {
    return await requestJson(`${API_BASE_URL}/company/reports.php?action=overview&empresa_id=${empresaId}&periodo=${periodo}`, { headers: { Accept: 'application/json' } }, 'Error cargando reportes');
};

export const getEmpresaTripsReport = async (empresaId, periodo = '30d', page = 1) => {
    return await requestJson(`${API_BASE_URL}/company/reports.php?action=trips&empresa_id=${empresaId}&periodo=${periodo}&page=${page}`, { headers: { Accept: 'application/json' } }, 'Error cargando historial de viajes');
};

export const getEmpresaDriversReport = async (empresaId, periodo = '30d') => {
    return await requestJson(`${API_BASE_URL}/company/reports.php?action=drivers&empresa_id=${empresaId}&periodo=${periodo}`, { headers: { Accept: 'application/json' } }, 'Error cargando reporte de conductores');
};

export const getEmpresaEarningsDetail = async (empresaId, periodo = '30d') => {
    return await requestJson(`${API_BASE_URL}/company/reports.php?action=earnings&empresa_id=${empresaId}&periodo=${periodo}`, { headers: { Accept: 'application/json' } }, 'Error cargando detalle de ganancias');
};

export const getEmpresaVehicleTypesReport = async (empresaId, periodo = '30d') => {
    return await requestJson(`${API_BASE_URL}/company/reports.php?action=vehicle_types&empresa_id=${empresaId}&periodo=${periodo}`, { headers: { Accept: 'application/json' } }, 'Error cargando análisis de flota');
};

/**
 * Constructs the URL for the professional PDF report
 */
export const getEmpresaReportPdfUrl = (empresaId, periodo = '30d') => {
    return `${API_BASE_URL}/company/reports.php?action=pdf&empresa_id=${empresaId}&periodo=${periodo}`;
};

export const getEmpresaReportPdfFallbackUrls = (empresaId, periodo = '30d') => {
    return [
        `${API_BASE_URL}/company/reports.php?action=pdf&empresa_id=${empresaId}&periodo=${periodo}`,
        `${API_BASE_URL}/company/reports_pdf.php?empresa_id=${empresaId}&periodo=${periodo}`,
    ];
};

export const getEmpresaPricing = async (empresaId) => {
    return await requestJson(`${API_BASE_URL}/company/pricing.php?empresa_id=${empresaId}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const updateEmpresaPricing = async (empresaId, precios) => {
    return await requestJson(
        `${API_BASE_URL}/company/pricing.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ empresa_id: empresaId, precios }),
        },
        'Error de conexión'
    );
};

export const updateEmpresaSettings = async (data) => {
    return await requestJson(
        `${API_BASE_URL}/empresa/settings.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ ...data, action: 'update_settings' })
        },
        'Error de conexión'
    );
};

export const getConductoresEmpresa = async (empresaId) => {
    return await requestJson(`${API_BASE_URL}/conductor/get_pendientes_empresa.php?empresa_id=${empresaId}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const getSolicitudesVinculacion = async (empresaId, { page = 1, perPage = 20 } = {}) => {
    try {
        const params = new URLSearchParams({ empresa_id: empresaId, incluir_solicitudes: 'true', page, per_page: perPage });
        const data = await requestJson(`${API_BASE_URL}/company/conductores_documentos.php?${params}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');

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

export const updateEmpresaProfile = async (empresaId, data) => {
    return await requestJson(
        `${API_BASE_URL}/empresa/profile.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ empresa_id: empresaId, action: 'update_profile', ...data })
        },
        'Error de conexión'
    );
};

export const checkPasswordStatus = async (userId) => {
    return await requestJson(
        `${API_BASE_URL}/auth/change_password.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ user_id: userId, action: 'check_status' })
        },
        'Error de conexión'
    );
};

export const changePassword = async (userId, currentPassword, newPassword) => {
    return await requestJson(
        `${API_BASE_URL}/auth/change_password.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ user_id: userId, action: 'change_password', current_password: currentPassword, new_password: newPassword })
        },
        'Error de conexión'
    );
};

export const requestPasswordCode = async (userId) => {
    return await requestJson(
        `${API_BASE_URL}/auth/change_password.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ user_id: userId, action: 'request_change_code' })
        },
        'Error de conexión'
    );
};

export const changePasswordWithCode = async (userId, verificationCode, newPassword) => {
    return await requestJson(
        `${API_BASE_URL}/auth/change_password.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ user_id: userId, action: 'change_password_with_code', verification_code: verificationCode, new_password: newPassword })
        },
        'Error de conexión'
    );
};

export const getColombianBanks = async () => {
    return await requestJson(
        `${API_BASE_URL}/company/colombia_banks.php`,
        { headers: { Accept: 'application/json' } },
        'Error cargando bancos'
    );
};

/* ─── Colombia Location API (api-colombia.com) ─── */
const COLOMBIA_API = 'https://api-colombia.com/api/v1';

export const getDepartments = async () => {
    const res = await fetch(`${COLOMBIA_API}/Department`);
    if (!res.ok) throw new Error('Error cargando departamentos');
    const data = await res.json();
    return data.sort((a, b) => a.name.localeCompare(b.name));
};

export const getCitiesByDepartment = async (departmentId) => {
    const res = await fetch(`${COLOMBIA_API}/Department/${departmentId}/cities`);
    if (!res.ok) throw new Error('Error cargando ciudades');
    const data = await res.json();
    return data.sort((a, b) => a.name.localeCompare(b.name));
};


export const gestionarSolicitud = async (empresaId, solicitudId, accion, motivo = '', procesadoPor = null) => {
    const mappedAction = accion === 'aprobar' ? 'aprobar_solicitud' : 'rechazar_solicitud';

    return await requestJson(
        `${API_BASE_URL}/company/conductores_documentos.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                empresa_id: empresaId,
                conductor_id: solicitudId,
                accion: mappedAction,
                procesado_por: procesadoPor || empresaId,
                razon: motivo,
            })
        },
        'Error de conexión'
    );
};

export const getEmpresaDebtors = async (empresaId) => {
    return await requestJson(`${API_BASE_URL}/company/get_debtors.php?empresa_id=${empresaId}`, { headers: { Accept: 'application/json' } }, 'Error cargando deudores');
};

export const getEmpresaPaymentReports = async (empresaId, filters = {}) => {
    const params = new URLSearchParams({ empresa_id: empresaId, ...filters });
    return await requestJson(`${API_BASE_URL}/company/debt_payment_reports.php?${params}`, { headers: { Accept: 'application/json' } }, 'Error cargando comprobantes');
};

export const managePaymentReport = async (data) => {
    return await requestJson(
        `${API_BASE_URL}/company/debt_payment_reports.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
        },
        'Error procesando comprobante'
    );
};

export const registrarPagoComision = async (data) => {
    return await requestJson(
        `${API_BASE_URL}/admin/registrar_pago_comision.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(data)
        },
        'Error registrando pago'
    );
};

export const getConductorTransactions = async (conductorId) => {
    return await requestJson(`${API_BASE_URL}/company/get_conductor_transactions.php?conductor_id=${conductorId}`, { headers: { Accept: 'application/json' } }, 'Error cargando historial');
};

// ═══ Pagos empresa → plataforma (admin) ═══

/** Obtener contexto de deuda de la empresa con la plataforma */
export const getPlatformDebtContext = async (empresaId) => {
    return await requestJson(
        `${API_BASE_URL}/company/platform_debt_context.php?empresa_id=${empresaId}`,
        { headers: { Accept: 'application/json' } },
        'Error cargando contexto de deuda'
    );
};

/** Enviar comprobante de pago a la plataforma (FormData con archivo) */
export const submitPlatformPaymentProof = async (formData) => {
    return await requestJson(
        `${API_BASE_URL}/company/report_platform_payment.php`,
        { method: 'POST', body: formData },
        'Error enviando comprobante'
    );
};

/** Obtener facturas de la empresa con la plataforma */
export const getEmpresaFacturas = async (empresaId, { page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({ empresa_id: empresaId, page, limit });
    return await requestJson(
        `${API_BASE_URL}/admin/facturas.php?${params}`,
        { headers: { Accept: 'application/json' } },
        'Error cargando facturas'
    );
};
