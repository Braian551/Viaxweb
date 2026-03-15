import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    FiDollarSign, FiUsers, FiClock, FiCheckCircle, FiXCircle,
    FiEye, FiCheck, FiSearch, FiX, FiArrowUpRight,
    FiArrowDownLeft, FiFileText, FiRefreshCw, FiAlertTriangle, FiPercent, FiCreditCard,
    FiDownload, FiExternalLink
} from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import {
    getEmpresaDebtors,
    getEmpresaPaymentReports,
    managePaymentReport,
    getConductorTransactions,
    registrarPagoComision
} from '../services/empresaService';
import PageHeader from '../../shared/components/PageHeader';
import GlassStatCard from '../../shared/components/GlassStatCard';
import StatusBadge from '../../shared/components/StatusBadge';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import EmptyState from '../../shared/components/EmptyState';
import FilterBar from '../../shared/components/FilterBar';
import { ShimmerStatGrid } from '../../shared/components/ShimmerLoader';
import { getR2ImageUrl } from '../../../utils/r2Images';
import './EmpresaCommissions.css';

const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);
const isPdfFile = (path = '') => /\.pdf(\?|$)/i.test(String(path || '').trim());

const TAB_FILTERS = [
    { value: 'debtors', label: 'Deudores', icon: <FiUsers /> },
    { value: 'vouchers', label: 'Comprobantes', icon: <FiFileText /> },
];

const EmpresaCommissions = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [debtors, setDebtors] = useState([]);
    const [vouchers, setVouchers] = useState([]);
    const [summary, setSummary] = useState({ total_conductores: 0, deuda_total_empresa: 0 });
    const [activeTab, setActiveTab] = useState('debtors');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);

    // Driver detail modal
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [driverTransactions, setDriverTransactions] = useState([]);
    const [driverReports, setDriverReports] = useState([]);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [showPaymentInput, setShowPaymentInput] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');

    // Voucher detail modal
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);

    const empresaId = useMemo(() => user?.empresa_id || user?.id, [user]);

    const fetchData = useCallback(async () => {
        if (!empresaId) return;
        setLoading(true);
        try {
            const [debtRes, voucherRes] = await Promise.all([
                getEmpresaDebtors(empresaId),
                getEmpresaPaymentReports(empresaId)
            ]);
            if (debtRes?.success) {
                setDebtors(debtRes.data || []);
                setSummary(debtRes.resumen || { total_conductores: 0, deuda_total_empresa: 0 });
            }
            if (voucherRes?.success) setVouchers(voucherRes.data || []);
        } catch (error) {
            console.error('Error fetching commission data:', error);
        } finally {
            setLoading(false);
        }
    }, [empresaId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openDriverDetail = async (driver) => {
        setSelectedDriver(driver);
        const deuda = parseFloat(driver.deuda_actual || 0);
        setPaymentAmount(Math.round(deuda).toString());
        setLoadingDetail(true);
        setDriverTransactions([]);
        setDriverReports([]);
        try {
            const [txRes, reportRes] = await Promise.all([
                getConductorTransactions(driver.id),
                getEmpresaPaymentReports(empresaId, { conductor_id: driver.id })
            ]);
            if (txRes?.success) setDriverTransactions(txRes.data || []);
            if (reportRes?.success) setDriverReports(reportRes.data || []);
        } catch (e) {
            console.error('Error loading driver detail:', e);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleAction = async (action, reportId, extra = {}) => {
        if (!empresaId || processingId) return;
        setProcessingId(reportId);
        try {
            const res = await managePaymentReport({
                action,
                reporte_id: reportId,
                empresa_id: empresaId,
                actor_user_id: user?.id,
                ...extra
            });
            if (res?.success) {
                await fetchData();
                if (selectedDriver) await openDriverDetail(selectedDriver);
                setSelectedVoucher(null);
                setShowRejectInput(false);
                setRejectReason('');
            } else {
                alert(res?.message || 'Error al procesar la acción');
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setProcessingId(null);
        }
    };

    const handleManualPayment = async () => {
        const monto = parseFloat(paymentAmount.replace(/\D/g, ''));
        if (!selectedDriver || !monto || monto <= 0 || processingId) return;

        setProcessingId(`payment_${selectedDriver.id}`);
        try {
            const res = await registrarPagoComision({
                admin_id: user?.id,
                conductor_id: selectedDriver.id,
                monto: monto,
                notas: 'Pago registrado manualmente desde panel empresa',
                metodo_pago: 'efectivo'
            });

            if (res?.success) {
                setShowPaymentInput(false);
                setPaymentAmount('');
                await fetchData();
                await openDriverDetail(selectedDriver);
            } else {
                alert(res?.message || 'Error al registrar el pago');
            }
        } catch (error) {
            alert('Error de conexión');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredDebtors = debtors.filter(d =>
        (d.nombre + ' ' + (d.apellido || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredVouchers = vouchers.filter(v =>
        (v.nombre + ' ' + (v.apellido || '')).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = vouchers.filter(v => v.estado === 'pendiente_revision').length;
    const approvedCount = vouchers.filter(v => v.estado === 'comprobante_aprobado').length;
    const confirmedCount = vouchers.filter(v => v.estado === 'pagado_confirmado').length;
    const debtorsWithDebt = debtors.filter(d => parseFloat(d.deuda_actual || 0) > 0).length;

    const tabFiltersWithCounts = TAB_FILTERS.map(f => ({
        ...f,
        count: f.value === 'debtors' ? debtors.length : vouchers.length,
    }));

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Gestión de Comisiones"
                subtitle="Control de deudas de conductores y validación de comprobantes de pago"
                actions={
                    pendingCount > 0 ? (
                        <span style={{ background: 'rgba(255,152,0,0.12)', color: '#ff9800', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 10, fontWeight: 700, fontSize: '0.85rem' }}>
                            <FiClock /> {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                        </span>
                    ) : null
                }
            />

            {loading ? (
                <ShimmerStatGrid count={4} />
            ) : (
                <>
                    {/* ─── KPI Section ─── */}
                    <section className="v-finance-section">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ width: '4px', height: '24px', background: '#9c27b0', borderRadius: '4px' }}></div>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Resumen de Comisiones</h3>
                        </div>
                        <div className="v-stat-grid">
                            <GlassStatCard
                                icon={<FiDollarSign />}
                                title="Deuda Total"
                                value={fmt(summary.deuda_total_empresa)}
                                accentColor="#f44336"
                                info={`${debtorsWithDebt} de ${summary.total_conductores} conductores con deuda pendiente.`}
                            />
                            <GlassStatCard
                                icon={<FiClock />}
                                title="Pendientes Revisión"
                                value={pendingCount}
                                accentColor="#ff9800"
                                info="Comprobantes enviados por conductores que necesitan tu aprobación."
                            />
                            <GlassStatCard
                                icon={<FiCheckCircle />}
                                title="Aprobados (Pte. Pago)"
                                value={approvedCount}
                                accentColor="#2196f3"
                                info="Comprobantes aprobados que necesitan confirmación de pago final."
                            />
                            <GlassStatCard
                                icon={<FiCheck />}
                                title="Pagos Confirmados"
                                value={confirmedCount}
                                accentColor="#4caf50"
                                info="Pagos completamente verificados y registrados en el sistema."
                            />
                        </div>
                    </section>

                    {/* ─── Tab Filter ─── */}
                    <FilterBar filters={tabFiltersWithCounts} activeValue={activeTab} onChange={(v) => { setActiveTab(v); setSearchTerm(''); }} />

                    {/* ─── Search ─── */}
                    <div className="v-search-input" style={{ maxWidth: 400 }}>
                        <span className="v-search-input__icon"><FiSearch /></span>
                        <input
                            type="text"
                            placeholder={activeTab === 'debtors' ? 'Buscar conductor por nombre o email...' : 'Buscar comprobante por nombre...'}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* ─── DEBTORS TAB ─── */}
                    {activeTab === 'debtors' && (
                        <div className="glass-card v-section" style={{ padding: 0 }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                                <h3 className="v-section__title">Conductores con Comisiones</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                                    Haz clic en un conductor para ver su historial financiero detallado
                                </p>
                            </div>
                            {filteredDebtors.length === 0 ? (
                                <EmptyState icon={<FiUsers />} title="Sin resultados" description="No hay conductores con ese criterio de búsqueda." />
                            ) : (
                                <div className="v-table-wrapper">
                                    <table className="v-table">
                                        <thead>
                                            <tr>
                                                <th>Conductor</th>
                                                <th style={{ textAlign: 'right' }}>Total Comisión</th>
                                                <th style={{ textAlign: 'right' }}>Total Pagado</th>
                                                <th style={{ textAlign: 'right' }}>Deuda Actual</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredDebtors.map(d => {
                                                const deuda = parseFloat(d.deuda_actual || 0);
                                                const hasDebt = deuda > 0;
                                                return (
                                                    <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => openDriverDetail(d)}>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                                                <ProfileAvatar
                                                                    src={d.foto_perfil}
                                                                    name={`${d.nombre} ${d.apellido || ''}`}
                                                                    size={40}
                                                                    borderRadius={12}
                                                                    bgColor={hasDebt ? '#ff9800' : '#4caf50'}
                                                                />
                                                                <div>
                                                                    <div style={{ fontWeight: 700 }}>{d.nombre} {d.apellido}</div>
                                                                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{d.email || '—'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(d.total_comision)}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#4caf50' }}>{fmt(d.total_pagado)}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <StatusBadge
                                                                status={hasDebt ? 'debt' : 'pagado_confirmado'}
                                                                label={hasDebt ? fmt(deuda) : 'Al día'}
                                                            />
                                                        </td>
                                                        <td>
                                                            <button className="v-btn-outline" style={{ fontSize: '0.78rem', padding: '6px 12px' }} onClick={e => { e.stopPropagation(); openDriverDetail(d); }}>
                                                                <FiEye size={14} /> Ver detalle
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── VOUCHERS TAB ─── */}
                    {activeTab === 'vouchers' && (
                        <div className="glass-card v-section" style={{ padding: 0 }}>
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                                <h3 className="v-section__title">Comprobantes Reportados</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                                    Comprobantes de transferencia enviados por conductores
                                </p>
                            </div>
                            {filteredVouchers.length === 0 ? (
                                <EmptyState icon={<FiFileText />} title="Sin comprobantes" description="No hay comprobantes reportados." />
                            ) : (
                                <div className="v-table-wrapper">
                                    <table className="v-table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Conductor</th>
                                                <th style={{ textAlign: 'right' }}>Monto</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredVouchers.map(v => (
                                                <tr key={v.id}>
                                                    <td>{new Date(v.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                            <ProfileAvatar
                                                                src={v.foto_perfil}
                                                                name={`${v.nombre} ${v.apellido || ''}`}
                                                                size={32}
                                                                borderRadius={10}
                                                                bgColor="#2196f3"
                                                            />
                                                            <span style={{ fontWeight: 600 }}>{v.nombre} {v.apellido}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '1rem' }}>{fmt(v.monto_reportado)}</td>
                                                    <td><StatusBadge status={v.estado} /></td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                            <button className="v-icon-btn" onClick={() => { setSelectedVoucher(v); setShowRejectInput(false); setRejectReason(''); }} title="Ver detalle">
                                                                <FiEye />
                                                            </button>
                                                            {v.estado === 'pendiente_revision' && (
                                                                <>
                                                                    <button className="v-icon-btn" style={{ color: '#4caf50', borderColor: '#4caf50' }} onClick={() => handleAction('approve', v.id)} disabled={processingId === v.id} title="Aprobar">
                                                                        <FiCheck />
                                                                    </button>
                                                                    <button className="v-icon-btn" style={{ color: '#f44336', borderColor: '#f44336' }} onClick={() => { setSelectedVoucher(v); setShowRejectInput(true); setRejectReason(''); }} title="Rechazar">
                                                                        <FiX />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {v.estado === 'comprobante_aprobado' && (
                                                                <button className="v-icon-btn" style={{ color: '#2196f3', borderColor: '#2196f3' }} onClick={() => handleAction('confirm_payment', v.id)} disabled={processingId === v.id} title="Confirmar pago">
                                                                    <FiDollarSign />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ═══════ DRIVER DETAIL MODAL ═══════ */}
            {selectedDriver && (
                <div className="v-modal-overlay" onClick={() => !loadingDetail && setSelectedDriver(null)}>
                    <div className="v-modal-content" style={{ maxWidth: 700, width: '95%' }} onClick={e => e.stopPropagation()}>
                        <div className="v-modal-header">
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <ProfileAvatar
                                    src={selectedDriver.foto_perfil}
                                    name={`${selectedDriver.nombre} ${selectedDriver.apellido || ''}`}
                                    size={48}
                                    borderRadius={14}
                                    bgColor="#9c27b0"
                                />
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selectedDriver.nombre} {selectedDriver.apellido}</h3>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedDriver.email}</div>
                                </div>
                            </div>
                            <button className="v-close-btn" onClick={() => setSelectedDriver(null)}><FiX /></button>
                        </div>

                        {/* Debt Hero */}
                        <div style={{
                            padding: '20px 24px',
                            textAlign: 'center',
                            background: parseFloat(selectedDriver.deuda_actual || 0) > 0
                                ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.06), rgba(255, 152, 0, 0.04))'
                                : 'linear-gradient(135deg, rgba(76, 175, 80, 0.06), rgba(33, 150, 243, 0.03))',
                            borderBottom: '1px solid var(--v-glass-border)'
                        }}>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)', marginBottom: 4 }}>Deuda Actual</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: parseFloat(selectedDriver.deuda_actual || 0) > 0 ? '#f44336' : '#4caf50', letterSpacing: '-1px' }}>
                                {fmt(selectedDriver.deuda_actual)}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                <span>Comisión Total: {fmt(selectedDriver.total_comision)}</span>
                                <span>Total Pagado: {fmt(selectedDriver.total_pagado)}</span>
                            </div>
                            {parseFloat(selectedDriver.deuda_actual || 0) > 0 && (
                                <div style={{
                                    marginTop: 24,
                                    background: 'var(--v-glass-bg)',
                                    padding: '16px 20px',
                                    borderRadius: '16px',
                                    border: '1px solid var(--v-glass-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                    boxShadow: 'var(--v-shadow-md)',
                                    textAlign: 'left'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6, marginLeft: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Monto a abonar</div>
                                        <div className="v-search-input" style={{ background: 'var(--bg)', margin: 0, padding: '8px 16px', borderRadius: 12 }}>
                                            <span className="v-search-input__icon" style={{ color: 'var(--text)', padding: 0, marginRight: 8 }}>$</span>
                                            <input
                                                type="text"
                                                placeholder="0"
                                                value={paymentAmount ? new Intl.NumberFormat('es-CO').format(paymentAmount.replace(/\D/g, '')) : ''}
                                                onChange={e => setPaymentAmount(e.target.value)}
                                                style={{ fontSize: '1.25rem', fontWeight: 800, padding: 0, color: 'var(--text)' }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="v-btn-primary"
                                        style={{
                                            height: 52,
                                            padding: '0 28px',
                                            borderRadius: 14,
                                            opacity: processingId ? 0.7 : 1,
                                            display: 'inline-flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            fontSize: '1rem',
                                            fontWeight: 700,
                                            marginTop: 22
                                        }}
                                        disabled={!!processingId || !paymentAmount}
                                        onClick={handleManualPayment}
                                    >
                                        {processingId === `payment_${selectedDriver.id}` ? <FiRefreshCw className="v-spin" /> : 'Registrar'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="v-modal-body" style={{ maxHeight: '50vh' }}>
                            {loadingDetail ? (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                                    <FiRefreshCw className="v-spin" size={24} />
                                    <p>Cargando historial...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Voucher Reports */}
                                    {driverReports.length > 0 && (
                                        <div style={{ marginBottom: 28 }}>
                                            <div className="v-section__header" style={{ marginBottom: 12 }}>
                                                <div className="v-section__icon" style={{ background: 'rgba(33, 150, 243, 0.12)', width: 32, height: 32 }}>
                                                    <FiFileText size={16} color="#2196f3" />
                                                </div>
                                                <h3 className="v-section__title" style={{ fontSize: '0.95rem' }}>
                                                    Comprobantes ({driverReports.length})
                                                </h3>
                                            </div>
                                            {driverReports.map(r => (
                                                <div key={r.id} className="comm-report-card">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{fmt(r.monto_reportado)}</div>
                                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{new Date(r.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                                                        </div>
                                                        <StatusBadge status={r.estado} />
                                                    </div>
                                                    {r.comprobante_url && (
                                                        <button className="comm-view-proof" onClick={() => { setSelectedVoucher(r); setShowRejectInput(false); setRejectReason(''); }}>
                                                            <FiEye size={14} /> Ver comprobante
                                                        </button>
                                                    )}
                                                    {r.motivo_rechazo && (
                                                        <div className="comm-reject-reason">
                                                            <FiAlertTriangle size={14} /> {r.motivo_rechazo}
                                                        </div>
                                                    )}
                                                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                        {r.estado === 'pendiente_revision' && (
                                                            <>
                                                                <button className="v-btn-success" style={{ fontSize: '0.78rem', padding: '6px 14px' }} disabled={processingId} onClick={() => handleAction('approve', r.id)}>
                                                                    <FiCheck size={14} /> Aprobar
                                                                </button>
                                                                <button className="v-btn-danger" style={{ fontSize: '0.78rem', padding: '6px 14px' }} onClick={() => { setSelectedVoucher(r); setShowRejectInput(true); setRejectReason(''); }}>
                                                                    <FiX size={14} /> Rechazar
                                                                </button>
                                                            </>
                                                        )}
                                                        {r.estado === 'comprobante_aprobado' && (
                                                            <button className="v-btn-primary" style={{ fontSize: '0.78rem', padding: '6px 14px' }} disabled={processingId} onClick={() => handleAction('confirm_payment', r.id)}>
                                                                <FiDollarSign size={14} /> Confirmar Pago Final
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Transaction History */}
                                    <div>
                                        <div className="v-section__header" style={{ marginBottom: 12 }}>
                                            <div className="v-section__icon" style={{ background: 'rgba(156, 39, 176, 0.12)', width: 32, height: 32 }}>
                                                <FiClock size={16} color="#9c27b0" />
                                            </div>
                                            <h3 className="v-section__title" style={{ fontSize: '0.95rem' }}>
                                                Historial de Movimientos ({driverTransactions.length})
                                            </h3>
                                        </div>
                                        {driverTransactions.length === 0 ? (
                                            <EmptyState icon={<FiClock />} title="Sin movimientos" description="No hay movimientos registrados para este conductor." />
                                        ) : (
                                            <div className="v-activity-list">
                                                {driverTransactions.map((t, i) => {
                                                    const isCargo = t.tipo === 'cargo';
                                                    const monto = parseFloat(t.monto || 0);
                                                    const date = t.fecha ? new Date(t.fecha) : new Date();
                                                    return (
                                                        <div key={i} className="v-activity-item">
                                                            <div style={{
                                                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                                                background: isCargo ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}>
                                                                {isCargo ? <FiArrowUpRight size={16} color="#f44336" /> : <FiArrowDownLeft size={16} color="#4caf50" />}
                                                            </div>
                                                            <div className="v-activity-item__body">
                                                                <span className="v-activity-item__title" style={{ fontSize: '0.85rem' }}>{t.descripcion}</span>
                                                                <span className="v-activity-item__meta">
                                                                    {date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                                    {' · '}
                                                                    {date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {t.detalle && <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{t.detalle}</span>}
                                                            </div>
                                                            <div style={{ fontWeight: 800, color: isCargo ? '#f44336' : '#4caf50', flexShrink: 0, fontSize: '0.9rem' }}>
                                                                {isCargo ? '-' : '+'}{fmt(monto)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════ VOUCHER DETAIL MODAL ═══════ */}
            {selectedVoucher && (
                <div className="v-modal-overlay" onClick={() => !processingId && setSelectedVoucher(null)}>
                    <div className="v-modal-content" style={{ maxWidth: 820, width: '92%' }} onClick={e => e.stopPropagation()}>
                        <div className="v-modal-header">
                            <h3>Comprobante #{selectedVoucher.id}</h3>
                            <button className="v-close-btn" onClick={() => setSelectedVoucher(null)}><FiX /></button>
                        </div>
                        <div className="v-modal-body">
                            <div className="comm-voucher-grid">
                                <div>
                                    <div className="v-info-rows">
                                        <div className="v-info-row">
                                            <span className="v-info-row__label"><FiUsers style={{ marginRight: 6 }} />Conductor</span>
                                            <span className="v-info-row__value">{selectedVoucher.nombre} {selectedVoucher.apellido}</span>
                                        </div>
                                        <div className="v-info-row">
                                            <span className="v-info-row__label"><FiDollarSign style={{ marginRight: 6 }} />Monto Reportado</span>
                                            <span className="v-info-row__value" style={{ color: 'var(--v-blue)', fontWeight: 800, fontSize: '1.3rem' }}>{fmt(selectedVoucher.monto_reportado)}</span>
                                        </div>
                                        <div className="v-info-row">
                                            <span className="v-info-row__label"><FiClock style={{ marginRight: 6 }} />Fecha de Envío</span>
                                            <span className="v-info-row__value">{new Date(selectedVoucher.created_at).toLocaleString('es-CO')}</span>
                                        </div>
                                        <div className="v-info-row">
                                            <span className="v-info-row__label">Estado</span>
                                            <StatusBadge status={selectedVoucher.estado} />
                                        </div>
                                    </div>

                                    {selectedVoucher.motivo_rechazo && (
                                        <div className="comm-reject-reason" style={{ marginTop: 16 }}>
                                            <FiAlertTriangle size={14} /> {selectedVoucher.motivo_rechazo}
                                        </div>
                                    )}

                                    {showRejectInput ? (
                                        <div className="comm-reject-form">
                                            <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Motivo del rechazo</label>
                                            <textarea
                                                placeholder="Ej: El monto no coincide con la transferencia..."
                                                value={rejectReason}
                                                onChange={e => setRejectReason(e.target.value)}
                                            />
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                                                <button className="v-btn-outline" onClick={() => setShowRejectInput(false)}>Cancelar</button>
                                                <button className="v-btn-danger" disabled={!rejectReason.trim() || processingId} onClick={() => handleAction('reject', selectedVoucher.id, { motivo: rejectReason })}>
                                                    {processingId ? 'Procesando...' : 'Confirmar Rechazo'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                                            {selectedVoucher.estado === 'pendiente_revision' && (
                                                <>
                                                    <button className="v-btn-danger" onClick={() => setShowRejectInput(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                        <FiXCircle /> Rechazar
                                                    </button>
                                                    <button className="v-btn-success" disabled={processingId} onClick={() => handleAction('approve', selectedVoucher.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                        {processingId ? 'Procesando...' : <><FiCheckCircle /> Aprobar</>}
                                                    </button>
                                                </>
                                            )}
                                            {selectedVoucher.estado === 'comprobante_aprobado' && (
                                                <>
                                                    <button className="v-btn-danger" onClick={() => setShowRejectInput(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                        <FiXCircle /> Rechazar
                                                    </button>
                                                    <button className="v-btn-primary" disabled={processingId} onClick={() => handleAction('confirm_payment', selectedVoucher.id)}>
                                                        {processingId ? 'Procesando...' : <><FiCheck /> Confirmar Pago Final</>}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>Imagen del Comprobante</label>
                                    <div className="comm-proof-preview">
                                        {(() => {
                                            const proofUrl = getR2ImageUrl(selectedVoucher.comprobante_url);
                                            const isPdf = isPdfFile(selectedVoucher.comprobante_url);

                                            if (isPdf) {
                                                return (
                                                    <div style={{ width: '100%', height: '100%', minHeight: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                        <iframe
                                                            src={`${proofUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                                                            title="Comprobante PDF"
                                                            style={{ width: '100%', height: '100%', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, background: '#111' }}
                                                        />
                                                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                                                            <a className="v-btn-outline" href={proofUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                                <FiExternalLink /> Abrir PDF
                                                            </a>
                                                            <a className="v-btn-secondary" href={proofUrl} download={`comprobante_${selectedVoucher.id}.pdf`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                                                <FiDownload /> Descargar
                                                            </a>
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <a href={proofUrl} target="_blank" rel="noopener noreferrer">
                                                    <img src={proofUrl} alt="Comprobante" onError={e => { e.target.style.display = 'none'; }} />
                                                    <div className="comm-proof-overlay"><FiSearch /> Ver en tamaño completo</div>
                                                </a>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmpresaCommissions;
