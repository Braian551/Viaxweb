import React, { useEffect, useState } from 'react';
import { FiActivity, FiFilter, FiCalendar, FiMonitor, FiUser, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getAuditLogs } from '../services/adminService';
import '../layout/AdminLayout.css';

const AdminAudit = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination
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

    const getActionBadgeStyle = (accion) => {
        if (accion.includes('crear') || accion.includes('login') || accion.includes('activar')) {
            return { bg: 'rgba(76, 175, 80, 0.15)', color: '#4caf50' };
        }
        if (accion.includes('eliminar') || accion.includes('rechazar') || accion.includes('desactivar')) {
            return { bg: 'rgba(244, 67, 54, 0.15)', color: '#f44336' };
        }
        if (accion.includes('actualizar') || accion.includes('editar')) {
            return { bg: 'rgba(33, 150, 243, 0.15)', color: '#2196f3' };
        }
        return { bg: 'rgba(158, 158, 158, 0.15)', color: 'var(--text-secondary)' };
    };

    return (
        <div className="admin-dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Auditoría del Sistema</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Registro de actividades y trazabilidad. Total logs: {totalLogs}</p>
                </div>
                <button onClick={fetchLogs} className="primary-glass-btn" style={{ padding: '8px 16px', borderRadius: '10px' }}>
                    ↻ Refrescar
                </button>
            </div>

            {/* Layout with Sidebar for Stats and Main for Table */}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* Left Column: Filters and Stats */}
                <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '350px' }}>

                    {/* Filters */}
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text)' }}>
                            <FiFilter /> <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Filtros</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Acción Específica</label>
                                <select
                                    value={accionFilter}
                                    onChange={(e) => { setAccionFilter(e.target.value); setPage(1); }}
                                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
                                >
                                    <option value="">Todas las acciones</option>
                                    {stats.map(s => (
                                        <option key={s.accion} value={s.accion}>{s.accion.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}><FiCalendar /> Fecha Desde</label>
                                <input
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) => { setFechaDesde(e.target.value); setPage(1); }}
                                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}><FiCalendar /> Fecha Hasta</label>
                                <input
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => { setFechaHasta(e.target.value); setPage(1); }}
                                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}
                                />
                            </div>

                            <button onClick={handleClearFilters} style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', cursor: 'pointer', transition: 'all 0.2s', marginTop: '8px' }}>
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>

                    {/* Stats Module */}
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text)' }}>
                            <FiActivity /> <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Top Acciones (30 días)</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {stats.length > 0 ? stats.map((stat, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border, rgba(0,0,0,0.05))' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: '600', textTransform: 'capitalize' }}>
                                        {stat.accion.replace(/_/g, ' ')}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', background: 'var(--primary-alpha)', color: 'var(--primary)', padding: '4px 8px', borderRadius: '6px', fontWeight: '800' }}>
                                        {stat.cantidad}
                                    </span>
                                </div>
                            )) : (
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>No hay estadísticas disponibles</div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column: Main Table */}
                <div className="glass-card table-container" style={{ flex: '2', borderRadius: '20px', overflow: 'hidden', minWidth: '400px' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border, rgba(0,0,0,0.05))', background: 'rgba(0,0,0,0.02)' }}>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', minWidth: '150px' }}>Fecha</th>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Usuario Responsable</th>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase' }}>Acción</th>
                                    <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', minWidth: '200px' }}>Descripción / Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--primary)' }}>Cargando bitácora...</td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            <FiInfo size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                                            <div>No se encontraron registros de auditoría.</div>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => {
                                        const badge = getActionBadgeStyle(log.accion);
                                        return (
                                            <tr key={log.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border, rgba(0,0,0,0.02))' }}>
                                                <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                    {new Date(log.fecha_creacion).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    {log.usuario_id ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--primary-gradient, linear-gradient(135deg, #2196f3, #00bcd4))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                                {log.nombre ? log.nombre.charAt(0).toUpperCase() : 'U'}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.9rem' }}>{log.nombre} {log.apellido}</div>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{log.tipo_usuario}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                            <FiMonitor /> Sistema
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span style={{
                                                        background: badge.bg,
                                                        color: badge.color,
                                                        padding: '6px 10px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        display: 'inline-block'
                                                    }}>
                                                        {log.accion.replace(/_/g, ' ')}
                                                    </span>
                                                    {log.entidad && (
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '6px' }}>
                                                            ID: {log.entidad_id} ({log.entidad})
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px 20px', color: 'var(--text)', fontSize: '0.85rem', lineHeight: '1.4' }}>
                                                    {log.descripcion}
                                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', opacity: 0.7 }}>
                                                        IP: {log.ip_address || 'N/A'}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Horizontal Footer */}
                    {totalPages > 1 && (
                        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border, rgba(0,0,0,0.05))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                Mostrando página {page} de {totalPages}
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button disabled={page === 1} onClick={() => setPage(page - 1)} className="pagination-btn">Anterior</button>
                                <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="pagination-btn">Siguiente</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .primary-glass-btn { border: 1px solid rgba(255,255,255,0.2); background: var(--primary-gradient, linear-gradient(135deg, #2196f3, #00bcd4)); color: white; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
                .primary-glass-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3); }
                .table-row-hover { transition: background 0.2s ease; }
                .table-row-hover:hover { background: var(--bg, rgba(255,255,255,0.3)); }
                [data-theme='dark'] .table-row-hover:hover { background: rgba(0,0,0,0.2) !important; }
                .pagination-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border, rgba(0,0,0,0.1)); background: var(--card-bg); color: var(--text); font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
                .pagination-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
                .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}} />
        </div>
    );
};

export default AdminAudit;
