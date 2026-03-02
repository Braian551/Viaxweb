import React, { useEffect, useState } from 'react';
import { FiUsers, FiTruck, FiDollarSign, FiBriefcase, FiActivity } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaProfile, getSolicitudesVinculacion } from '../services/empresaService';
import '../../shared/DashboardLayout.css';

const EmpresaDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const empresaId = user.empresa_id || user.id;
        const load = async () => {
            setLoading(true);
            const [profRes, solRes] = await Promise.all([
                getEmpresaProfile(empresaId),
                getSolicitudesVinculacion(empresaId, { page: 1, perPage: 5 })
            ]);
            if (profRes.success) setProfile(profRes.data || profRes.empresa || profRes);
            if (solRes.success) setSolicitudes(solRes.data?.solicitudes || solRes.solicitudes || []);
            setLoading(false);
        };
        load();
    }, [user]);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Cargando dashboard...</div>;

    const empresa = profile?.empresa || profile || {};
    const stats = profile?.estadisticas || {};

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Dashboard Empresa</h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{empresa.nombre_empresa || empresa.nombre || 'Mi Empresa'}</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <StatCard icon={<FiUsers size={24} color="#9c27b0" />} title="Conductores Vinculados" value={stats.conductores_vinculados ?? empresa.total_conductores ?? 0} bg="rgba(156,39,176,0.12)" />
                <StatCard icon={<FiTruck size={24} color="#2196f3" />} title="Viajes Totales" value={stats.viajes_totales ?? 0} bg="rgba(33,150,243,0.12)" />
                <StatCard icon={<FiDollarSign size={24} color="#4caf50" />} title="Ingresos Generados" value={new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(stats.ingresos_totales || 0)} bg="rgba(76,175,80,0.12)" />
                <StatCard icon={<FiBriefcase size={24} color="#ff9800" />} title="Estado" value={empresa.es_activa || empresa.estado === 'activa' ? 'Activa' : 'Inactiva'} bg="rgba(255,152,0,0.12)" />
            </div>

            {/* Company Info */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--text)' }}>Información de la Empresa</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                    <InfoItem label="NIT" value={empresa.nit || '—'} />
                    <InfoItem label="Email" value={empresa.email_empresa || empresa.email || '—'} />
                    <InfoItem label="Teléfono" value={empresa.telefono || '—'} />
                    <InfoItem label="Municipio" value={empresa.municipio || '—'} />
                    <InfoItem label="Dirección" value={empresa.direccion || '—'} />
                    <InfoItem label="Comisión Plataforma" value={`${empresa.comision_plataforma ?? stats.comision_plataforma ?? '—'}%`} />
                </div>
            </div>

            {/* Recent Solicitudes */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiActivity color="var(--primary)" /> Solicitudes de Vinculación Recientes</h2>
                {solicitudes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {solicitudes.map((s, i) => (
                            <div key={s.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < solicitudes.length - 1 ? '1px solid var(--border, rgba(0,0,0,0.05))' : 'none' }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>{s.conductor_nombre || s.nombre} {s.conductor_apellido || s.apellido || ''}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString() : '—'}</div>
                                </div>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px',
                                    background: s.estado === 'aprobada' ? 'rgba(76,175,80,0.12)' : s.estado === 'rechazada' ? 'rgba(244,67,54,0.12)' : 'rgba(255,152,0,0.12)',
                                    color: s.estado === 'aprobada' ? '#4caf50' : s.estado === 'rechazada' ? '#f44336' : '#ff9800'
                                }}>{s.estado || 'pendiente'}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay solicitudes recientes.</div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, bg }) => (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text)' }}>{value}</div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{title}</div>
    </div>
);

const InfoItem = ({ label, value }) => (
    <div style={{ padding: '10px 0' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '500', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontWeight: '600', color: 'var(--text)' }}>{value}</div>
    </div>
);

export default EmpresaDashboard;
