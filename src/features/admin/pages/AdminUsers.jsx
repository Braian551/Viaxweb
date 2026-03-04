import React, { useEffect, useState } from 'react';
import { FiSearch, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getUsers } from '../services/adminService';
import PageHeader from '../../shared/components/PageHeader';
import FilterBar from '../../shared/components/FilterBar';
import Pagination from '../../shared/components/Pagination';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import StatusBadge from '../../shared/components/StatusBadge';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerTable } from '../../shared/components/ShimmerLoader';
import './AdminUsers.css';

const ROLE_FILTERS = [
    { value: '', label: 'Todos' },
    { value: 'cliente', label: 'Clientes' },
    { value: 'conductor', label: 'Conductores' },
    { value: 'empresa', label: 'Empresas' },
    { value: 'administrador', label: 'Admins' },
];

const ROLE_COLORS = {
    administrador: '#e91e63',
    conductor: '#00bcd4',
    empresa: '#ff9800',
    cliente: '#2196f3',
};

const AdminUsers = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsersData = async () => {
        if (!user || !['admin', 'administrador'].includes(user.tipo_usuario)) return;
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
        setPage(1);
    };

    const toRoleLabel = (role) => {
        switch (role) {
            case 'administrador': return 'Admin';
            case 'conductor': return 'Conductor';
            case 'empresa': return 'Empresa';
            case 'cliente':
            default:
                return 'Cliente';
        }
    };

    const isUserActive = (value) => value === true || value === 1 || value === '1' || value === 't';

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Gestión de Usuarios"
                subtitle={`Administra todos los registros del sistema. Total: ${totalUsers}`}
            />

            {/* Controls */}
            <div className="glass-card v-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <div className="v-search-input" style={{ flex: 1, minWidth: '220px' }}>
                    <FiSearch className="v-search-input__icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo, teléfono..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <FilterBar
                    filters={ROLE_FILTERS}
                    activeValue={roleFilter}
                    onChange={handleFilterChange}
                />
            </div>

            {/* Table */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '24px' }}><ShimmerTable rows={6} cols={5} /></div>
                ) : users.length === 0 ? (
                    <EmptyState
                        icon={<FiUsers size={48} />}
                        title="Sin resultados"
                        description="No se encontraron usuarios con los filtros aplicados."
                    />
                ) : (
                    <div className="v-table-wrapper">
                        <table className="v-table admin-users-table">
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>Teléfono</th>
                                    <th>Registro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <ProfileAvatar
                                                    src={u.foto_perfil}
                                                    name={`${u.nombre} ${u.apellido}`}
                                                    size={38}
                                                    borderRadius={10}
                                                    bgColor={ROLE_COLORS[u.tipo_usuario] || '#2196f3'}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{u.nombre} {u.apellido}</div>
                                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="admin-users-role" style={{ '--role-color': ROLE_COLORS[u.tipo_usuario] || '#2196f3' }}>
                                                {toRoleLabel(u.tipo_usuario)}
                                            </span>
                                        </td>
                                        <td>
                                            <StatusBadge status={isUserActive(u.es_activo) ? 'activo' : 'inactivo'} />
                                        </td>
                                        <td>{u.telefono || 'N/A'}</td>
                                        <td>{new Date(u.fecha_registro).toLocaleDateString()}</td>
                                    </tr>
                                ))}
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
    );
};

export default AdminUsers;
