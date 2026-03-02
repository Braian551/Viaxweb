import React, { useEffect, useState } from 'react';
import { FiSearch, FiMoreVertical, FiCheck, FiX, FiBriefcase, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getCompanies } from '../services/adminService';
import '../layout/AdminLayout.css';

const AdminCompanies = () => {
    const { user } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // '', 'activo', 'inactivo', 'pendiente'

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCompanies, setTotalCompanies] = useState(0);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchCompaniesData = async () => {
        if (!user || user.tipo_usuario !== 'admin') return;
        setLoading(true);
        const res = await getCompanies(user.id, { page, limit: 10, search: debouncedSearch, estado: statusFilter });

        if (res.success && res.empresas) {
            setCompanies(res.empresas);
            setTotalPages(res.pagination?.total_pages || 1);
            setTotalCompanies(res.pagination?.total || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCompaniesData();
        // eslint-disable-next-line
    }, [user, page, debouncedSearch, statusFilter]);

    const handleFilterChange = (status) => {
        setStatusFilter(status);
        setPage(1);
    };

    const getStatusUI = (status) => {
        switch (status) {
            case 'activo': return <span className="status-badge status-active"><FiCheck /> Activo</span>;
            case 'inactivo': return <span className="status-badge status-inactive"><FiX /> Inactivo</span>;
            case 'pendiente': return <span className="status-badge status-pending"><FiAlertCircle /> Pendiente</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    return (
        <div className="admin-dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Empresas de Transporte</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Administra las compañías asociadas. Total: {totalCompanies}</p>
                </div>
                <button className="primary-glass-btn">
                    + Nueva Empresa
                </button>
            </div>

            {/* Controls Bar */}
            <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: '12px', padding: '0 16px', flex: '1', minWidth: '250px', border: '1px solid var(--border, rgba(0,0,0,0.1))' }}>
                    <FiSearch color="var(--text-secondary)" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, NIT..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{ border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none', color: 'var(--text)', fontSize: '0.95rem' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <FilterButton active={statusFilter === ''} onClick={() => handleFilterChange('')} label="Todas" />
                    <FilterButton active={statusFilter === 'activo'} onClick={() => handleFilterChange('activo')} label="Activas" />
                    <FilterButton active={statusFilter === 'pendiente'} onClick={() => handleFilterChange('pendiente')} label="Pendientes" />
                    <FilterButton active={statusFilter === 'inactivo'} onClick={() => handleFilterChange('inactivo')} label="Inactivas" />
                </div>
            </div>

            {/* Companies Grid */}
            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Cargando empresas...</div>
            ) : companies.length === 0 ? (
                <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', borderRadius: '24px' }}>
                    <FiBriefcase size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
                    <p>No se encontraron empresas.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {companies.map(c => (
                        <div key={c.id} className="glass-card company-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                                        {c.logo_url ? <img src={c.logo_url} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} /> : <FiBriefcase color="var(--primary)" />}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)' }}>{c.nombre}</h3>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>NIT: {c.nit}</div>
                                    </div>
                                </div>
                                <button className="icon-btn-small" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <FiMoreVertical size={20} />
                                </button>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', margin: '4px 0', color: 'var(--text)' }}><strong>Rep:</strong> {c.representante_nombre}</div>
                                <div style={{ fontSize: '0.85rem', margin: '4px 0', color: 'var(--text)' }}><strong>Tel:</strong> {c.telefono}</div>
                                <div style={{ fontSize: '0.85rem', margin: '4px 0', color: 'var(--text-secondary)' }}>{c.municipio}, {c.departamento}</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border, rgba(0,0,0,0.05))' }}>
                                {getStatusUI(c.estado)}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {new Date(c.creado_en).toLocaleDateString()}
                                </div>
                            </div>
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
                .company-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .company-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
                [data-theme='dark'] .company-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
                
                .status-badge { display: inline-flex; alignItems: center; gap: 4px; padding: 6px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
                .status-active { background: rgba(76, 175, 80, 0.15); color: #4caf50; }
                .status-inactive { background: rgba(244, 67, 54, 0.15); color: #f44336; }
                .status-pending { background: rgba(255, 152, 0, 0.15); color: #ff9800; }
                
                .primary-glass-btn {
                    padding: 12px 24px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.2);
                    background: var(--primary-gradient, linear-gradient(135deg, #2196f3, #00bcd4)); color: white;
                    font-weight: 700; font-size: 0.95rem; cursor: pointer; box-shadow: 0 4px 16px rgba(33, 150, 243, 0.3);
                    transition: all 0.2s ease;
                }
                .primary-glass-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(33, 150, 243, 0.4); }
                
                .pagination-btn { padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text); font-weight: 600; cursor: pointer; transition: all 0.2s; }
                .pagination-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
                .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}} />
        </div>
    );
};

const FilterButton = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        style={{
            padding: '8px 16px', borderRadius: '10px',
            border: active ? '1px solid var(--primary)' : '1px solid transparent',
            background: active ? 'var(--primary-alpha, rgba(33, 150, 243, 0.15))' : 'transparent',
            color: active ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
        }}
    >
        {label}
    </button>
);

export default AdminCompanies;
