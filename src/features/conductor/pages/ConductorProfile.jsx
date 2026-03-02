import React, { useEffect, useState } from 'react';
import { FiMail, FiPhone, FiCalendar, FiStar, FiTruck, FiFileText } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getConductorProfile } from '../services/conductorService';
import PageHeader from '../../shared/components/PageHeader';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import StatusBadge from '../../shared/components/StatusBadge';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';

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

    if (loading) return <ShimmerDashboard />;

    const p = profile || user;
    const vehiculo = p?.vehiculo || p?.vehicle;
    const documentos = p?.documentos || p?.documents || [];

    return (
        <div className="v-dashboard" style={{ maxWidth: '700px' }}>
            <PageHeader title="Mi Perfil" />

            {/* Profile Card */}
            <div className="glass-card v-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <ProfileAvatar src={p.foto_perfil} name={`${p.nombre || user?.nombre || ''} ${p.apellido || ''}`} size={100} borderRadius={24} bgColor="#ff9800" fontSize="2.2rem" />
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>{p.nombre} {p.apellido}</h2>
                <StatusBadge status="activo" label="Conductor" />

                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiStar size={18} color="#ff9800" />
                        <div>
                            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.1rem' }}>{p.calificacion_promedio ?? '—'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Rating</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiTruck size={18} color="#2196f3" />
                        <div>
                            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: '1.1rem' }}>{p.total_viajes ?? 0}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Viajes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="glass-card v-section">
                <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>Información Personal</h3>
                <div className="v-info-rows">
                    <div className="v-info-row">
                        <span className="v-info-row__label"><FiMail size={14} /> Correo</span>
                        <span className="v-info-row__value">{p.email || user?.email}</span>
                    </div>
                    <div className="v-info-row">
                        <span className="v-info-row__label"><FiPhone size={14} /> Teléfono</span>
                        <span className="v-info-row__value">{p.telefono || 'No registrado'}</span>
                    </div>
                    <div className="v-info-row">
                        <span className="v-info-row__label"><FiCalendar size={14} /> Registrado</span>
                        <span className="v-info-row__value">{p.fecha_registro ? new Date(p.fecha_registro).toLocaleDateString() : '—'}</span>
                    </div>
                </div>
            </div>

            {/* Vehicle */}
            {vehiculo && (
                <div className="glass-card v-section">
                    <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiTruck color="#2196f3" size={18} /> Vehículo
                    </h3>
                    <div className="v-info-rows">
                        <div className="v-info-row">
                            <span className="v-info-row__label">Tipo</span>
                            <span className="v-info-row__value">{vehiculo.tipo_vehiculo || vehiculo.tipo || '—'}</span>
                        </div>
                        <div className="v-info-row">
                            <span className="v-info-row__label">Marca / Modelo</span>
                            <span className="v-info-row__value">{`${vehiculo.marca || ''} ${vehiculo.modelo || ''} ${vehiculo.anio || ''}`.trim() || '—'}</span>
                        </div>
                        <div className="v-info-row">
                            <span className="v-info-row__label">Placa</span>
                            <span className="v-info-row__value">{vehiculo.placa || '—'}</span>
                        </div>
                        <div className="v-info-row">
                            <span className="v-info-row__label">Color</span>
                            <span className="v-info-row__value">{vehiculo.color || '—'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Documents */}
            {documentos.length > 0 && (
                <div className="glass-card v-section">
                    <h3 style={{ margin: '0 0 12px', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiFileText color="#2196f3" size={18} /> Documentos
                    </h3>
                    <div className="v-info-rows">
                        {documentos.map((doc, i) => (
                            <div key={i} className="v-info-row">
                                <span className="v-info-row__label">{doc.tipo_documento || doc.nombre || doc.type}</span>
                                <span className="v-info-row__value">
                                    <StatusBadge status={doc.estado || 'pendiente'} />
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConductorProfile;
