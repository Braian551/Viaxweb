import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiAlertTriangle, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaProfile } from '../services/empresaService';
import '../../shared/DashboardLayout.css';

const EmpresaFinances = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const empresaId = user.empresa_id || user.id;
        const load = async () => {
            setLoading(true);
            const res = await getEmpresaProfile(empresaId);
            if (res.success) setData(res.data || res);
            setLoading(false);
        };
        load();
    }, [user]);

    const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Cargando finanzas...</div>;

    const stats = data?.estadisticas || data?.finanzas || {};
    const empresa = data?.empresa || data || {};

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Finanzas</h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Resumen financiero de la empresa</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <FinCard icon={<FiTrendingUp size={24} color="#4caf50" />} title="Ingresos Generados" value={fmt(stats.ingresos_totales || stats.total_ingresos || 0)} bg="rgba(76,175,80,0.12)" color="#4caf50" />
                <FinCard icon={<FiDollarSign size={24} color="#2196f3" />} title="Comisión Pagada" value={fmt(stats.comision_pagada || stats.total_pagado || 0)} bg="rgba(33,150,243,0.12)" color="#2196f3" />
                <FinCard icon={<FiAlertTriangle size={24} color="#f44336" />} title="Saldo Pendiente" value={fmt(stats.saldo_pendiente || stats.deuda || 0)} bg="rgba(244,67,54,0.12)" color={stats.saldo_pendiente > 0 || stats.deuda > 0 ? '#f44336' : 'var(--text)'} />
                <FinCard icon={<FiCreditCard size={24} color="#9c27b0" />} title="Comisión %" value={`${empresa.comision_plataforma ?? stats.comision_plataforma ?? '—'}%`} bg="rgba(156,39,176,0.12)" color="#9c27b0" />
            </div>

            <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', textAlign: 'center' }}>
                <FiDollarSign size={48} color="var(--primary)" style={{ opacity: 0.3, marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--text)', fontWeight: '700', margin: '0 0 8px 0' }}>Detalle de Transacciones</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    Para ver el historial completo de pagos y generar reportes, contacta al administrador de VIAX o utiliza la aplicación móvil.
                </p>
            </div>
        </div>
    );
};

const FinCard = ({ icon, title, value, bg, color }) => (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: color || 'var(--text)' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{title}</div>
    </div>
);

export default EmpresaFinances;
