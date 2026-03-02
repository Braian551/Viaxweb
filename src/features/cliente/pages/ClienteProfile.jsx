import React, { useEffect, useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar } from 'react-icons/fi';
import { getR2ImageUrl } from '../../../utils/r2Images';
import { useAuth } from '../../auth/context/AuthContext';
import { getProfile } from '../services/clienteService';
import '../../shared/DashboardLayout.css';

const ClienteProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.email) return;
        const load = async () => {
            setLoading(true);
            const res = await getProfile(user.email);
            if (res.success) setProfile(res.data?.user || res.user || user);
            else setProfile(user);
            setLoading(false);
        };
        load();
    }, [user]);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)' }}>Cargando perfil...</div>;

    const p = profile || user;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--text)' }}>Mi Perfil</h1>

            <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: '800', overflow: 'hidden' }}>
                    {p.foto_perfil ? <img src={getR2ImageUrl(p.foto_perfil)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : p.nombre?.charAt(0)?.toUpperCase() || 'C'}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: '700', color: 'var(--text)' }}>{p.nombre} {p.apellido}</h2>
                    <span className="dash-role-badge cliente">Cliente</span>
                </div>
            </div>

            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InfoRow icon={<FiMail />} label="Correo" value={p.email} />
                <InfoRow icon={<FiPhone />} label="Teléfono" value={p.telefono || 'No registrado'} />
                <InfoRow icon={<FiCalendar />} label="Registrado" value={p.fecha_registro ? new Date(p.fecha_registro).toLocaleDateString() : '—'} />
                <InfoRow icon={<FiUser />} label="Estado" value={p.es_activo ? 'Activo' : 'Inactivo'} />
            </div>
        </div>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border, rgba(0,0,0,0.05))' }}>
        <div style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{icon}</div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</div>
            <div style={{ fontWeight: '600', color: 'var(--text)' }}>{value}</div>
        </div>
    </div>
);

export default ClienteProfile;
