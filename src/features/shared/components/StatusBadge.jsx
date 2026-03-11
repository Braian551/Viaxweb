import React from 'react';

/**
 * StatusBadge - Reusable status indicator pill
 */
const statusMap = {
    activo: { bg: 'rgba(76, 175, 80, 0.12)', color: '#4caf50', label: 'Activo' },
    active: { bg: 'rgba(76, 175, 80, 0.12)', color: '#4caf50', label: 'Activo' },
    aprobado: { bg: 'rgba(76, 175, 80, 0.12)', color: '#4caf50', label: 'Aprobado' },
    terminado: { bg: 'rgba(76, 175, 80, 0.12)', color: '#4caf50', label: 'Terminado' },
    debt: { bg: 'rgba(255, 82, 82, 0.12)', color: '#ff5252', label: 'Con Deuda' },
    pendiente_revision: { bg: 'rgba(255, 171, 64, 0.12)', color: '#ffab40', label: 'Pendiente Revisión' },
    comprobante_aprobado: { bg: 'rgba(33, 150, 243, 0.12)', color: '#2196f3', label: 'Aprobado (Pte Pago)' },
    pagado_confirmado: { bg: 'rgba(76, 175, 80, 0.12)', color: '#4caf50', label: 'Confirmado' },
    // The existing 'rechazado' entry is kept as it has a 'bg' property.
    // If the new 'rechazado' was meant to replace it, it would need a 'bg' property.
    // For now, assuming the new 'rechazado' was a duplicate or intended for a different context.
    aprobada: { bg: 'rgba(76, 175, 80, 0.12)', color: '#4caf50', label: 'Aprobada' },
    completada: { bg: 'rgba(76, 175, 80, 0.12)', color: '#4caf50', label: 'Completada' },
    inactivo: { bg: 'rgba(244, 67, 54, 0.12)', color: '#f44336', label: 'Inactivo' },
    inactive: { bg: 'rgba(244, 67, 54, 0.12)', color: '#f44336', label: 'Inactivo' },
    rechazado: { bg: 'rgba(244, 67, 54, 0.12)', color: '#f44336', label: 'Rechazado' },
    rechazada: { bg: 'rgba(244, 67, 54, 0.12)', color: '#f44336', label: 'Rechazada' },
    pendiente: { bg: 'rgba(255, 152, 0, 0.12)', color: '#ff9800', label: 'Pendiente' },
    en_revision: { bg: 'rgba(33, 150, 243, 0.12)', color: '#2196f3', label: 'En Revisión' },
    cancelada: { bg: 'rgba(158, 158, 158, 0.12)', color: '#9e9e9e', label: 'Cancelada' },
    // Vehicle Types
    moto: { bg: 'rgba(33, 150, 243, 0.12)', color: '#2196f3', label: 'Moto' },
    mototaxi: { bg: 'rgba(3, 169, 244, 0.12)', color: '#03a9f4', label: 'Mototaxi' },
    taxi: { bg: 'rgba(255, 193, 7, 0.12)', color: '#ffc107', label: 'Taxi' },
    carro: { bg: 'rgba(156, 39, 176, 0.12)', color: '#9c27b0', label: 'Carro' },
    auto: { bg: 'rgba(156, 39, 176, 0.12)', color: '#9c27b0', label: 'Auto' },
};

const StatusBadge = ({ status, label, icon, style = {} }) => {
    const config = statusMap[status] || {
        bg: 'rgba(158, 158, 158, 0.12)',
        color: '#9e9e9e',
        label: status || 'Desconocido'
    };

    return (
        <span
            className="v-status-badge"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                background: config.bg,
                color: config.color,
                whiteSpace: 'nowrap',
                ...style
            }}
        >
            {icon}
            {label || config.label}
        </span>
    );
};

export default StatusBadge;
