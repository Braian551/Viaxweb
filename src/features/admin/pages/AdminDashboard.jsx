import React, { useEffect, useMemo, useState } from 'react';
import { FiUsers, FiActivity, FiDollarSign, FiAlertCircle, FiMonitor, FiTrendingUp, FiClock } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getDashboardStats } from '../services/adminService';
import GlassStatCard from '../../shared/components/GlassStatCard';
import PageHeader from '../../shared/components/PageHeader';
import StatusBadge from '../../shared/components/StatusBadge';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            if (!user || !['admin', 'administrador'].includes(user.tipo_usuario)) {
                setError('No autorizado');
                setLoading(false);
                return;
            }

            const response = await getDashboardStats(user.id);
            if (response.success && response.data) {
                setStats(response.data);
            } else {
                setError(response.message || 'Error al cargar estadísticas');
            }
            setLoading(false);
        };

        fetchStats();
    }, [user]);

    if (loading) return <ShimmerDashboard />;

    if (error) return <div className="v-error-box">{error}</div>;

    const { usuarios, solicitudes, ingresos, reportes, actividades_recientes } = stats || {};
    const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);

    const kpiBars = useMemo(() => {
        const items = [
            { key: 'usuarios', label: 'Usuarios', value: Number(usuarios?.total_usuarios || 0), color: '#2196f3' },
            { key: 'solicitudes', label: 'Viajes', value: Number(solicitudes?.total_solicitudes || 0), color: '#00bcd4' },
            { key: 'reportes', label: 'Reportes', value: Number(reportes?.reportes_pendientes || 0), color: '#ff9800' },
            { key: 'ingresos', label: 'Ingresos Hoy', value: Number(ingresos?.ingresos_hoy || 0), color: '#4caf50', formatter: formatCurrency },
        ];

        const maxValue = Math.max(...items.map(item => item.value), 1);
        return items.map(item => ({
            ...item,
            percentage: Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 0),
        }));
    }, [usuarios, solicitudes, reportes, ingresos]);

    const activeUsers = Number(usuarios?.usuarios_activos || 0);
    const totalUsers = Number(usuarios?.total_usuarios || 0);
    const inactiveUsers = Math.max(totalUsers - activeUsers, 0);
    const activePercent = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Dashboard en vivo"
                subtitle="Resumen general de la plataforma Viax"
            />

            <div className="v-stat-grid">
                <GlassStatCard
                    title="Usuarios Totales"
                    value={usuarios?.total_usuarios || 0}
                    subtitle={`Activos: ${usuarios?.usuarios_activos || 0}`}
                    icon={<FiUsers size={22} color="#2196f3" />}
                    accentColor="#2196f3"
                />
                <GlassStatCard
                    title="Solicitudes (Viajes)"
                    value={solicitudes?.total_solicitudes || 0}
                    subtitle={`Hoy: ${solicitudes?.solicitudes_hoy || 0}`}
                    icon={<FiTrendingUp size={22} color="#00bcd4" />}
                    accentColor="#00bcd4"
                />
                <GlassStatCard
                    title="Ingresos Totales"
                    value={formatCurrency(ingresos?.ingresos_totales)}
                    subtitle={`Hoy: ${formatCurrency(ingresos?.ingresos_hoy)}`}
                    icon={<FiDollarSign size={22} color="#4caf50" />}
                    accentColor="#4caf50"
                />
                <GlassStatCard
                    title="Reportes"
                    value={reportes?.reportes_pendientes || 0}
                    subtitle="Pendientes de revisión"
                    icon={<FiAlertCircle size={22} color="#ff9800" />}
                    accentColor="#ff9800"
                />
            </div>

            <div className="v-admin-live-grid">
                <div className="glass-card v-section">
                    <div className="v-section__header">
                        <div className="v-section__icon" style={{ background: 'rgba(0, 188, 212, 0.12)' }}>
                            <FiTrendingUp size={20} color="#00bcd4" />
                        </div>
                        <h2 className="v-section__title">Gráfico en vivo (KPIs)</h2>
                    </div>

                    <div className="v-kpi-chart">
                        {kpiBars.map((bar) => (
                            <div key={bar.key} className="v-kpi-chart__row">
                                <div className="v-kpi-chart__meta">
                                    <span className="v-kpi-chart__label">{bar.label}</span>
                                    <span className="v-kpi-chart__value">{bar.formatter ? bar.formatter(bar.value) : bar.value}</span>
                                </div>
                                <div className="v-kpi-chart__track">
                                    <div className="v-kpi-chart__fill" style={{ width: `${bar.percentage}%`, background: bar.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card v-section">
                    <div className="v-section__header">
                        <div className="v-section__icon" style={{ background: 'rgba(33, 150, 243, 0.12)' }}>
                            <FiUsers size={20} color="#2196f3" />
                        </div>
                        <h2 className="v-section__title">Usuarios activos</h2>
                    </div>

                    <div className="v-user-ring-wrap">
                        <div className="v-user-ring">
                            <svg viewBox="0 0 120 120" className="v-user-ring__svg" role="img" aria-label="Distribución de usuarios activos">
                                <circle cx="60" cy="60" r="46" className="v-user-ring__bg" />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="46"
                                    className="v-user-ring__fg"
                                    style={{
                                        strokeDasharray: `${2 * Math.PI * 46}`,
                                        strokeDashoffset: `${2 * Math.PI * 46 * (1 - activePercent / 100)}`,
                                    }}
                                />
                            </svg>
                            <div className="v-user-ring__center">
                                <strong>{activePercent}%</strong>
                                <span>activos</span>
                            </div>
                        </div>

                        <div className="v-user-ring__legend">
                            <div className="v-user-ring__legend-item">
                                <span className="v-dot v-dot--green" />
                                <span>Activos: {activeUsers}</span>
                            </div>
                            <div className="v-user-ring__legend-item">
                                <span className="v-dot v-dot--gray" />
                                <span>Inactivos: {inactiveUsers}</span>
                            </div>
                            <div className="v-user-ring__legend-item">
                                <span className="v-dot v-dot--blue" />
                                <span>Total: {totalUsers}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card v-section">
                <div className="v-section__header">
                    <div className="v-section__icon" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                        <FiMonitor size={20} color="#2196f3" />
                    </div>
                    <h2 className="v-section__title">Actividad Reciente</h2>
                </div>

                {actividades_recientes && actividades_recientes.length > 0 ? (
                    <div className="v-activity-list">
                        {actividades_recientes.slice(0, 8).map((act) => {
                            const action = (act.accion || '').toLowerCase();
                            const status = action.includes('login')
                                ? 'activo'
                                : action.includes('crear') || action.includes('aprob')
                                    ? 'aprobado'
                                    : action.includes('rechaz') || action.includes('error')
                                        ? 'rechazado'
                                        : 'pendiente';

                            return (
                                <div key={act.id} className="v-activity-item v-activity-item--enhanced">
                                    <div className="v-activity-item__timeline" />
                                    <div className="v-activity-item__content">
                                        <div className="v-activity-item__title">{act.descripcion}</div>
                                        <div className="v-activity-item__meta">
                                            <span>{act.nombre} {act.apellido}</span>
                                            <span className="v-activity-item__dot">•</span>
                                            <span className="v-activity-item__time"><FiClock size={12} /> {new Date(act.fecha_creacion).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="v-activity-item__badge">
                                        <StatusBadge status={status} label={(act.accion || 'evento').replace(/_/g, ' ')} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        icon={<FiActivity size={48} />}
                        title="Sin actividad"
                        description="No hay actividad reciente registrada."
                    />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
