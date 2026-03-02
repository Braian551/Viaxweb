import React, { useEffect, useState } from 'react';
import { FiSearch, FiFilter, FiUser, FiMoreVertical, FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getUsers } from '../services/adminService';
import '../layout/AdminLayout.css';

const AdminUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(''); // '', 'cliente', 'conductor', 'empresa', 'administrador'

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsersData = async () => {
        if (!user || user.tipo_usuario !== 'admin') return;
        setLoading(true);
        const res = await getUsers(user.id, { page, perPage: 10, search: debouncedSearch, tipoUsuario: roleFilter });

        if (res.success && res.data) {
            setUsers(res.data.usuarios || []);
            setTotalPages(res.data.pagination?.total_pages || 1);
            setTotalUsers(res.data.pagination?.total || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsersData();
        // eslint-disable-next-line
    }, [user, page, debouncedSearch, roleFilter]);

    const handleFilterChange = (role) => {
        setRoleFilter(role);
        setPage(1); // Reset page on filter
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'administrador': return { bg: 'rgba(233, 30, 99, 0.15)', text: '#e91e63' };
            case 'conductor': return { bg: 'rgba(0, 188, 212, 0.15)', text: '#00bcd4' };
            case 'empresa': return { bg: 'rgba(255, 152, 0, 0.15)', text: '#ff9800' };
            default: return { bg: 'rgba(33, 150, 243, 0.15)', text: '#2196f3' }; // cliente
        }
    };

    return (
        <div className="admin-dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header & Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Gestión de Usuarios</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Administra todos los registros del sistema. Total: {totalUsers}</p>
                </div>
            </div>

            {/* Glass Controls Bar */}
            <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>

                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: '12px', padding: '0 16px', flex: '1', minWidth: '250px', border: '1px solid var(--border, rgba(0,0,0,0.1))' }}>
                    <FiSearch color="var(--text-secondary)" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo, teléfono..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        style={{ border: 'none', background: 'transparent', padding: '12px', width: '100%', outline: 'none', color: 'var(--text)', fontSize: '0.95rem' }}
                    />
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <FilterButton active={roleFilter === ''} onClick={() => handleFilterChange('')} label="Todos" />
                    <FilterButton active={roleFilter === 'cliente'} onClick={() => handleFilterChange('cliente')} label="Clientes" />
                    <FilterButton active={roleFilter === 'conductor'} onClick={() => handleFilterChange('conductor')} label="Conductores" />
                    <FilterButton active={roleFilter === 'empresa'} onClick={() => handleFilterChange('empresa')} label="Empresas" />
                    <FilterButton active={roleFilter === 'administrador'} onClick={() => handleFilterChange('administrador')} label="Admins" />
                </div>
            </div>

            {/* Users Glass Table */}
            <div className="glass-card table-container" style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border, rgba(0,0,0,0.05))' }}>
                                <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Usuario</th>
                                <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Rol</th>
                                <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Estado</th>
                                <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Teléfono</th>
                                <th style={{ padding: '20px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase' }}>Registro</th>
                                <th style={{ padding: '20px', textAlign: 'center' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--primary)' }}>Cargando usuarios...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron usuarios.</td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const roleColors = getRoleBadgeColor(u.tipo_usuario);
                                    return (
                                        <tr key={u.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--border, rgba(0,0,0,0.02))' }}>
                                            <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-gradient, linear-gradient(135deg, #2196f3, #00bcd4))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                                                    {u.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text)' }}>{u.nombre} {u.apellido}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{
                                                    background: roleColors.bg,
                                                    color: roleColors.text,
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '700',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {u.tipo_usuario}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                {u.es_activo === 1 ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4caf50', fontSize: '0.85rem', fontWeight: '600' }}>
                                                        <FiCheck /> Activo
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f44336', fontSize: '0.85rem', fontWeight: '600' }}>
                                                        <FiX /> Inactivo
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px 20px', color: 'var(--text)', fontSize: '0.9rem' }}>{u.telefono || 'N/A'}</td>
                                            <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{new Date(u.fecha_registro).toLocaleDateString()}</td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                <button className="icon-btn-small" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}>
                                                    <FiMoreVertical size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border, rgba(0,0,0,0.05))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Página {page} de {totalPages}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="pagination-btn"
                            >
                                Anterior
                            </button>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(page + 1)}
                                className="pagination-btn"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .table-row-hover { transition: background 0.2s ease; }
                .table-row-hover:hover { background: var(--bg, rgba(255,255,255,0.3)); }
                [data-theme='dark'] .table-row-hover:hover { background: rgba(0,0,0,0.2) !important; }
                
                .pagination-btn {
                    padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border, rgba(0,0,0,0.1));
                    background: var(--card-bg); color: var(--text); font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
                }
                .pagination-btn:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
                .pagination-btn:disabled { opacity: 0.5; cursor: not-allowed; }
            `}} />
        </div>
    );
};

// Extracted Filter Button for cleanlyness
const FilterButton = ({ active, label, onClick }) => (
    <button
        onClick={onClick}
        style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: active ? '1px solid var(--primary)' : '1px solid transparent',
            background: active ? 'var(--primary-alpha, rgba(33, 150, 243, 0.15))' : 'transparent',
            color: active ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
        }}
    >
        {label}
    </button>
);

export default AdminUsers;
