import React, { useEffect, useState } from 'react';
import { FiTruck, FiDollarSign, FiClock, FiStar, FiActivity } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEstadisticas, getHistorial } from '../services/conductorService';
import '../../shared/DashboardLayout.css';

const ConductorDashboard = () => {
    const { user } = useAuth();
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

    const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Cargando estadísticas...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Dashboard</h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Tu rendimiento del día y estadísticas globales</p>
            </div>

            {/* Stats HOY */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <StatCard icon={<FiTruck size={24} color="#2196f3" />} title="Viajes Hoy" value={stats?.viajes_hoy ?? 0} bg="rgba(33,150,243,0.12)" />
                <StatCard icon={<FiDollarSign size={24} color="#4caf50" />} title="Ganancias Hoy" value={fmt(stats?.ganancias_hoy)} bg="rgba(76,175,80,0.12)" />
                <StatCard icon={<FiClock size={24} color="#ff9800" />} title="Horas Hoy" value={`${stats?.horas_hoy ?? 0}h`} bg="rgba(255,152,0,0.12)" />
                <StatCard icon={<FiStar size={24} color="#9c27b0" />} title="Calificación" value={stats?.calificacion_promedio ?? '—'} sub={`${stats?.total_calificaciones ?? 0} reseñas`} bg="rgba(156,39,176,0.12)" />
            </div>

            {/* Stats Lifetime */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
                <MiniStat label="Viajes totales" value={stats?.viajes_totales ?? 0} />
                <MiniStat label="Ganancias totales" value={fmt(stats?.ganancias_totales)} />
                <MiniStat label="Miembro desde" value={stats?.fecha_registro ? new Date(stats.fecha_registro).toLocaleDateString() : '—'} />
            </div>

            {/* Recent Trips */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiActivity color="var(--primary)" /> Viajes Recientes</h2>
                {recentTrips.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {recentTrips.map((t, i) => (
                            <div key={t.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < recentTrips.length - 1 ? '1px solid var(--border, rgba(0,0,0,0.05))' : 'none' }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.95rem' }}>{t.origen_direccion || t.origen || 'Viaje'} → {t.destino_direccion || t.destino || ''}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.fecha_creacion ? new Date(t.fecha_creacion).toLocaleDateString() : '—'}</div>
                                </div>
                                <div style={{ fontWeight: '700', color: '#4caf50' }}>{fmt(t.precio_final || t.precio_estimado)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No tienes viajes recientes.</div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, sub, bg }) => (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{title}</div>
        {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sub}</div>}
    </div>
);

const MiniStat = ({ label, value }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{label}</div>
    </div>
);

export default ConductorDashboard;
