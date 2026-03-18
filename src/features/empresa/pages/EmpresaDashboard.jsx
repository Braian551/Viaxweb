import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiTruck, FiDollarSign, FiBriefcase, FiActivity, FiMapPin, FiMail, FiPhone, FiHash, FiPercent } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaProfile, getSolicitudesVinculacion, getEmpresaDashboardStats, getPlatformDebtContext } from '../services/empresaService';
import GlassStatCard from '../../shared/components/GlassStatCard';
import PageHeader from '../../shared/components/PageHeader';
import StatusBadge from '../../shared/components/StatusBadge';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';
import { ViaxBarChart, ViaxDonutChart } from '../../shared/components/ViaxCharts';

const DEBT_EPSILON_COP = 1;
const normalizeSaldoCop = (value) => {
    const parsed = Number(value || 0);
    if (!Number.isFinite(parsed)) return 0;
    return Math.abs(parsed) < DEBT_EPSILON_COP ? 0 : parsed;
};
const isEmpresaActive = (empresa = {}) => {
    if (empresa.es_activa === true || empresa.es_activo === true) return true;
    if (empresa.es_activa === false || empresa.es_activo === false) return false;

    const estado = String(empresa.estado || '').toLowerCase();
    if (estado === 'activo' || estado === 'activa') return true;
    if (estado === 'inactivo' || estado === 'inactiva' || estado === 'suspendido') return false;

    // Si el backend no envía estado explícito, evitar falso "Inactiva".
    return true;
};

const EmpresaDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [solicitudes, setSolicitudes] = useState([]);
    const [dashStats, setDashStats] = useState(null);
    const [debtContext, setDebtContext] = useState(null);
    const [periodo, setPeriodo] = useState('mes');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const empresaId = user.empresa_id || user.id;
        const load = async () => {
            setLoading(true);
            const [profRes, solRes, dashRes, debtRes] = await Promise.all([
                getEmpresaProfile(empresaId),
                getSolicitudesVinculacion(empresaId, { page: 1, perPage: 5 }),
                getEmpresaDashboardStats(empresaId, periodo),
                getPlatformDebtContext(empresaId),
            ]);
            if (profRes.success) setProfile(profRes.data || profRes.empresa || profRes);
            if (solRes.success) setSolicitudes(solRes.data?.solicitudes || solRes.solicitudes || []);
            if (dashRes.success) setDashStats(dashRes.data || {});
            if (debtRes?.success) setDebtContext(debtRes.data || {});
            setLoading(false);
        };
        load();
    }, [user, periodo]);

    if (loading) return <div className="v-dashboard"><ShimmerDashboard /></div>;

    const empresa = profile?.empresa || profile || {};
    const stats = profile?.estadisticas || {};
    const dStats = dashStats || {};
    const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

    // Default to profile stats if dashboard API fails, but prioritize dashboard_stats for accuracy
    const displayConductores = dStats.conductores?.total ?? stats.conductores_vinculados ?? empresa.total_conductores ?? 0;
    const displayViajes = dStats.viajes?.hoy ?? stats.viajes_totales ?? 0;
    const displayGanancias = dStats.ganancias?.total ?? 0;

    const operationChartData = [
        { metric: 'Conductores', valor: Number(displayConductores) },
        { metric: 'Viajes', valor: Number(displayViajes) },
        { metric: 'Ganancia Neta', valor: Number(displayGanancias) },
    ];

    const solicitudStatusMap = solicitudes.reduce((acc, item) => {
        const key = (item.estado || 'pendiente').toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const solicitudStatusData = Object.entries(solicitudStatusMap).map(([estado, value]) => ({
        name: estado.replace(/_/g, ' '),
        value,
    }));

    const deudaActual = normalizeSaldoCop(debtContext?.deuda_actual || 0);
    const deudaActiva = typeof debtContext?.deuda_activa === 'boolean'
        ? debtContext.deuda_activa
        : deudaActual >= DEBT_EPSILON_COP;
    const totalPagadoPlataforma = Number(debtContext?.total_pagado || 0);
    const estadoPagoPlataforma = debtContext?.estado_reporte || 'sin_reporte';
    const empresaActiva = isEmpresaActive(empresa);
    const comisionPlataforma = Number(
        empresa.comision_admin_porcentaje
        ?? empresa.comision_plataforma
        ?? dStats.empresa?.comision_porcentaje
        ?? debtContext?.comision_porcentaje
        ?? stats.comision_plataforma
        ?? 0
    );

    const quickActions = [
        { title: 'Pagar plataforma', desc: 'Reporta comprobantes y evita bloqueos operativos.', to: '/empresa/platform-payment', accent: '#ef4444' },
        { title: 'Ver reportes', desc: 'Revisa desempeño y tendencias financieras.', to: '/empresa/reports', accent: '#3b82f6' },
        { title: 'Configurar empresa', desc: 'Mantén datos bancarios y operativos al día.', to: '/empresa/settings', accent: '#22c55e' },
    ];

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Dashboard Empresa"
                subtitle={empresa.nombre_empresa || empresa.nombre || 'Mi Empresa'}
                actions={
                    <div className="v-period-selector" aria-label="Periodo de análisis">
                        {['hoy', 'semana', 'mes'].map((p) => (
                            <button
                                key={p}
                                type="button"
                                className={`v-period-btn ${periodo === p ? 'active' : ''}`}
                                onClick={() => setPeriodo(p)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                }
            />

            <div className="v-stat-grid">
                <GlassStatCard icon={<FiUsers />} title="Conductores Vinculados" value={displayConductores} accentColor="#9c27b0" />
                <GlassStatCard icon={<FiTruck />} title="Viajes (Mes)" value={displayViajes} accentColor="#2196f3" />
                <GlassStatCard icon={<FiDollarSign />} title="Ganancia Neta (Mes)" value={fmt(displayGanancias)} accentColor="#4caf50" />
                <GlassStatCard icon={<FiBriefcase />} title="Estado" value={empresaActiva ? 'Activa' : 'Inactiva'} accentColor="#ff9800" />
            </div>

            <div className="v-two-col">
                <div className="glass-card v-section">
                    <div className="v-section__header">
                        <div className="v-section__icon" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
                            <FiDollarSign size={20} color="#ef4444" />
                        </div>
                        <h3 className="v-section__title">Salud de pagos con plataforma</h3>
                    </div>
                    <div className="v-info-row">
                        <div className="v-info-row__content">
                            <div className="v-info-row__label">Deuda actual</div>
                            <div className="v-info-row__value" style={{ color: deudaActiva ? '#ef4444' : '#22c55e', fontSize: '1.05rem' }}>{fmt(deudaActual)}</div>
                        </div>
                        <StatusBadge status={deudaActiva ? 'rechazado' : 'activo'} label={deudaActiva ? 'Pendiente' : 'Al día'} />
                    </div>
                    <div className="v-info-row">
                        <div className="v-info-row__content">
                            <div className="v-info-row__label">Total pagado histórico</div>
                            <div className="v-info-row__value">{fmt(totalPagadoPlataforma)}</div>
                        </div>
                    </div>
                    <div className="v-info-row">
                        <div className="v-info-row__content">
                            <div className="v-info-row__label">Estado último comprobante</div>
                            <div className="v-info-row__value" style={{ textTransform: 'capitalize' }}>{estadoPagoPlataforma.replace(/_/g, ' ')}</div>
                        </div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                        <button type="button" className="v-btn-primary" onClick={() => navigate('/empresa/platform-payment')}>
                            Gestionar Pago Plataforma
                        </button>
                    </div>
                </div>

                <div className="glass-card v-section">
                    <div className="v-section__header">
                        <div className="v-section__icon" style={{ background: 'rgba(59, 130, 246, 0.14)' }}>
                            <FiActivity size={20} color="#3b82f6" />
                        </div>
                        <h3 className="v-section__title">Acciones rápidas</h3>
                    </div>
                    <div className="v-card-grid" style={{ gridTemplateColumns: '1fr' }}>
                        {quickActions.map((action) => (
                            <button
                                key={action.title}
                                type="button"
                                className="v-btn-outline"
                                style={{
                                    justifyContent: 'space-between',
                                    padding: '14px 16px',
                                    borderColor: `${action.accent}66`,
                                    background: `${action.accent}12`,
                                    color: 'var(--text, #1e293b)',
                                }}
                                onClick={() => navigate(action.to)}
                            >
                                <span style={{ textAlign: 'left' }}>
                                    <strong style={{ display: 'block', marginBottom: 4 }}>{action.title}</strong>
                                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{action.desc}</span>
                                </span>
                                <span style={{ color: action.accent, fontWeight: 800 }}>Ir</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="v-chart-grid">
                <div className="glass-card v-chart-card">
                    <h3 className="v-chart-title">Operación de la empresa</h3>
                    <ViaxBarChart
                        data={operationChartData}
                        xKey="metric"
                        bars={[{ dataKey: 'valor', name: 'Valor', color: '#9c27b0' }]}
                    />
                </div>

                <div className="glass-card v-chart-card">
                    <h3 className="v-chart-title">Estado de solicitudes</h3>
                    {solicitudStatusData.length > 0 ? (
                        <ViaxDonutChart data={solicitudStatusData} valueFormatter={(value) => `${value} solicitud(es)`} />
                    ) : (
                        <EmptyState icon={<FiActivity size={36} />} title="Sin solicitudes" description="No hay solicitudes para graficar." />
                    )}
                </div>
            </div>

            <div className="glass-card v-section">
                <div className="v-section__header">
                    <div className="v-section__icon" style={{ background: 'rgba(156, 39, 176, 0.12)' }}>
                        <FiBriefcase size={20} color="#9c27b0" />
                    </div>
                    <h3 className="v-section__title">Información de la Empresa</h3>
                </div>
                <div className="v-info-rows">
                    <div className="v-info-row"><span className="v-info-row__label"><FiHash style={{ marginRight: 6 }} />NIT</span><span className="v-info-row__value">{empresa.nit || '—'}</span></div>
                    <div className="v-info-row"><span className="v-info-row__label"><FiMail style={{ marginRight: 6 }} />Email</span><span className="v-info-row__value">{empresa.email_empresa || empresa.email || '—'}</span></div>
                    <div className="v-info-row"><span className="v-info-row__label"><FiPhone style={{ marginRight: 6 }} />Teléfono</span><span className="v-info-row__value">{empresa.telefono || '—'}</span></div>
                    <div className="v-info-row"><span className="v-info-row__label"><FiMapPin style={{ marginRight: 6 }} />Municipio</span><span className="v-info-row__value">{empresa.municipio || '—'}</span></div>
                    <div className="v-info-row"><span className="v-info-row__label"><FiMapPin style={{ marginRight: 6 }} />Dirección</span><span className="v-info-row__value">{empresa.direccion || '—'}</span></div>
                    <div className="v-info-row"><span className="v-info-row__label"><FiPercent style={{ marginRight: 6 }} />Comisión Plataforma</span><span className="v-info-row__value">{Number.isFinite(comisionPlataforma) ? `${comisionPlataforma}%` : '—'}</span></div>
                </div>
            </div>

            <div className="glass-card v-section">
                <div className="v-section__header">
                    <div className="v-section__icon" style={{ background: 'rgba(33, 150, 243, 0.12)' }}>
                        <FiActivity size={20} color="#2196f3" />
                    </div>
                    <h3 className="v-section__title">Solicitudes de Vinculación Recientes</h3>
                </div>
                {solicitudes.length > 0 ? (
                    <div className="v-activity-list">
                        {solicitudes.map((s, i) => (
                            <div key={s.id || i} className="v-activity-item v-activity-item--enhanced">
                                <div className="v-activity-item__timeline" />
                                <ProfileAvatar src={s.conductor_foto || s.foto_perfil} name={`${s.conductor_nombre || s.nombre || '?'} ${s.conductor_apellido || s.apellido || ''}`} size={40} borderRadius={12} bgColor="#ff9800" />
                                <div className="v-activity-item__body">
                                    <span className="v-activity-item__title">{s.conductor_nombre || s.nombre} {s.conductor_apellido || s.apellido || ''}</span>
                                    <span className="v-activity-item__meta">
                                        <span className="v-activity-item__time">{s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleString() : '—'}</span>
                                    </span>
                                </div>
                                <StatusBadge status={s.estado || 'pendiente'} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={<FiUsers />} title="Sin solicitudes" description="No hay solicitudes de vinculación recientes." />
                )}
            </div>
        </div>
    );
};

export default EmpresaDashboard;
