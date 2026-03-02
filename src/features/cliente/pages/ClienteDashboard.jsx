import React, { useEffect, useState } from 'react';
import { FiMapPin, FiClock, FiStar, FiDollarSign, FiTruck } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getTripHistory, getPaymentSummary, getFavoriteDrivers } from '../services/clienteService';
import '../../shared/DashboardLayout.css';

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

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Cargando tu panel...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Mi Panel</h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Resumen de tu actividad en VIAX</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                    <FiTruck size={28} color="#2196f3" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)' }}>{payments?.total_viajes || trips.length || 0}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Viajes Realizados</div>
                </div>
                <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                    <FiDollarSign size={28} color="#4caf50" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)' }}>{fmt(payments?.total_pagado || 0)}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Gastado</div>
                </div>
                <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                    <FiStar size={28} color="#ff9800" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)' }}>{favorites.length}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Conductores Favoritos</div>
                </div>
            </div>

            {/* Recent Trips */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--text)' }}>Últimos Viajes</h2>
                {trips.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {trips.map((trip, i) => (
                            <div key={trip.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < trips.length - 1 ? '1px solid var(--border, rgba(0,0,0,0.05))' : 'none' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <FiMapPin color="var(--primary)" />
                                    <div>
                                        <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.95rem' }}>{trip.origen_direccion || trip.origen || 'Viaje'}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            <FiClock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                            {trip.fecha_creacion ? new Date(trip.fecha_creacion).toLocaleDateString() : '—'}
                                            {trip.estado && <span style={{ marginLeft: '8px', padding: '2px 8px', borderRadius: '4px', background: trip.estado === 'completada' ? 'rgba(76,175,80,0.12)' : 'rgba(255,152,0,0.12)', color: trip.estado === 'completada' ? '#4caf50' : '#ff9800', fontSize: '0.75rem', fontWeight: '600' }}>{trip.estado}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontWeight: '700', color: 'var(--text)' }}>{fmt(trip.precio_final || trip.precio_estimado)}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No tienes viajes aún. ¡Descarga la app para solicitar tu primer viaje!</div>
                )}
            </div>

            {/* Favorite Drivers */}
            {favorites.length > 0 && (
                <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--text)' }}>Conductores Favoritos</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                        {favorites.map(d => (
                            <div key={d.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'var(--bg, #f8f9fa)', borderRadius: '12px' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{d.nombre?.charAt(0) || '?'}</div>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>{d.nombre} {d.apellido}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>⭐ {d.calificacion_promedio || '—'} • {d.total_viajes || 0} viajes</div>
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
