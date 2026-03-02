import React, { useEffect, useState } from 'react';
import { FiMapPin, FiClock, FiStar, FiDollarSign, FiTruck } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getTripHistory, getPaymentSummary, getFavoriteDrivers } from '../services/clienteService';
import GlassStatCard from '../../shared/components/GlassStatCard';
import PageHeader from '../../shared/components/PageHeader';
import StatusBadge from '../../shared/components/StatusBadge';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';
import { ViaxAreaChart, ViaxDonutChart } from '../../shared/components/ViaxCharts';

const ClienteDashboard = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState([]);
    const [payments, setPayments] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            const [tripRes, payRes, favRes] = await Promise.all([
                getTripHistory(user.id, { page: 1, perPage: 5 }),
                getPaymentSummary(user.id),
                getFavoriteDrivers(user.id)
            ]);
            if (tripRes.success) setTrips(tripRes.data?.viajes || tripRes.viajes || []);
            if (payRes.success) setPayments(payRes.data || payRes);
            if (favRes.success) setFavorites(favRes.data?.conductores || favRes.conductores || []);
            setLoading(false);
        };
        load();
    }, [user]);

    const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);
    const tripCostTrend = trips.slice(0, 6).map((trip, index) => ({
        nombre: `V${index + 1}`,
        monto: Number(trip.precio_final || trip.precio_estimado || 0),
    }));

    const tripStatusMap = trips.reduce((acc, trip) => {
        const key = (trip.estado || 'pendiente').toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const tripStatusData = Object.entries(tripStatusMap).map(([estado, value]) => ({
        name: estado.replace(/_/g, ' '),
        value,
    }));

    if (loading) return <ShimmerDashboard />;

    return (
        <div className="v-dashboard">
            <PageHeader title="Mi Panel" subtitle="Resumen de tu actividad en VIAX" />

            <div className="v-stat-grid">
                <GlassStatCard
                    title="Viajes Realizados"
                    value={payments?.total_viajes || trips.length || 0}
                    icon={<FiTruck size={22} color="#2196f3" />}
                    accentColor="#2196f3"
                />
                <GlassStatCard
                    title="Total Gastado"
                    value={fmt(payments?.total_pagado || 0)}
                    icon={<FiDollarSign size={22} color="#4caf50" />}
                    accentColor="#4caf50"
                />
                <GlassStatCard
                    title="Conductores Favoritos"
                    value={favorites.length}
                    icon={<FiStar size={22} color="#ff9800" />}
                    accentColor="#ff9800"
                />
            </div>

            <div className="v-chart-grid">
                <div className="glass-card v-chart-card">
                    <h3 className="v-chart-title">Costo de tus últimos viajes</h3>
                    {tripCostTrend.length > 0 ? (
                        <ViaxAreaChart
                            data={tripCostTrend}
                            xKey="nombre"
                            areas={[{ dataKey: 'monto', name: 'Monto', color: '#2196f3' }]}
                            valueFormatter={(value) => fmt(value)}
                        />
                    ) : (
                        <EmptyState icon={<FiTruck size={36} />} title="Sin datos" description="Cuando tengas viajes, verás aquí la tendencia." />
                    )}
                </div>

                <div className="glass-card v-chart-card">
                    <h3 className="v-chart-title">Estado de viajes recientes</h3>
                    {tripStatusData.length > 0 ? (
                        <ViaxDonutChart data={tripStatusData} valueFormatter={(value) => `${value} viaje(s)`} />
                    ) : (
                        <EmptyState icon={<FiMapPin size={36} />} title="Sin estado" description="Aún no hay viajes para clasificar." />
                    )}
                </div>
            </div>

            {/* Recent Trips */}
            <div className="glass-card v-section">
                <div className="v-section__header">
                    <div className="v-section__icon" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                        <FiMapPin size={20} color="#2196f3" />
                    </div>
                    <h2 className="v-section__title">Últimos Viajes</h2>
                </div>

                {trips.length > 0 ? (
                    <div className="v-activity-list">
                        {trips.map((trip) => (
                            <div key={trip.id} className="v-activity-item v-activity-item--enhanced">
                                <div className="v-activity-item__timeline" />
                                <div className="v-activity-item__content">
                                    <div className="v-activity-item__title">{trip.origen_direccion || trip.origen || 'Viaje'}</div>
                                    <div className="v-activity-item__meta">
                                        {trip.destino_direccion || trip.destino || 'Destino no disponible'}
                                        <span className="v-activity-item__dot">•</span>
                                        <span className="v-activity-item__time"><FiClock size={12} /> {trip.fecha_creacion ? new Date(trip.fecha_creacion).toLocaleString() : '—'}</span>
                                    </div>
                                </div>
                                <div className="v-activity-item__badge" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {trip.estado && <StatusBadge status={trip.estado} />}
                                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(trip.precio_final || trip.precio_estimado)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<FiTruck size={48} />}
                        title="Sin viajes aún"
                        description="¡Descarga la app para solicitar tu primer viaje!"
                    />
                )}
            </div>

            {/* Favorite Drivers */}
            {favorites.length > 0 && (
                <div className="glass-card v-section">
                    <div className="v-section__header">
                        <div className="v-section__icon" style={{ background: 'rgba(255, 152, 0, 0.1)' }}>
                            <FiStar size={20} color="#ff9800" />
                        </div>
                        <h2 className="v-section__title">Conductores Favoritos</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                        {favorites.map(d => (
                            <div key={d.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '14px' }}>
                                <ProfileAvatar name={`${d.nombre} ${d.apellido}`} src={d.foto_perfil} size={44} borderRadius={12} bgColor="#ff9800" />
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{d.nombre} {d.apellido}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>&#11088; {d.calificacion_promedio || '—'} &bull; {d.total_viajes || 0} viajes</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClienteDashboard;
