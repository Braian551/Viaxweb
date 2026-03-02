import React, { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiStar, FiTruck, FiFileText } from 'react-icons/fi';
import { getR2ImageUrl } from '../../../utils/r2Images';
import { useAuth } from '../../auth/context/AuthContext';
import { getConductorProfile } from '../services/conductorService';
import '../../shared/DashboardLayout.css';

const ConductorProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            const res = await getConductorProfile(user.id);
            if (res.success) setProfile(res.data || res.conductor || res);
            setLoading(false);
        };
        load();
    }, [user]);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)' }}>Cargando perfil...</div>;

    const p = profile || user;
    const vehiculo = p?.vehiculo || p?.vehicle;
    const documentos = p?.documentos || p?.documents || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text)' }}>Mi Perfil</h1>

            {/* Profile Card */}
            <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: '#ff9800', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', overflow: 'hidden' }}>
                    {p.foto_perfil ? <img src={getR2ImageUrl(p.foto_perfil)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.nombre || user?.nombre || 'D')?.charAt(0)?.toUpperCase()}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: 'var(--text)' }}>{p.nombre} {p.apellido}</h2>
                <span className="dash-role-badge conductor">Conductor</span>

                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                    <MiniStat icon={<FiStar color="#ff9800" />} value={p.calificacion_promedio ?? '—'} label="Rating" />
                    <MiniStat icon={<FiTruck color="#2196f3" />} value={p.total_viajes ?? 0} label="Viajes" />
                </div>
            </div>

            {/* Info */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>Información Personal</h3>
                <InfoRow icon={<FiMail />} label="Correo" value={p.email || user?.email} />
                <InfoRow icon={<FiPhone />} label="Teléfono" value={p.telefono || 'No registrado'} />
                <InfoRow icon={<FiCalendar />} label="Registrado" value={p.fecha_registro ? new Date(p.fecha_registro).toLocaleDateString() : '—'} />
            </div>

            {/* Vehicle */}
            {vehiculo && (
                <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiTruck color="var(--primary)" /> Vehículo</h3>
                    <InfoRow icon={null} label="Tipo" value={vehiculo.tipo_vehiculo || vehiculo.tipo || '—'} />
                    <InfoRow icon={null} label="Marca / Modelo" value={`${vehiculo.marca || ''} ${vehiculo.modelo || ''} ${vehiculo.anio || ''}`} />
                    <InfoRow icon={null} label="Placa" value={vehiculo.placa || '—'} />
                    <InfoRow icon={null} label="Color" value={vehiculo.color || '—'} />
                </div>
            )}

            {/* Documents */}
            {documentos.length > 0 && (
                <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiFileText color="var(--primary)" /> Documentos</h3>
                    {documentos.map((doc, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < documentos.length - 1 ? '1px solid var(--border, rgba(0,0,0,0.05))' : 'none' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.9rem' }}>{doc.tipo_documento || doc.nombre || doc.type}</div>
                            <span style={{
                                fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px',
                                background: doc.estado === 'aprobado' ? 'rgba(76,175,80,0.12)' : doc.estado === 'rechazado' ? 'rgba(244,67,54,0.12)' : 'rgba(255,152,0,0.12)',
                                color: doc.estado === 'aprobado' ? '#4caf50' : doc.estado === 'rechazado' ? '#f44336' : '#ff9800'
                            }}>{doc.estado || 'pendiente'}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border, rgba(0,0,0,0.04))' }}>
        {icon && <div style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{icon}</div>}
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</div>
            <div style={{ fontWeight: '600', color: 'var(--text)' }}>{value}</div>
        </div>
    </div>
);

const MiniStat = ({ icon, value, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <div>
            <div style={{ fontWeight: '800', color: 'var(--text)', fontSize: '1.1rem' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
        </div>
    </div>
);

export default ConductorProfile;
