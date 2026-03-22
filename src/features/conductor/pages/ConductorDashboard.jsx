import React, { useEffect, useState } from 'react';
import { FiTruck, FiDollarSign, FiClock, FiStar, FiActivity, FiFlag } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEstadisticas, getHistorial } from '../services/conductorService';
import GlassStatCard from '../../shared/components/GlassStatCard';
import PageHeader from '../../shared/components/PageHeader';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';
import { ViaxAreaChart, ViaxDonutChart } from '../../shared/components/ViaxCharts';
import { reportUser } from '../../shared/services/userModerationService';
import { useSnackbar } from '../../shared/components/AppSnackbar';

const ConductorDashboard = () => {
    const { user } = useAuth();
    const { showSnackbar } = useSnackbar();
    const [stats, setStats] = useState(null);
    const [recentTrips, setRecentTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            const [statsRes, histRes] = await Promise.all([
                getEstadisticas(user.id),
                getHistorial(user.id, { page: 1, perPage: 5 })
            ]);
            if (statsRes.success) setStats(statsRes.estadisticas);
            if (histRes.success) setRecentTrips(histRes.data?.viajes || histRes.viajes || []);
            setLoading(false);
        };
        load();
    }, [user]);

    const extractClienteId = (trip = {}) => {
        const candidates = [
            trip.cliente_id,
            trip.user_id,
            trip.id_cliente,
            trip.cliente?.id,
            trip.user?.id,
        ];
        const found = candidates.find((value) => Number(value) > 0);
        return Number(found || 0);
    };

    const reportTripUser = async (trip) => {
        const reportedUserId = extractClienteId(trip);
        if (!user?.id || !reportedUserId) {
            showSnackbar('No se pudo identificar al usuario a reportar.', { type: 'warning' });
            return;
        }

        const reason = window.prompt(
            'Motivo del reporte (comportamiento_inapropiado, acoso_o_amenaza, fraude_o_estafa, incumplimiento_servicio, contenido_inapropiado_chat, otro):',
            'comportamiento_inapropiado'
        );
        if (!reason) return;

        const details = window.prompt('Detalles del reporte (opcional):', '') || '';

        const res = await reportUser({
            reporterUserId: Number(user.id),
            reportedUserId,
            solicitudId: Number(trip.id || 0) || undefined,
            motivo: reason,
            descripcion: details,
            prioridad: 'media',
        });

        if (res?.success) {
            showSnackbar('Reporte enviado correctamente.', { type: 'success' });
        } else {
            showSnackbar(res?.message || 'No se pudo enviar el reporte.', { type: 'error' });
        }
    };

    const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);
    const earningsTrend = recentTrips.slice(0, 6).map((trip, index) => ({
        viaje: `V${index + 1}`,
        ingreso: Number(trip.precio_final || trip.precio_estimado || 0),
    }));

    const tripsToday = Number(stats?.viajes_hoy || 0);
    const tripsTotal = Number(stats?.viajes_totales || 0);
    const tripsHistoric = Math.max(tripsTotal - tripsToday, 0);
    const tripDistributionData = [
        { name: 'Hoy', value: tripsToday, color: '#2196f3' },
        { name: 'Histórico', value: tripsHistoric, color: '#9c27b0' },
    ].filter(item => item.value > 0);

    if (loading) return <ShimmerDashboard />;

    return (
        <div className="v-dashboard">
            <PageHeader title="Dashboard" subtitle="Tu rendimiento del día y estadísticas globales" />

            {/* Today Stats */}
            <div className="v-stat-grid">
                <GlassStatCard title="Viajes Hoy" value={stats?.viajes_hoy ?? 0} icon={<FiTruck size={22} color="#2196f3" />} accentColor="#2196f3" />
                <GlassStatCard title="Ganancias Hoy" value={fmt(stats?.ganancias_hoy)} icon={<FiDollarSign size={22} color="#4caf50" />} accentColor="#4caf50" />
                <GlassStatCard title="Horas Hoy" value={`${stats?.horas_hoy ?? 0}h`} icon={<FiClock size={22} color="#ff9800" />} accentColor="#ff9800" />
                <GlassStatCard title="Calificación" value={stats?.calificacion_promedio ?? '—'} subtitle={`${stats?.total_calificaciones ?? 0} reseñas`} icon={<FiStar size={22} color="#9c27b0" />} accentColor="#9c27b0" />
            </div>

            <div className="v-chart-grid">
                <div className="glass-card v-chart-card">
                    <h3 className="v-chart-title">Tendencia de ingresos recientes</h3>
                    {earningsTrend.length > 0 ? (
                        <ViaxAreaChart
                            data={earningsTrend}
                            xKey="viaje"
                            areas={[{ dataKey: 'ingreso', name: 'Ingreso', color: '#4caf50' }]}
                            valueFormatter={(value) => fmt(value)}
                        />
                    ) : (
                        <EmptyState icon={<FiDollarSign size={36} />} title="Sin ingresos recientes" description="Completa viajes para ver tu tendencia." />
                    )}
                </div>

                <div className="glass-card v-chart-card">
                    <h3 className="v-chart-title">Distribución de viajes</h3>
                    {tripDistributionData.length > 0 ? (
                        <ViaxDonutChart data={tripDistributionData} valueFormatter={(value) => `${value} viaje(s)`} />
                    ) : (
                        <EmptyState icon={<FiTruck size={36} />} title="Sin viajes" description="Aún no hay viajes para graficar." />
                    )}
                </div>
            </div>

            {/* Lifetime Stats */}
            <div className="glass-card v-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px', textAlign: 'center' }}>
                <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>{stats?.viajes_totales ?? 0}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Viajes totales</div>
                </div>
                <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>{fmt(stats?.ganancias_totales)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Ganancias totales</div>
                </div>
                <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>{stats?.fecha_registro ? new Date(stats.fecha_registro).toLocaleDateString() : '—'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Miembro desde</div>
                </div>
            </div>

            {/* Recent Trips */}
            <div className="glass-card v-section">
                <div className="v-section__header">
                    <div className="v-section__icon" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                        <FiActivity size={20} color="#2196f3" />
                    </div>
                    <h2 className="v-section__title">Viajes Recientes</h2>
                </div>

                {recentTrips.length > 0 ? (
                    <div className="v-activity-list">
                        {recentTrips.map((t) => (
                            <div key={t.id} className="v-activity-item v-activity-item--enhanced">
                                <div className="v-activity-item__timeline" />
                                <div className="v-activity-item__content">
                                    <div className="v-activity-item__title">{t.origen_direccion || t.origen || 'Viaje'} &rarr; {t.destino_direccion || t.destino || ''}</div>
                                    <div className="v-activity-item__meta">
                                        <span className="v-activity-item__time"><FiClock size={12} /> {t.fecha_creacion ? new Date(t.fecha_creacion).toLocaleString() : '—'}</span>
                                    </div>
                                </div>
                                <div className="v-activity-item__badge">
                                    <span style={{ fontWeight: 700, color: '#4caf50' }}>{fmt(t.precio_final || t.precio_estimado)}</span>
                                    {extractClienteId(t) > 0 && (
                                        <button
                                            type="button"
                                            className="v-btn-lite"
                                            style={{ marginTop: '8px' }}
                                            onClick={() => reportTripUser(t)}
                                        >
                                            <FiFlag /> Reportar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={<FiTruck size={48} />} title="Sin viajes" description="No tienes viajes recientes." />
                )}
            </div>
        </div>
    );
};

export default ConductorDashboard;
