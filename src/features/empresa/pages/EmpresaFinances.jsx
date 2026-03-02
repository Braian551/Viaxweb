import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiAlertTriangle, FiCreditCard, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaProfile } from '../services/empresaService';
import GlassStatCard from '../../shared/components/GlassStatCard';
import PageHeader from '../../shared/components/PageHeader';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerStatGrid } from '../../shared/components/ShimmerLoader';

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

    if (loading) return <div className="v-dashboard"><PageHeader title="Finanzas" subtitle="Cargando..." /><ShimmerStatGrid count={4} /></div>;

    const stats = data?.estadisticas || data?.finanzas || {};
    const empresa = data?.empresa || data || {};

    return (
        <div className="v-dashboard">
            <PageHeader title="Finanzas" subtitle="Resumen financiero de la empresa" />

            <div className="v-stat-grid">
                <GlassStatCard icon={<FiTrendingUp />} title="Ingresos Generados" value={fmt(stats.ingresos_totales || stats.total_ingresos || 0)} accentColor="#4caf50" />
                <GlassStatCard icon={<FiDollarSign />} title="Comisión Pagada" value={fmt(stats.comision_pagada || stats.total_pagado || 0)} accentColor="#2196f3" />
                <GlassStatCard icon={<FiAlertTriangle />} title="Saldo Pendiente" value={fmt(stats.saldo_pendiente || stats.deuda || 0)} accentColor={(stats.saldo_pendiente > 0 || stats.deuda > 0) ? '#f44336' : '#4caf50'} />
                <GlassStatCard icon={<FiCreditCard />} title="Comisión %" value={`${empresa.comision_plataforma ?? stats.comision_plataforma ?? '—'}%`} accentColor="#9c27b0" />
            </div>

            <div className="glass-card v-section" style={{ textAlign: 'center', padding: '40px 24px' }}>
                <FiInfo size={48} style={{ color: 'var(--primary)', opacity: 0.3, marginBottom: 16 }} />
                <h3 className="v-section__title" style={{ marginBottom: 8 }}>Detalle de Transacciones</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, maxWidth: 480, marginInline: 'auto' }}>
                    Para ver el historial completo de pagos y generar reportes, contacta al administrador de VIAX o utiliza la aplicación móvil.
                </p>
            </div>
        </div>
    );
};

export default EmpresaFinances;
