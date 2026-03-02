import React, { useEffect, useState } from 'react';
import { FiCheck, FiX, FiUsers, FiClock } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getSolicitudesVinculacion, gestionarSolicitud } from '../services/empresaService';
import '../../shared/DashboardLayout.css';

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

    const handleAction = async (solId, accion) => {
        const confirmMsg = accion === 'aprobar' ? '¿Aprobar esta solicitud?' : '¿Rechazar esta solicitud?';
        if (!window.confirm(confirmMsg)) return;
        setActionLoading(solId);
        const res = await gestionarSolicitud(empresaId, solId, accion);
        alert(res.message || (res.success ? 'Acción realizada' : 'Error'));
        if (res.success) fetchData();
        setActionLoading(null);
    };

    const filtered = filtro ? solicitudes.filter(s => s.estado === filtro) : solicitudes;
    const pendientes = solicitudes.filter(s => s.estado === 'pendiente').length;

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Cargando conductores...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Conductores</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Gestión de solicitudes de vinculación</p>
                </div>
                {pendientes > 0 && (
                    <div style={{ background: 'rgba(255,152,0,0.12)', color: '#ff9800', padding: '8px 16px', borderRadius: '12px', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiClock /> {pendientes} pendiente{pendientes > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Filters */}
            <div className="glass-card" style={{ padding: '12px 16px', borderRadius: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                    { value: '', label: 'Todas' },
                    { value: 'pendiente', label: 'Pendientes' },
                    { value: 'aprobada', label: 'Aprobadas' },
                    { value: 'rechazada', label: 'Rechazadas' },
                ].map(f => (
                    <button key={f.value} onClick={() => setFiltro(f.value)} style={{
                        padding: '6px 14px', borderRadius: '8px', border: filtro === f.value ? '1px solid var(--primary)' : '1px solid var(--border, rgba(0,0,0,0.08))',
                        background: filtro === f.value ? 'rgba(33,150,243,0.1)' : 'transparent',
                        color: filtro === f.value ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer'
                    }}>{f.label}</button>
                ))}
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '20px' }}>
                    <FiUsers size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
                    <p>No hay solicitudes con este filtro.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                    {filtered.map(s => (
                        <div key={s.id} className="glass-card" style={{ padding: '20px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'transform 0.2s' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#ff9800', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.2rem' }}>{(s.conductor_nombre || s.nombre || '?').charAt(0)}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700', color: 'var(--text)' }}>{s.conductor_nombre || s.nombre} {s.conductor_apellido || s.apellido || ''}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.conductor_email || s.email || ''}</div>
                                </div>
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: '700', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase',
                                    background: s.estado === 'aprobada' ? 'rgba(76,175,80,0.12)' : s.estado === 'rechazada' ? 'rgba(244,67,54,0.12)' : 'rgba(255,152,0,0.12)',
                                    color: s.estado === 'aprobada' ? '#4caf50' : s.estado === 'rechazada' ? '#f44336' : '#ff9800'
                                }}>{s.estado}</span>
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Solicitado: {s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString() : '—'}</div>

                            {s.estado === 'pendiente' && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                                    <button onClick={() => handleAction(s.id, 'rechazar')} disabled={actionLoading === s.id} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #f44336', background: 'transparent', color: '#f44336', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><FiX size={14} /> Rechazar</button>
                                    <button onClick={() => handleAction(s.id, 'aprobar')} disabled={actionLoading === s.id} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#4caf50', color: 'white', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><FiCheck size={14} /> {actionLoading === s.id ? 'Procesando...' : 'Aprobar'}</button>
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
