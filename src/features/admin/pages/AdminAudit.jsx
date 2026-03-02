import React, { useEffect, useState } from 'react';
import { FiActivity, FiFilter, FiCalendar, FiMonitor, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getAuditLogs } from '../services/adminService';
import PageHeader from '../../shared/components/PageHeader';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import Pagination from '../../shared/components/Pagination';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerTable } from '../../shared/components/ShimmerLoader';

const getActionColor = (accion) => {
    if (accion.includes('crear') || accion.includes('login') || accion.includes('activar')) return '#4caf50';
    if (accion.includes('eliminar') || accion.includes('rechazar') || accion.includes('desactivar')) return '#f44336';
    if (accion.includes('actualizar') || accion.includes('editar')) return '#2196f3';
    return '#9e9e9e';
};

const AdminAudit = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [accionFilter, setAccionFilter] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');

    const fetchLogs = async () => {
        if (!user || !['admin', 'administrador'].includes(user.tipo_usuario)) return;
        setLoading(true);
        const res = await getAuditLogs(user.id, { page, perPage: 15, accion: accionFilter, fechaDesde, fechaHasta });
        if (res.success && res.data) {
            setLogs(res.data.logs || []);
            setStats(res.data.estadisticas || []);
            setTotalPages(res.data.pagination?.total_pages || 1);
            setTotalLogs(res.data.pagination?.total || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line
    }, [user, page, accionFilter, fechaDesde, fechaHasta]);

    const handleClearFilters = () => {
        setAccionFilter('');
        setFechaDesde('');
        setFechaHasta('');
        setPage(1);
    };

    return (
        <div className="v-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <PageHeader title="Auditoría del Sistema" subtitle={`Registro de actividades y trazabilidad. Total: ${totalLogs}`} />
                <button className="v-btn v-btn--outline" onClick={fetchLogs}>
                    <FiRefreshCw size={16} /> Refrescar
                </button>
            </div>

            {/* Two Column Layout */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* Left: Filters & Stats */}
                <div style={{ flex: '0 0 300px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Filters */}
                    <div className="glass-card v-section">
                        <div className="v-section__header">
                            <FiFilter size={18} color="var(--text)" />
                            <h3 className="v-section__title" style={{ fontSize: '1rem' }}>Filtros</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label className="v-form-label">Acción</label>
                                <select className="v-form-input" value={accionFilter} onChange={(e) => { setAccionFilter(e.target.value); setPage(1); }}>
                                    <option value="">Todas las acciones</option>
                                    {stats.map(s => (
                                        <option key={s.accion} value={s.accion}>{s.accion.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="v-form-label"><FiCalendar size={13} /> Desde</label>
                                <input type="date" className="v-form-input" value={fechaDesde} onChange={(e) => { setFechaDesde(e.target.value); setPage(1); }} />
                            </div>
                            <div>
                                <label className="v-form-label"><FiCalendar size={13} /> Hasta</label>
                                <input type="date" className="v-form-input" value={fechaHasta} onChange={(e) => { setFechaHasta(e.target.value); setPage(1); }} />
                            </div>
                            <button className="v-btn v-btn--outline" onClick={handleClearFilters} style={{ width: '100%' }}>Limpiar Filtros</button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="glass-card v-section">
                        <div className="v-section__header">
                            <FiActivity size={18} color="var(--text)" />
                            <h3 className="v-section__title" style={{ fontSize: '1rem' }}>Top Acciones (30 días)</h3>
                        </div>

                        {stats.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {stats.map((stat, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg)', borderRadius: '10px' }}>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 600, textTransform: 'capitalize' }}>
                                            {stat.accion.replace(/_/g, ' ')}
                                        </span>
                                        <span style={{ fontSize: '0.78rem', background: 'rgba(33, 150, 243, 0.1)', color: '#2196f3', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                                            {stat.cantidad}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>Sin estadísticas</p>
                        )}
                    </div>
                </div>

                {/* Right: Table */}
                <div className="glass-card" style={{ flex: 1, minWidth: '400px', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ padding: '24px' }}><ShimmerTable rows={8} cols={4} /></div>
                    ) : logs.length === 0 ? (
                        <EmptyState icon={<FiActivity size={48} />} title="Sin registros" description="No se encontraron registros de auditoría." />
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="v-data-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Usuario</th>
                                        <th>Acción</th>
                                        <th>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => {
                                        const color = getActionColor(log.accion);
                                        return (
                                            <tr key={log.id}>
                                                <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.fecha_creacion).toLocaleString()}</td>
                                                <td>
                                                    {log.usuario_id ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <ProfileAvatar name={log.nombre || 'U'} size={28} borderRadius={8} bgColor="#2196f3" fontSize="0.65rem" />
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.nombre} {log.apellido}</div>
                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{log.tipo_usuario}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}><FiMonitor size={14} /> Sistema</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{ background: `${color}18`, color, padding: '5px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', display: 'inline-block' }}>
                                                        {log.accion.replace(/_/g, ' ')}
                                                    </span>
                                                    {log.entidad && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>ID: {log.entidad_id} ({log.entidad})</div>}
                                                </td>
                                                <td>
                                                    <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{log.descripcion}</div>
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.7, marginTop: '3px' }}>IP: {log.ip_address || 'N/A'}</div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div style={{ borderTop: '1px solid var(--border, rgba(0,0,0,0.06))' }}>
                            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAudit;
