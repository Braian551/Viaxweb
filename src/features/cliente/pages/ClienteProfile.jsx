import React, { useEffect, useState } from 'react';
import { FiMail, FiPhone, FiCalendar, FiUser } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getProfile } from '../services/clienteService';
import PageHeader from '../../shared/components/PageHeader';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import StatusBadge from '../../shared/components/StatusBadge';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';

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

    if (loading) return <ShimmerDashboard />;

    const p = profile || user;

    return (
        <div className="v-dashboard" style={{ maxWidth: '600px' }}>
            <PageHeader title="Mi Perfil" />

            <div className="glass-card v-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <ProfileAvatar src={p.foto_perfil} name={`${p.nombre} ${p.apellido}`} size={100} borderRadius={24} bgColor="#2196f3" fontSize="2.2rem" />
                <div style={{ textAlign: 'center' }}>
                    <h2 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>{p.nombre} {p.apellido}</h2>
                    <StatusBadge status="activo" label="Cliente" />
                </div>
            </div>

            <div className="glass-card v-section">
                <div className="v-info-rows">
                    <div className="v-info-row">
                        <span className="v-info-row__label"><FiMail size={14} /> Correo</span>
                        <span className="v-info-row__value">{p.email}</span>
                    </div>
                    <div className="v-info-row">
                        <span className="v-info-row__label"><FiPhone size={14} /> Teléfono</span>
                        <span className="v-info-row__value">{p.telefono || 'No registrado'}</span>
                    </div>
                    <div className="v-info-row">
                        <span className="v-info-row__label"><FiCalendar size={14} /> Registrado</span>
                        <span className="v-info-row__value">{p.fecha_registro ? new Date(p.fecha_registro).toLocaleDateString() : '—'}</span>
                    </div>
                    <div className="v-info-row">
                        <span className="v-info-row__label"><FiUser size={14} /> Estado</span>
                        <span className="v-info-row__value"><StatusBadge status={p.es_activo ? 'activo' : 'inactivo'} /></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClienteProfile;
