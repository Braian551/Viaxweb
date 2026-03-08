/**
 * Funciones de validación compartidas para AuthInput
 * Se usan para validación en tiempo real en los formularios del sitio web.
 */
export const V = {
    required: (label) => (v) => !v?.trim() ? `${label} es requerido` : null,
    email: (v) => {
        if (!v?.trim()) return 'El email es requerido';
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) ? null : 'Email inválido';
    },
    nit: (v) => {
        if (!v) return null; // optional
        return /^[0-9-]+$/.test(v) ? null : 'Solo números y guión';
    },
    phone: (v) => {
        if (!v?.trim()) return 'El teléfono es requerido';
        if (v.replace(/\D/g, '').length < 7) return 'Mínimo 7 dígitos';
        return null;
    },
    phoneOpt: (v) => {
        if (!v) return null;
        if (v.replace(/\D/g, '').length < 7) return 'Mínimo 7 dígitos';
        return null;
    },
    password: (v) => {
        if (!v) return 'La contraseña es requerida';
        if (v.length < 6) return 'Mínimo 6 caracteres';
        return null;
    },
    name: (label) => (v) => {
        if (!v?.trim()) return `${label} es requerido`;
        if (/[0-9]/.test(v)) return 'No se permiten números';
        return null;
    },
    emailOpt: (v) => {
        if (!v) return null;
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) ? null : 'Email inválido';
    },
};

/**
 * Funciones de filtro compartidas para AuthInput
 * Limpian el valor instántaneamente mientras el usuario escribe.
 */
export const F = {
    nit: (v) => v.replace(/[^0-9-]/g, ''),
    phone: (v) => v.replace(/[^0-9 +]/g, ''),
    name: (v) => v.replace(/[0-9]/g, ''),
};
