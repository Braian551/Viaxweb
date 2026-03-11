const ADMIN_PAYMENT_TYPES = new Set([
    'empresa_payment_submitted',
    'empresa_payment_approved',
    'empresa_payment_rejected',
    'empresa_payment_confirmed',
    'invoice_generated',
]);

const COMPANY_PAYMENT_TYPES = new Set([
    'empresa_payment_approved',
    'empresa_payment_rejected',
    'empresa_payment_confirmed',
    'invoice_generated',
]);

const DOCUMENT_TYPES = new Set([
    'document_approved',
    'document_rejected',
    'driver_document_update',
    'admin_company_documents_submitted',
]);

const normalizeRole = (roleType) => {
    const normalized = String(roleType || '').toLowerCase();
    if (normalized === 'administrador') return 'admin';
    if (normalized === 'company') return 'empresa';
    return normalized;
};

const buildRoleBase = (roleType) => {
    const normalizedRole = normalizeRole(roleType);
    if (!normalizedRole) return null;

    if (normalizedRole === 'admin') return '/admin';
    if (normalizedRole === 'empresa') return '/empresa';
    if (normalizedRole === 'conductor') return '/conductor';
    if (normalizedRole === 'cliente') return '/cliente';
    return null;
};

export const resolveNotificationRedirectPath = ({ notification, roleType }) => {
    if (!notification) return null;

    const base = buildRoleBase(roleType);
    if (!base) return null;

    const tipo = String(notification.tipo || '').toLowerCase();
    const referenciaTipo = String(notification.referencia_tipo || '').toLowerCase();

    if (ADMIN_PAYMENT_TYPES.has(tipo) || referenciaTipo === 'pago_empresa_reporte' || referenciaTipo === 'factura') {
        return normalizeRole(roleType) === 'admin'
            ? '/admin/company-payments'
            : '/empresa/platform-payment';
    }

    if (COMPANY_PAYMENT_TYPES.has(tipo)) {
        return normalizeRole(roleType) === 'empresa' ? '/empresa/platform-payment' : '/admin/company-payments';
    }

    if (DOCUMENT_TYPES.has(tipo) || referenciaTipo === 'conductor' || referenciaTipo === 'conductor_solicitud' || referenciaTipo === 'documento_conductor') {
        if (normalizeRole(roleType) === 'empresa') return '/empresa/conductors';
        if (normalizeRole(roleType) === 'admin') return '/admin/companies';
    }

    if (tipo === 'payment_pending' || tipo === 'payment_received' || referenciaTipo === 'pago') {
        if (normalizeRole(roleType) === 'conductor') return '/conductor/earnings';
        if (normalizeRole(roleType) === 'empresa') return '/empresa/platform-payment';
        if (normalizeRole(roleType) === 'admin') return '/admin/company-payments';
    }

    if (tipo.startsWith('trip_') || tipo === 'driver_arrived' || tipo === 'driver_waiting') {
        return base;
    }

    return null;
};

export const resolveRoleTypeFromUser = (user) => {
    if (!user) return '';
    return user.tipo_usuario || user.role || user.user_type || '';
};
