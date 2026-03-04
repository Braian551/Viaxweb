import React, { useEffect, useState } from 'react';
import { FiCheck, FiX, FiUsers, FiClock, FiMail, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getSolicitudesVinculacion, gestionarSolicitud } from '../services/empresaService';
import PageHeader from '../../shared/components/PageHeader';
import FilterBar from '../../shared/components/FilterBar';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import StatusBadge from '../../shared/components/StatusBadge';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerCardGrid } from '../../shared/components/ShimmerLoader';

const STATUS_FILTERS = [
    { value: '', label: 'Todas', icon: <FiUsers /> },
    { value: 'pendiente', label: 'Pendientes', icon: <FiClock /> },
    { value: 'aprobada', label: 'Aprobadas', icon: <FiCheck /> },
    { value: 'rechazada', label: 'Rechazadas', icon: <FiX /> },
];

const EmpresaConductors = () => {
    const { user } = useAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [filtro, setFiltro] = useState('');

    const empresaId = user?.empresa_id || user?.id;

    const fetchData = async () => {
        setLoading(true);
        const res = await getSolicitudesVinculacion(empresaId);
        if (res.success) setSolicitudes(res.data?.solicitudes || res.solicitudes || []);
        setLoading(false);
    };

    useEffect(() => { if (user) fetchData(); }, [user]);

    const handleAction = async (conductorId, accion) => {
        const confirmMsg = accion === 'aprobar' ? '¿Aprobar esta solicitud?' : '¿Rechazar esta solicitud?';
        if (!window.confirm(confirmMsg)) return;
        setActionLoading(conductorId);
        const res = await gestionarSolicitud(empresaId, conductorId, accion, '', user?.id);
        alert(res.message || (res.success ? 'Acción realizada' : 'Error'));
        if (res.success) fetchData();
        setActionLoading(null);
    };

    const filtered = filtro ? solicitudes.filter(s => s.estado === filtro) : solicitudes;
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;

    const filtersWithCounts = STATUS_FILTERS.map(f => ({
        ...f,
        count: f.value === '' ? solicitudes.length : solicitudes.filter(s => s.estado === f.value).length,
    }));

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Conductores"
                subtitle="Gestión de solicitudes de vinculación"
                actions={
                    pendientes > 0 ? (
                        <span className="v-status-badge" style={{ background: 'rgba(255,152,0,0.12)', color: '#ff9800', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem' }}>
                            <FiClock /> {pendientes} pendiente{pendientes > 1 ? 's' : ''}
                        </span>
                    ) : null
                }
            />

            <FilterBar filters={filtersWithCounts} activeValue={filtro} onChange={setFiltro} />

            {loading ? (
                <ShimmerCardGrid count={4} />
            ) : filtered.length === 0 ? (
                <EmptyState icon={<FiUsers />} title="Sin solicitudes" description="No hay solicitudes con este filtro." />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                    {filtered.map(s => (
                        <div key={s.id} className="glass-card v-section" style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: 12 }}>
                                <ProfileAvatar
                                    src={s.conductor_foto || s.foto_perfil}
                                    name={`${s.conductor_nombre || s.nombre || '?'} ${s.conductor_apellido || s.apellido || ''}`}
                                    size={50}
                                    borderRadius={14}
                                    bgColor="#ff9800"
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {s.conductor_nombre || s.nombre} {s.conductor_apellido || s.apellido || ''}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <FiMail size={12} /> {s.conductor_email || s.email || '—'}
                                    </div>
                                </div>
                                <StatusBadge status={s.estado} />
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                                Solicitado: {s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString() : '—'}
                            </div>

                            {s.estado === 'pendiente' && s.es_solicitud_pendiente && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 4 }}>
                                    <button
                                        className="v-btn v-btn--outline v-btn--danger"
                                        onClick={() => handleAction(s.conductor_id, 'rechazar')}
                                        disabled={actionLoading === s.conductor_id}
                                        style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                                    >
                                        <FiX size={14} /> Rechazar
                                    </button>
                                    <button
                                        className="v-btn v-btn--success"
                                        onClick={() => handleAction(s.conductor_id, 'aprobar')}
                                        disabled={actionLoading === s.conductor_id}
                                        style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                                    >
                                        {actionLoading === s.conductor_id ? <><FiRefreshCw size={14} className="v-spin" /> Procesando...</> : <><FiCheck size={14} /> Aprobar</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EmpresaConductors;
