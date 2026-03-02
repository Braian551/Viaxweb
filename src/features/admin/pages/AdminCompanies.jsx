import React, { useEffect, useState } from 'react';
import { FiSearch, FiBriefcase, FiMapPin, FiPhone } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getCompanies } from '../services/adminService';
import PageHeader from '../../shared/components/PageHeader';
import FilterBar from '../../shared/components/FilterBar';
import Pagination from '../../shared/components/Pagination';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import StatusBadge from '../../shared/components/StatusBadge';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerCardGrid } from '../../shared/components/ShimmerLoader';

const STATUS_FILTERS = [
    { value: '', label: 'Todas' },
    { value: 'activo', label: 'Activas' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'inactivo', label: 'Inactivas' },
];

const AdminCompanies = () => {
    const { user } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCompanies, setTotalCompanies] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchCompaniesData = async () => {
        if (!user || !['admin', 'administrador'].includes(user.tipo_usuario)) return;
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

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Empresas de Transporte"
                subtitle={`Administra las compañías asociadas. Total: ${totalCompanies}`}
            />

            {/* Controls */}
            <div className="glass-card v-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <div className="v-search-input" style={{ flex: 1, minWidth: '220px' }}>
                    <FiSearch className="v-search-input__icon" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, NIT..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <FilterBar filters={STATUS_FILTERS} activeValue={statusFilter} onChange={handleFilterChange} />
            </div>

            {/* Companies Grid */}
            {loading ? (
                <ShimmerCardGrid cards={6} />
            ) : companies.length === 0 ? (
                <EmptyState
                    icon={<FiBriefcase size={48} />}
                    title="Sin empresas"
                    description="No se encontraron empresas con los filtros aplicados."
                />
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {companies.map(c => (
                        <div key={c.id} className="glass-card v-company-card">
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                <ProfileAvatar
                                    src={c.logo_url}
                                    name={c.nombre}
                                    size={48}
                                    borderRadius={14}
                                    bgColor="#ff9800"
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</h3>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>NIT: {c.nit}</div>
                                </div>
                            </div>

                            <div className="v-info-rows">
                                <div className="v-info-row">
                                    <span className="v-info-row__label">Representante</span>
                                    <span className="v-info-row__value">{c.representante_nombre || 'N/A'}</span>
                                </div>
                                <div className="v-info-row">
                                    <span className="v-info-row__label"><FiPhone size={13} /> Teléfono</span>
                                    <span className="v-info-row__value">{c.telefono || 'N/A'}</span>
                                </div>
                                <div className="v-info-row">
                                    <span className="v-info-row__label"><FiMapPin size={13} /> Ubicación</span>
                                    <span className="v-info-row__value">{c.municipio}, {c.departamento}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border, rgba(0,0,0,0.06))' }}>
                                <StatusBadge status={c.estado} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {new Date(c.creado_en).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
        </div>
    );
};

export default AdminCompanies;
