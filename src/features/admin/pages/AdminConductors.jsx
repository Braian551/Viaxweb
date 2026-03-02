import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiFileText, FiAlertCircle, FiEye } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getConductorsDocuments, approveConductor, rejectConductor } from '../services/adminService';
import '../layout/AdminLayout.css';

const AdminConductors = () => {
    const { user } = useAuth();
    const [conductors, setConductors] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [estadoFilter, setEstadoFilter] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [selectedConductor, setSelectedConductor] = useState(null);

    const fetchConductors = async () => {
        if (!user || (user.tipo_usuario !== 'admin' && user.tipo_usuario !== 'administrador')) return;
        setLoading(true);
        const res = await getConductorsDocuments(user.id, { page, perPage: 12, estado: estadoFilter });

        if (res.success && res.data) {
            setConductors(res.data.conductores || []);
            setStats(res.data.estadisticas);
            setTotalPages(res.data.pagination?.total_pages || 1);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchConductors();
        // eslint-disable-next-line
    }, [user, page, estadoFilter]);

    const handleApprove = async (conductorId) => {
        if (!window.confirm('¿Estás seguro de que deseas APROBAR a este conductor?')) return;
        setActionLoading(conductorId);
        const res = await approveConductor(user.id, conductorId);
        alert(res.message);
        if (res.success) fetchConductors();
        setActionLoading(null);
    };

    const handleReject = async (conductorId) => {
        if (!rejectReason.trim()) {
            alert('Por favor, ingresa el motivo del rechazo.');
            return;
        }
        if (!window.confirm('¿Estás seguro de que deseas RECHAZAR a este conductor?')) return;
        setActionLoading(conductorId);
        const res = await rejectConductor(user.id, conductorId, rejectReason);
        alert(res.message);
        if (res.success) {
            setSelectedConductor(null);
            setRejectReason('');
            fetchConductors();
        }
        setActionLoading(null);
    };

    const getStatusUI = (status) => {
        switch (status) {
            case 'aprobado': return <span className="status-badge status-active"><FiCheckCircle /> Aprobado</span>;
            case 'rechazado': return <span className="status-badge status-inactive"><FiXCircle /> Rechazado</span>;
            case 'en_revision': return <span className="status-badge status-pending" style={{ background: 'rgba(33, 150, 243, 0.15)', color: '#2196f3' }}><FiEye /> En Revisión</span>;
            case 'pendiente':
            default: return <span className="status-badge status-pending"><FiClock /> Pendiente</span>;
        }
    };

    return (
        <div className="admin-dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Conductores y Documentos</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Aprobación y revisión de documentos.</p>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                    <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text)' }}>{stats.total_conductores}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Total Conductores</div>
                    </div>
                    <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ff9800' }}>{stats.en_revision}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>En Revisión</div>
                    </div>
                    <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4caf50' }}>{stats.aprobados}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Aprobados</div>
                    </div>
                    <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f44336' }}>{stats.rechazados}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Rechazados</div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', marginRight: '8px' }}>Filtrar por estado:</span>
                {[
                    { value: '', label: 'Todos' },
                    { value: 'en_revision', label: 'En Revisión (Listos para aprobar)' },
                    { value: 'pendiente', label: 'Pendientes (Faltan Docs)' },
                    { value: 'aprobado', label: 'Aprobados' },
                    { value: 'rechazado', label: 'Rechazados' }
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => { setEstadoFilter(f.value); setPage(1); }}
                        style={{
                            padding: '8px 16px', borderRadius: '10px',
                            border: estadoFilter === f.value ? '1px solid var(--primary)' : '1px solid var(--border)',
                            background: estadoFilter === f.value ? 'var(--primary-alpha, rgba(33, 150, 243, 0.15))' : 'transparent',
                            color: estadoFilter === f.value ? 'var(--primary)' : 'var(--text-secondary)',
                            fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Conductors Grid */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Cargando conductores...</div>
            ) : conductors.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '24px' }}>
                    <FiFileText size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                    <p>No se encontraron conductores con estos filtros.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {conductors.map(c => (
                        <div key={c.usuario_id} className="glass-card conductor-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>

                            {/* Warning if expired docs */}
                            {c.tiene_documentos_vencidos && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#f44336', color: 'white', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FiAlertCircle /> Docs Vencidos: {c.documentos_vencidos.join(', ')}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: c.tiene_documentos_vencidos ? '16px' : '0' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', overflow: 'hidden' }}>
                                    {c.foto_perfil ? <img src={c.foto_perfil} alt={c.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.nombre?.charAt(0) || '?'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>
                                        {c.nombre_completo}
                                    </h3>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.email}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.telefono}</div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border, rgba(0,0,0,0.05))', borderBottom: '1px solid var(--border, rgba(0,0,0,0.05))', padding: '12px 0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completitud de Docs</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: c.porcentaje_completitud === 100 ? '#4caf50' : 'var(--primary)' }}>{c.porcentaje_completitud}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${c.porcentaje_completitud}%`, height: '100%', background: c.porcentaje_completitud === 100 ? '#4caf50' : 'var(--primary)', transition: 'width 0.3s' }}></div>
                                </div>
                                {c.documentos_pendientes?.length > 0 && (
                                    <div style={{ fontSize: '0.75rem', color: '#ff9800', marginTop: '8px' }}>
                                        <strong>Faltan:</strong> {c.documentos_pendientes.join(', ')}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                {getStatusUI(c.estado_verificacion)}

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {/* Actions */}
                                    {(c.estado_verificacion === 'en_revision' || c.estado_verificacion === 'pendiente') && c.porcentaje_completitud > 50 && (
                                        <>
                                            <button
                                                onClick={() => setSelectedConductor(c.usuario_id)}
                                                disabled={actionLoading === c.usuario_id}
                                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #f44336', background: 'transparent', color: '#f44336', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}
                                            >
                                                Rechazar
                                            </button>
                                            <button
                                                onClick={() => handleApprove(c.usuario_id)}
                                                disabled={actionLoading === c.usuario_id || c.porcentaje_completitud < 100}
                                                style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: c.porcentaje_completitud === 100 ? '#4caf50' : 'var(--bg)', color: c.porcentaje_completitud === 100 ? 'white' : 'var(--text-secondary)', fontWeight: '600', fontSize: '0.8rem', cursor: c.porcentaje_completitud === 100 ? 'pointer' : 'not-allowed' }}
                                                title={c.porcentaje_completitud < 100 ? 'Demasiados documentos faltantes' : 'Aprobar'}
                                            >
                                                {actionLoading === c.usuario_id ? 'Procesando...' : 'Aprobar'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Rejection Modal Inline */}
                            {selectedConductor === c.usuario_id && (
                                <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid #f44336' }}>
                                    <textarea
                                        placeholder="Motivo del rechazo (ej. Licencia borrosa, Vencida...)"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', outline: 'none', resize: 'vertical', minHeight: '60px', marginBottom: '8px', fontSize: '0.85rem' }}
                                    ></textarea>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button onClick={() => setSelectedConductor(null)} style={{ padding: '6px 12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}>Cancelar</button>
                                        <button onClick={() => handleReject(c.usuario_id)} style={{ padding: '6px 12px', background: '#f44336', border: 'none', color: 'white', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Confirmar Rechazo</button>
                                    </div>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                    <button disabled={page === 1} onClick={() => setPage(page - 1)} className="pagination-btn">Anterior</button>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Página {page} de {totalPages}
                    </span>
                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="pagination-btn">Siguiente</button>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .conductor-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .conductor-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
                [data-theme='dark'] .conductor-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
                
                .status-badge { display: inline-flex; alignItems: center; gap: 4px; padding: 6px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
                .status-active { background: rgba(76, 175, 80, 0.15); color: #4caf50; }
                .status-inactive { background: rgba(244, 67, 54, 0.15); color: #f44336; }
                .status-pending { background: rgba(255, 152, 0, 0.15); color: #ff9800; }
                
                .pagination-btn { padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text); font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .pagination-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
                .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}} />
        </div>
    );
};

export default AdminConductors;
