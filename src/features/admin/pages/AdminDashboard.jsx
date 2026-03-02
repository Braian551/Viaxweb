import React, { useEffect, useState } from 'react';
import { FiUsers, FiActivity, FiDollarSign, FiAlertCircle, FiMonitor, FiTrendingUp } from 'react-icons/fi';
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

            {/* Recent Activity */}
            <div className="glass-card v-section">
                <div className="v-section__header">
                    <div className="v-section__icon" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                        <FiMonitor size={20} color="#2196f3" />
                    </div>
                    <h2 className="v-section__title">Actividad Reciente</h2>
                </div>

                {actividades_recientes && actividades_recientes.length > 0 ? (
                    <div>
                        {actividades_recientes.slice(0, 6).map((act) => (
                            <div key={act.id} className="v-activity-item">
                                <div className="v-activity-item__content">
                                    <div className="v-activity-item__title">{act.descripcion}</div>
                                    <div className="v-activity-item__meta">
                                        {act.nombre} {act.apellido} &bull; {new Date(act.fecha_creacion).toLocaleString()}
                                    </div>
                                </div>
                                <div className="v-activity-item__badge">
                                    <StatusBadge status={act.accion?.includes('login') ? 'activo' : act.accion?.includes('crear') ? 'aprobado' : 'pendiente'} label={act.accion} />
                                </div>
                            </div>
                        ))}
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
