import React, { useEffect, useState } from 'react';
import { FiSearch, FiBriefcase, FiMapPin, FiPhone } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { approveCompany, getCompanies, rejectCompany, updateCompany } from '../services/adminService';
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
    const [processingCompanyId, setProcessingCompanyId] = useState(null);
    const [editingCompany, setEditingCompany] = useState(null);
    const [editForm, setEditForm] = useState({
        nombre: '',
        razon_social: '',
        telefono: '',
        representante_nombre: '',
        representante_email: '',
        municipio: '',
        departamento: '',
    });

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

    const handleApprove = async (company) => {
        if (!window.confirm(`¿Aprobar empresa ${company.nombre}?`)) return;
        setProcessingCompanyId(company.id);
        const res = await approveCompany(user.id, company.id);
        setProcessingCompanyId(null);
        if (!res?.success) {
            window.alert(res?.message || 'No se pudo aprobar la empresa');
            return;
        }
        window.alert(res.message || 'Empresa aprobada');
        fetchCompaniesData();
    };

    const handleReject = async (company) => {
        const motivo = window.prompt('Motivo de rechazo (requerido):', '');
        if (!motivo || !motivo.trim()) return;
        if (!window.confirm(`¿Rechazar y eliminar ${company.nombre}?`)) return;

        setProcessingCompanyId(company.id);
        const res = await rejectCompany(user.id, company.id, motivo.trim());
        setProcessingCompanyId(null);
        if (!res?.success) {
            window.alert(res?.message || 'No se pudo rechazar la empresa');
            return;
        }
        window.alert(res.message || 'Empresa rechazada');
        fetchCompaniesData();
    };

    const openEdit = (company) => {
        setEditingCompany(company);
        setEditForm({
            nombre: company.nombre || '',
            razon_social: company.razon_social || '',
            telefono: company.telefono || '',
            representante_nombre: company.representante_nombre || '',
            representante_email: company.representante_email || company.email || '',
            municipio: company.municipio || '',
            departamento: company.departamento || '',
        });
    };

    const saveEdit = async () => {
        if (!editingCompany) return;
        setProcessingCompanyId(editingCompany.id);
        const res = await updateCompany(user.id, editingCompany.id, editForm);
        setProcessingCompanyId(null);
        if (!res?.success) {
            window.alert(res?.message || 'No se pudo editar la empresa');
            return;
        }
        setEditingCompany(null);
        window.alert(res.message || 'Empresa actualizada');
        fetchCompaniesData();
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <button
                                        type="button"
                                        className="btn btn--ghost"
                                        onClick={() => openEdit(c)}
                                        disabled={processingCompanyId === c.id}
                                    >
                                        Editar
                                    </button>
                                    {c.estado === 'pendiente' && (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn--ghost"
                                                onClick={() => handleReject(c)}
                                                disabled={processingCompanyId === c.id}
                                            >
                                                Rechazar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn--primary"
                                                onClick={() => handleApprove(c)}
                                                disabled={processingCompanyId === c.id}
                                            >
                                                Aprobar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

            {editingCompany && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.38)',
                    display: 'grid',
                    placeItems: 'center',
                    zIndex: 1200,
                    padding: 16,
                }}>
                    <div className="glass-card" style={{ width: 'min(640px, 100%)', padding: 20 }}>
                        <h3 style={{ marginTop: 0 }}>Editar empresa</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                            <input value={editForm.nombre} onChange={(e) => setEditForm((prev) => ({ ...prev, nombre: e.target.value }))} placeholder="Nombre" className="v-form-input" />
                            <input value={editForm.razon_social} onChange={(e) => setEditForm((prev) => ({ ...prev, razon_social: e.target.value }))} placeholder="Razón social" className="v-form-input" />
                            <input value={editForm.telefono} onChange={(e) => setEditForm((prev) => ({ ...prev, telefono: e.target.value }))} placeholder="Teléfono" className="v-form-input" />
                            <input value={editForm.representante_nombre} onChange={(e) => setEditForm((prev) => ({ ...prev, representante_nombre: e.target.value }))} placeholder="Representante" className="v-form-input" />
                            <input value={editForm.representante_email} onChange={(e) => setEditForm((prev) => ({ ...prev, representante_email: e.target.value }))} placeholder="Email representante" className="v-form-input" />
                            <input value={editForm.municipio} onChange={(e) => setEditForm((prev) => ({ ...prev, municipio: e.target.value }))} placeholder="Municipio" className="v-form-input" />
                            <input value={editForm.departamento} onChange={(e) => setEditForm((prev) => ({ ...prev, departamento: e.target.value }))} placeholder="Departamento" className="v-form-input" />
                        </div>
                        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button type="button" className="btn btn--ghost" onClick={() => setEditingCompany(null)}>Cancelar</button>
                            <button type="button" className="btn btn--primary" onClick={saveEdit} disabled={processingCompanyId === editingCompany.id}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompanies;
