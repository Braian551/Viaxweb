import React, { useState, useEffect, useCallback } from 'react';
import {
    FiDollarSign, FiUsers, FiClock, FiCheckCircle, FiXCircle,
    FiEye, FiCheck, FiX, FiFileText, FiRefreshCw, FiSettings,
    FiCreditCard, FiAlertTriangle
} from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import {
    getEmpresasDeudoras,
    getEmpresaPaymentReports,
    manageEmpresaPaymentReport,
    getAdminBankConfig,
    updateAdminBankConfig,
    getFacturas
} from '../services/adminService';
import PageHeader from '../../shared/components/PageHeader';
import GlassStatCard from '../../shared/components/GlassStatCard';
import StatusBadge from '../../shared/components/StatusBadge';
import EmptyState from '../../shared/components/EmptyState';
import FilterBar from '../../shared/components/FilterBar';
import { ShimmerStatGrid } from '../../shared/components/ShimmerLoader';

const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return d; } };

const ESTADO_MAP = {
    pendiente_revision: { label: 'Pendiente', color: 'warning', icon: <FiClock /> },
    comprobante_aprobado: { label: 'Aprobado', color: 'info', icon: <FiCheckCircle /> },
    pagado_confirmado: { label: 'Confirmado', color: 'success', icon: <FiCheck /> },
    rechazado: { label: 'Rechazado', color: 'error', icon: <FiXCircle /> },
};

const TAB_FILTERS = [
    { value: 'empresas', label: 'Empresas Deudoras', icon: <FiUsers /> },
    { value: 'comprobantes', label: 'Comprobantes', icon: <FiFileText /> },
    { value: 'facturas', label: 'Facturas', icon: <FiFileText /> },
];

const AdminCompanyPayments = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('empresas');
    const [processingId, setProcessingId] = useState(null);

    // Empresas
    const [empresas, setEmpresas] = useState([]);
    const [resumenEmpresas, setResumenEmpresas] = useState({});

    // Comprobantes
    const [reportes, setReportes] = useState([]);
    const [resumenReportes, setResumenReportes] = useState({});
    const [filtroEstado, setFiltroEstado] = useState('');

    // Facturas
    const [facturas, setFacturas] = useState([]);
    const [resumenFacturas, setResumenFacturas] = useState({});

    // Reporte seleccionado
    const [selectedReport, setSelectedReport] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    // Config bancaria
    const [showBankConfig, setShowBankConfig] = useState(false);
    const [bankForm, setBankForm] = useState({ banco_nombre: '', numero_cuenta: '', titular_cuenta: '', tipo_cuenta: '', documento_titular: '', referencia_transferencia: '' });
    const [savingBank, setSavingBank] = useState(false);

    const adminId = user?.id;

    const fetchTab = useCallback(async (tab) => {
        setLoading(true);
        try {
            if (tab === 'empresas') {
                const res = await getEmpresasDeudoras();
                if (res?.success) {
                    setEmpresas(res.data?.empresas || []);
                    setResumenEmpresas(res.data?.resumen || {});
                }
            } else if (tab === 'comprobantes') {
                const res = await getEmpresaPaymentReports({ estado: filtroEstado || undefined });
                if (res?.success) {
                    setReportes(res.data?.reportes || []);
                    setResumenReportes(res.data?.resumen || {});
                }
            } else if (tab === 'facturas') {
                const res = await getFacturas({ tipo: 'empresa_admin' });
                if (res?.success) {
                    setFacturas(res.data?.facturas || []);
                    setResumenFacturas(res.data?.resumen || {});
                }
            }
        } catch (e) {
            console.error('Error:', e);
        } finally {
            setLoading(false);
        }
    }, [filtroEstado]);

    useEffect(() => { fetchTab(activeTab); }, [activeTab, fetchTab]);

    const handleAction = async (action, reporteId, extra = {}) => {
        if (processingId) return;
        setProcessingId(reporteId);
        try {
            const res = await manageEmpresaPaymentReport({
                action,
                reporte_id: reporteId,
                actor_user_id: adminId,
                ...extra
            });
            if (res?.success) {
                setSelectedReport(null);
                setRejectReason('');
                await fetchTab(activeTab);
            } else {
                alert(res?.message || 'Error al procesar');
            }
        } catch { alert('Error de conexión'); }
        finally { setProcessingId(null); }
    };

    const loadBankConfig = async () => {
        try {
            const res = await getAdminBankConfig(adminId);
            if (res?.success && res.data) {
                setBankForm({
                    banco_nombre: res.data.banco_nombre || '',
                    numero_cuenta: res.data.numero_cuenta || '',
                    titular_cuenta: res.data.titular_cuenta || '',
                    tipo_cuenta: res.data.tipo_cuenta || '',
                    documento_titular: res.data.documento_titular || '',
                    referencia_transferencia: res.data.referencia_transferencia || '',
                });
            }
        } catch { }
        setShowBankConfig(true);
    };

    const saveBankConfig = async () => {
        if (!bankForm.banco_nombre || !bankForm.numero_cuenta || !bankForm.titular_cuenta) {
            return alert('Banco, cuenta y titular son obligatorios');
        }
        setSavingBank(true);
        try {
            const res = await updateAdminBankConfig({ admin_id: adminId, ...bankForm });
            if (res?.success) { setShowBankConfig(false); }
            else { alert(res?.message || 'Error al guardar'); }
        } catch { alert('Error de conexión'); }
        finally { setSavingBank(false); }
    };

    const tabFiltersWithCounts = TAB_FILTERS.map(f => ({
        ...f,
        count: f.value === 'empresas' ? empresas.length : f.value === 'comprobantes' ? reportes.length : facturas.length,
    }));

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Pagos de Empresas"
                subtitle="Gestión de comprobantes, facturas y deudas de empresas con la plataforma"
                actions={
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={loadBankConfig} className="v-btn-icon" title="Config. bancaria">
                            <FiSettings />
                        </button>
                        <button onClick={() => fetchTab(activeTab)} className="v-btn-icon" title="Actualizar">
                            <FiRefreshCw />
                        </button>
                    </div>
                }
            />

            {loading ? <ShimmerStatGrid count={4} /> : (
                <>
                    {/* Tabs */}
                    <FilterBar
                        filters={tabFiltersWithCounts}
                        active={activeTab}
                        onChange={setActiveTab}
                    />

                    {/* ═══ Tab: Empresas ═══ */}
                    {activeTab === 'empresas' && (
                        <section style={{ marginTop: 24 }}>
                            <div className="v-stat-grid" style={{ marginBottom: 20 }}>
                                <GlassStatCard title="Total por cobrar" value={fmt(resumenEmpresas.deuda_total)} icon={<FiDollarSign />} color="#f44336" />
                                <GlassStatCard title="Total pagado" value={fmt(resumenEmpresas.total_pagado_global)} icon={<FiCheckCircle />} color="#4caf50" />
                                <GlassStatCard title="Empresas" value={resumenEmpresas.total_empresas || 0} icon={<FiUsers />} color="#2196f3" />
                                <GlassStatCard title="Pendientes" value={resumenEmpresas.reportes_pendientes || 0} icon={<FiClock />} color="#ff9800" />
                            </div>

                            {empresas.length === 0 ? (
                                <EmptyState icon={<FiUsers />} title="Sin deudas" message="No hay empresas con saldo pendiente" />
                            ) : (
                                <div className="v-table-container">
                                    <table className="v-table">
                                        <thead>
                                            <tr>
                                                <th>Empresa</th>
                                                <th>Saldo pendiente</th>
                                                <th>Total cargos</th>
                                                <th>Total pagado</th>
                                                <th>Comprobantes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {empresas.map(e => {
                                                const saldo = parseFloat(e.saldo_pendiente || 0);
                                                return (
                                                    <tr key={e.id}>
                                                        <td><strong>{e.nombre}</strong></td>
                                                        <td style={{ color: saldo > 0 ? '#f44336' : '#4caf50', fontWeight: 700 }}>
                                                            {fmt(saldo)}
                                                        </td>
                                                        <td>{fmt(e.total_cargos)}</td>
                                                        <td>{fmt(e.total_pagado)}</td>
                                                        <td>
                                                            {parseInt(e.reportes_pendientes || 0) > 0 && (
                                                                <StatusBadge status="warning" label={`${e.reportes_pendientes} pendiente(s)`} />
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ═══ Tab: Comprobantes ═══ */}
                    {activeTab === 'comprobantes' && (
                        <section style={{ marginTop: 24 }}>
                            {/* Filtro por estado */}
                            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                                {[
                                    { value: '', label: 'Todos' },
                                    { value: 'pendiente_revision', label: 'Pendientes' },
                                    { value: 'comprobante_aprobado', label: 'Aprobados' },
                                    { value: 'pagado_confirmado', label: 'Confirmados' },
                                    { value: 'rechazado', label: 'Rechazados' },
                                ].map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => { setFiltroEstado(f.value); setTimeout(() => fetchTab('comprobantes'), 0); }}
                                        style={{
                                            padding: '6px 14px', borderRadius: 8,
                                            border: filtroEstado === f.value ? '2px solid var(--color-primary, #1976d2)' : '1px solid rgba(128,128,128,0.2)',
                                            background: filtroEstado === f.value ? 'rgba(25,118,210,0.08)' : 'transparent',
                                            fontWeight: filtroEstado === f.value ? 700 : 400,
                                            cursor: 'pointer', fontSize: '0.85rem',
                                            color: filtroEstado === f.value ? 'var(--color-primary)' : 'inherit',
                                        }}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            <div className="v-stat-grid" style={{ marginBottom: 20 }}>
                                <GlassStatCard title="Pendientes" value={resumenReportes.pendientes || 0} icon={<FiClock />} color="#ff9800" />
                                <GlassStatCard title="Aprobados" value={resumenReportes.aprobados || 0} icon={<FiCheckCircle />} color="#2196f3" />
                                <GlassStatCard title="Monto pendiente" value={fmt(resumenReportes.monto_pendiente)} icon={<FiDollarSign />} color="#f44336" />
                            </div>

                            {reportes.length === 0 ? (
                                <EmptyState icon={<FiFileText />} title="Sin comprobantes" message="No hay comprobantes que coincidan con el filtro" />
                            ) : (
                                <div className="v-table-container">
                                    <table className="v-table">
                                        <thead>
                                            <tr>
                                                <th>Empresa</th>
                                                <th>Monto</th>
                                                <th>Estado</th>
                                                <th>Fecha</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportes.map(r => {
                                                const estado = ESTADO_MAP[r.estado] || { label: r.estado, color: 'default' };
                                                return (
                                                    <tr key={r.id}>
                                                        <td><strong>{r.empresa_nombre}</strong></td>
                                                        <td style={{ fontWeight: 700 }}>{fmt(r.monto)}</td>
                                                        <td><StatusBadge status={estado.color} label={estado.label} /></td>
                                                        <td style={{ fontSize: '0.85rem' }}>{fmtDate(r.created_at)}</td>
                                                        <td>
                                                            <button
                                                                onClick={() => setSelectedReport(r)}
                                                                className="v-btn-icon"
                                                                title="Ver detalle"
                                                            >
                                                                <FiEye />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ═══ Tab: Facturas ═══ */}
                    {activeTab === 'facturas' && (
                        <section style={{ marginTop: 24 }}>
                            <div className="v-stat-grid" style={{ marginBottom: 20 }}>
                                <GlassStatCard title="Total facturas" value={resumenFacturas.total_facturas || 0} icon={<FiFileText />} color="#1976d2" />
                                <GlassStatCard title="Total facturado" value={fmt(resumenFacturas.total_facturado)} icon={<FiDollarSign />} color="#4caf50" />
                            </div>

                            {facturas.length === 0 ? (
                                <EmptyState icon={<FiFileText />} title="Sin facturas" message="No se han generado facturas aún" />
                            ) : (
                                <div className="v-table-container">
                                    <table className="v-table">
                                        <thead>
                                            <tr>
                                                <th>Nº Factura</th>
                                                <th>Emisor</th>
                                                <th>Receptor</th>
                                                <th>Monto</th>
                                                <th>Estado</th>
                                                <th>Fecha</th>
                                                <th>PDF</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {facturas.map(f => (
                                                <tr key={f.id}>
                                                    <td><strong>{f.numero_factura}</strong></td>
                                                    <td>{f.emisor_nombre}</td>
                                                    <td>{f.receptor_nombre}</td>
                                                    <td style={{ fontWeight: 700 }}>{fmt(f.monto)}</td>
                                                    <td>
                                                        <StatusBadge
                                                            status={f.estado === 'pagada' ? 'success' : 'warning'}
                                                            label={f.estado === 'pagada' ? 'Pagada' : 'Emitida'}
                                                        />
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem' }}>{fmtDate(f.fecha_emision)}</td>
                                                    <td>
                                                        {f.pdf_url && (
                                                            <a href={f.pdf_url} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <FiFileText /> Ver
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    )}

                    {/* ═══ Modal: Detalle de comprobante ═══ */}
                    {selectedReport && (
                        <div className="v-modal-overlay" onClick={() => setSelectedReport(null)}>
                            <div className="v-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, width: '90%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ margin: 0 }}>Comprobante #{selectedReport.id}</h3>
                                    <button onClick={() => setSelectedReport(null)} className="v-btn-icon"><FiX /></button>
                                </div>

                                <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Empresa</span>
                                        <strong>{selectedReport.empresa_nombre}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Monto</span>
                                        <strong>{fmt(selectedReport.monto)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Estado</span>
                                        <StatusBadge status={(ESTADO_MAP[selectedReport.estado] || {}).color || 'default'} label={(ESTADO_MAP[selectedReport.estado] || {}).label || selectedReport.estado} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Fecha</span>
                                        <span>{fmtDate(selectedReport.created_at)}</span>
                                    </div>
                                    {selectedReport.observaciones && (
                                        <div>
                                            <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Observaciones</span>
                                            <p style={{ margin: 0, padding: '8px 12px', background: 'rgba(128,128,128,0.06)', borderRadius: 8 }}>
                                                {selectedReport.observaciones}
                                            </p>
                                        </div>
                                    )}
                                    {selectedReport.motivo_rechazo && (
                                        <div>
                                            <span style={{ color: '#f44336', display: 'block', marginBottom: 4, fontWeight: 600 }}>Motivo rechazo</span>
                                            <p style={{ margin: 0, padding: '8px 12px', background: 'rgba(244,67,54,0.06)', borderRadius: 8 }}>
                                                {selectedReport.motivo_rechazo}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Imagen comprobante */}
                                {selectedReport.comprobante_url && (
                                    <div style={{ marginBottom: 20 }}>
                                        <span style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Comprobante adjunto</span>
                                        <img
                                            src={selectedReport.comprobante_url}
                                            alt="Comprobante"
                                            style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 12, border: '1px solid rgba(128,128,128,0.15)' }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                )}

                                {/* Acciones */}
                                {selectedReport.estado === 'pendiente_revision' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <button
                                            onClick={() => handleAction('approve', selectedReport.id)}
                                            disabled={!!processingId}
                                            className="v-btn-primary"
                                            style={{ padding: '12px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                        >
                                            <FiCheckCircle /> Aprobar comprobante
                                        </button>

                                        <div>
                                            <textarea
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                placeholder="Motivo del rechazo..."
                                                className="v-input"
                                                rows={2}
                                                style={{ width: '100%', marginBottom: 8, resize: 'vertical' }}
                                            />
                                            <button
                                                onClick={() => {
                                                    if (!rejectReason.trim()) return alert('Escribe el motivo del rechazo');
                                                    handleAction('reject', selectedReport.id, { motivo: rejectReason.trim() });
                                                }}
                                                disabled={!!processingId}
                                                style={{
                                                    width: '100%', padding: '10px', borderRadius: 12,
                                                    border: '2px solid #f44336', background: 'transparent',
                                                    color: '#f44336', fontWeight: 600, cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                                }}
                                            >
                                                <FiXCircle /> Rechazar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedReport.estado === 'comprobante_aprobado' && (
                                    <button
                                        onClick={() => handleAction('confirm_payment', selectedReport.id)}
                                        disabled={!!processingId}
                                        className="v-btn-primary"
                                        style={{ width: '100%', padding: '12px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                    >
                                        <FiCheck /> Confirmar pago recibido
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ Modal: Config bancaria ═══ */}
                    {showBankConfig && (
                        <div className="v-modal-overlay" onClick={() => setShowBankConfig(false)}>
                            <div className="v-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, width: '90%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h3 style={{ margin: 0 }}>Configurar cuenta bancaria</h3>
                                    <button onClick={() => setShowBankConfig(false)} className="v-btn-icon"><FiX /></button>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                                    Las empresas verán estos datos para realizar transferencias.
                                </p>

                                {['banco_nombre', 'numero_cuenta', 'titular_cuenta', 'tipo_cuenta', 'documento_titular', 'referencia_transferencia'].map(k => (
                                    <label key={k} style={{ display: 'block', marginBottom: 14 }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4, display: 'block' }}>
                                            {k.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                                        </span>
                                        <input
                                            type="text"
                                            value={bankForm[k] || ''}
                                            onChange={e => setBankForm(prev => ({ ...prev, [k]: e.target.value }))}
                                            className="v-input"
                                            style={{ width: '100%' }}
                                        />
                                    </label>
                                ))}

                                <button
                                    onClick={saveBankConfig}
                                    disabled={savingBank}
                                    className="v-btn-primary"
                                    style={{ width: '100%', padding: '12px', borderRadius: 12, marginTop: 8 }}
                                >
                                    {savingBank ? 'Guardando...' : 'Guardar configuración'}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminCompanyPayments;
