import React, { useState, useEffect, useCallback } from 'react';
import {
    FiDollarSign, FiUsers, FiClock, FiCheckCircle, FiXCircle,
    FiEye, FiCheck, FiX, FiFileText, FiRefreshCw, FiSettings,
    FiCreditCard, FiAlertTriangle, FiPlus, FiPlusCircle, FiSearch,
    FiDownload, FiExternalLink, FiFilter, FiTrendingUp, FiArrowRight, FiUser
} from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import {
    getEmpresasDeudoras,
    getEmpresaPaymentReports,
    manageEmpresaPaymentReport,
    getAdminBankConfig,
    updateAdminBankConfig,
    getAdminEmitterProfile,
    updateAdminEmitterProfile,
    getFacturas,
    getColombiaBanks,
    registrarPagoComisionAdmin
} from '../services/adminService';
import { API_BASE_URL } from '../../../config/env';
import { getR2ImageUrl } from '../../../utils/r2Images';
import PageHeader from '../../shared/components/PageHeader';
import GlassStatCard from '../../shared/components/GlassStatCard';
import StatusBadge from '../../shared/components/StatusBadge';
import EmptyState from '../../shared/components/EmptyState';
import FilterBar from '../../shared/components/FilterBar';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import { ShimmerStatGrid } from '../../shared/components/ShimmerLoader';
import { useSnackbar } from '../../shared/components/AppSnackbar';

const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return d; } };
const safeText = (value, fallback = '-') => (value === null || value === undefined || value === '' ? fallback : String(value));
const asNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const DEBT_EPSILON_COP = 1;
const normalizeSaldoCop = (value) => {
    const saldo = asNumber(value, 0);
    return Math.abs(saldo) < DEBT_EPSILON_COP ? 0 : saldo;
};
const hasActiveDebt = (empresa) => {
    if (empresa?.deuda_activa === true || empresa?.deuda_activa === false) {
        return empresa.deuda_activa;
    }
    const deudaActivaNumeric = Number(empresa?.deuda_activa);
    if (Number.isFinite(deudaActivaNumeric)) {
        return deudaActivaNumeric === 1;
    }
    return normalizeSaldoCop(empresa?.saldo_pendiente) >= DEBT_EPSILON_COP;
};

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

    // Pago Manual
    const [showManualPayment, setShowManualPayment] = useState(false);
    const [selectedEmpresa, setSelectedEmpresa] = useState(null);
    const [manualPaymentForm, setManualPaymentForm] = useState({ monto: '', metodo_pago: 'transferencia', notas: '' });
    const [savingManualPayment, setSavingManualPayment] = useState(false);

    // Búsqueda
    const [searchTerm, setSearchTerm] = useState('');
    const [showBankConfig, setShowBankConfig] = useState(false);
    const [bankForm, setBankForm] = useState({ metodo_recaudo: 'cuenta_bancaria', banco_codigo: '', banco_nombre: '', numero_cuenta: '', titular_cuenta: '', tipo_cuenta: '', documento_titular: '', referencia_transferencia: '' });
    const [banks, setBanks] = useState([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [savingBank, setSavingBank] = useState(false);
    const [showEmitterConfig, setShowEmitterConfig] = useState(false);
    const [savingEmitter, setSavingEmitter] = useState(false);
    const [emitterForm, setEmitterForm] = useState({
        nombre_legal: '',
        tipo_documento: 'cedula_ciudadania',
        numero_documento: '',
        regimen_fiscal: 'Responsable de IVA',
        direccion_fiscal: '',
        ciudad: 'Bogota D.C.',
        departamento: '',
        pais: 'Colombia',
        telefono: '',
        email_emisor: 'braianoquen@gmail.com',
    });
    const [quickRejectReason, setQuickRejectReason] = useState('');
    const [fullscreenImage, setFullscreenImage] = useState(null);

    const adminId = user?.id;
    const { showSnackbar } = useSnackbar();

    /** Descarga segura de archivos R2 (PDF/imagen) sin exponer endpoint */
    const downloadR2File = useCallback(async (url, filenameBase = 'archivo') => {
        try {
            const requestUrl = `${url}${url.includes('?') ? '&' : '?'}_ts=${Date.now()}`;
            const res = await fetch(requestUrl, { cache: 'no-store' });
            if (!res.ok) throw new Error('Error descargando archivo');
            const blob = await res.blob();
            const contentType = (res.headers.get('content-type') || '').toLowerCase();

            const inferExt = () => {
                if (contentType.includes('pdf') || /\.pdf(\?|$)/i.test(requestUrl)) return 'pdf';
                if (contentType.includes('html') || /\.html?(\?|$)/i.test(requestUrl)) return 'html';
                if (contentType.includes('png') || /\.png(\?|$)/i.test(requestUrl)) return 'png';
                if (contentType.includes('jpeg') || contentType.includes('jpg') || /\.jpe?g(\?|$)/i.test(requestUrl)) return 'jpg';
                if (contentType.includes('webp') || /\.webp(\?|$)/i.test(requestUrl)) return 'webp';
                return 'bin';
            };

            const cleanBase = String(filenameBase || 'archivo').replace(/\.[^.]+$/, '');
            const finalName = `${cleanBase}.${inferExt()}`;
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = finalName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (e) {
            console.error('Error descargando:', e);
            showSnackbar('Error al descargar el archivo', { type: 'error' });
        }
    }, [showSnackbar]);

    const fetchTab = useCallback(async (tab) => {
        setLoading(true);
        try {
            if (tab === 'empresas') {
                const res = await getEmpresasDeudoras();
                if (res?.success) {
                    const empresasData = Array.isArray(res.data)
                        ? res.data
                        : (res.data?.empresas || []);
                    const resumenData = res.resumen || res.data?.resumen || {};
                    setEmpresas(empresasData);
                    setResumenEmpresas(resumenData);
                }
            } else if (tab === 'comprobantes') {
                const res = await getEmpresaPaymentReports({ estado: filtroEstado || undefined });
                if (res?.success) {
                    const reportesData = Array.isArray(res.data)
                        ? res.data
                        : (res.data?.reportes || []);
                    const resumenData = res.resumen || res.data?.resumen || {};
                    setReportes(reportesData);
                    setResumenReportes(resumenData);
                }
            } else if (tab === 'facturas') {
                const res = await getFacturas({ tipo: 'empresa_admin' });
                if (res?.success) {
                    const facturasData = Array.isArray(res.data)
                        ? res.data
                        : (res.data?.facturas || []);
                    const resumenData = res.resumen || res.data?.resumen || {};
                    setFacturas(facturasData);
                    setResumenFacturas(resumenData);
                }
            }
        } catch (e) {
            console.error('Error:', e);
        } finally {
            setLoading(false);
        }
    }, [filtroEstado]);

    useEffect(() => { fetchTab(activeTab); }, [activeTab, fetchTab]);

    // Precarga resúmenes para que los tabs no arranquen en 0 mientras no se abren.
    useEffect(() => {
        let isMounted = true;
        const preloadCounters = async () => {
            try {
                const [resComp, resFact] = await Promise.all([
                    getEmpresaPaymentReports(),
                    getFacturas({ tipo: 'empresa_admin' }),
                ]);

                if (!isMounted) return;

                if (resComp?.success) {
                    const resumenData = resComp.resumen || resComp.data?.resumen || {};
                    setResumenReportes(resumenData);
                }

                if (resFact?.success) {
                    const resumenData = resFact.resumen || resFact.data?.resumen || {};
                    setResumenFacturas(resumenData);
                }
            } catch {
                // Silencioso: no bloquea la carga principal del tab activo.
            }
        };

        preloadCounters();
        return () => { isMounted = false; };
    }, []);

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
                setQuickRejectReason('');
                await fetchTab(activeTab);
                showSnackbar(res?.message || 'Acción procesada correctamente', { type: 'success' });
            } else {
                showSnackbar(res?.message || 'Error al procesar', { type: 'error' });
            }
        } catch {
            showSnackbar('Error de conexión. Intenta nuevamente.', { type: 'error' });
        }
        finally { setProcessingId(null); }
    };

    const handleManualPayment = async () => {
        if (!selectedEmpresa || !manualPaymentForm.monto || savingManualPayment) return;

        const montoNum = parseFloat(String(manualPaymentForm.monto || '').replace(/\D/g, ''));
        if (isNaN(montoNum) || montoNum <= 0) {
            showSnackbar('Monto inválido. Verifica el valor ingresado.', { type: 'warning' });
            return;
        }

        setSavingManualPayment(true);
        try {
            const res = await registrarPagoComisionAdmin({
                empresa_id: selectedEmpresa.id,
                monto: montoNum,
                metodo_pago: manualPaymentForm.metodo_pago,
                notas: manualPaymentForm.notas,
                admin_id: adminId
            });

            if (res?.success) {
                setShowManualPayment(false);
                setManualPaymentForm({ monto: '', metodo_pago: 'transferencia', notas: '' });
                await fetchTab('empresas');
                showSnackbar('Pago manual registrado correctamente.', { type: 'success' });
            } else {
                showSnackbar(res?.message || 'Error al registrar pago', { type: 'error' });
            }
        } catch {
            showSnackbar('Error de conexión al registrar el pago.', { type: 'error' });
        } finally {
            setSavingManualPayment(false);
        }
    };

    const loadBankConfig = async () => {
        setLoadingBanks(true);
        try {
            const [banksRes, res] = await Promise.all([
                getColombiaBanks(),
                getAdminBankConfig(adminId),
            ]);

            if (banksRes?.success) {
                setBanks(Array.isArray(banksRes.data) ? banksRes.data : []);
            }

            if (res?.success && res.data) {
                const metodo = res.data.metodo_recaudo || ((res.data.tipo_cuenta || '').toLowerCase() === 'nequi' || (res.data.banco_nombre || '').toLowerCase() === 'nequi' ? 'nequi' : 'cuenta_bancaria');
                setBankForm({
                    metodo_recaudo: metodo,
                    banco_codigo: res.data.banco_codigo || '',
                    banco_nombre: res.data.banco_nombre || '',
                    numero_cuenta: res.data.numero_cuenta || '',
                    titular_cuenta: res.data.titular_cuenta || '',
                    tipo_cuenta: res.data.tipo_cuenta || '',
                    documento_titular: res.data.documento_titular || '',
                    referencia_transferencia: res.data.referencia_transferencia || '',
                });
            }
        } catch { }
        finally { setLoadingBanks(false); }
        setShowBankConfig(true);
    };

    const saveBankConfig = async () => {
        if (bankForm.metodo_recaudo === 'nequi') {
            if (!bankForm.numero_cuenta || !bankForm.titular_cuenta) {
                showSnackbar('Número de Nequi y titular son obligatorios.', { type: 'warning' });
                return;
            }
        } else if (!bankForm.banco_nombre || !bankForm.tipo_cuenta || !bankForm.numero_cuenta || !bankForm.titular_cuenta) {
            showSnackbar('Banco, tipo, número de cuenta y titular son obligatorios.', { type: 'warning' });
            return;
        }

        const payload = {
            ...bankForm,
            admin_id: adminId,
            metodo_recaudo: bankForm.metodo_recaudo,
            banco_nombre: bankForm.metodo_recaudo === 'nequi' ? 'Nequi' : bankForm.banco_nombre,
            banco_codigo: bankForm.metodo_recaudo === 'nequi' ? 'NEQUI' : bankForm.banco_codigo,
            tipo_cuenta: bankForm.metodo_recaudo === 'nequi' ? 'nequi' : bankForm.tipo_cuenta,
        };

        setSavingBank(true);
        try {
            const res = await updateAdminBankConfig(payload);
            if (res?.success) {
                setShowBankConfig(false);
                showSnackbar('Configuración de recaudo actualizada con éxito.', { type: 'success' });
            } else {
                showSnackbar(res?.message || 'Error al guardar', { type: 'error' });
            }
        } catch {
            showSnackbar('Error de conexión al guardar configuración.', { type: 'error' });
        }
        finally { setSavingBank(false); }
    };

    const loadEmitterConfig = async () => {
        try {
            const res = await getAdminEmitterProfile(adminId);
            if (res?.success && res.data) {
                setEmitterForm(prev => ({
                    ...prev,
                    nombre_legal: res.data.nombre_legal || '',
                    tipo_documento: res.data.tipo_documento || 'cedula_ciudadania',
                    numero_documento: res.data.numero_documento || '',
                    regimen_fiscal: res.data.regimen_fiscal || 'Responsable de IVA',
                    direccion_fiscal: res.data.direccion_fiscal || '',
                    ciudad: res.data.ciudad || 'Bogota D.C.',
                    departamento: res.data.departamento || '',
                    pais: res.data.pais || 'Colombia',
                    telefono: res.data.telefono || '',
                    email_emisor: 'braianoquen@gmail.com',
                }));
            }
            setShowEmitterConfig(true);
        } catch {
            showSnackbar('No fue posible cargar el perfil fiscal del emisor.', { type: 'error' });
        }
    };

    const saveEmitterConfig = async () => {
        if (!emitterForm.nombre_legal || !emitterForm.numero_documento) {
            showSnackbar('Nombre legal y documento del emisor son obligatorios.', { type: 'warning' });
            return;
        }

        setSavingEmitter(true);
        try {
            const res = await updateAdminEmitterProfile({
                admin_id: adminId,
                ...emitterForm,
                email_emisor: 'braianoquen@gmail.com',
            });

            if (res?.success) {
                setShowEmitterConfig(false);
                showSnackbar('Perfil fiscal del emisor actualizado correctamente.', { type: 'success' });
            } else {
                showSnackbar(res?.message || 'No fue posible actualizar el perfil fiscal.', { type: 'error' });
            }
        } catch {
            showSnackbar('Error de conexión al guardar perfil fiscal.', { type: 'error' });
        }
        finally { setSavingEmitter(false); }
    };

    const totalComprobantesByResumen =
        asNumber(resumenReportes.pendientes) +
        asNumber(resumenReportes.aprobados) +
        asNumber(resumenReportes.confirmados) +
        asNumber(resumenReportes.rechazados);
    const totalComprobantes = totalComprobantesByResumen || asNumber(resumenEmpresas.reportes_pendientes);

    const tabFiltersWithCounts = TAB_FILTERS.map(f => ({
        ...f,
        count: f.value === 'empresas'
            ? empresas.length
            : f.value === 'comprobantes'
                ? (totalComprobantes || reportes.length)
                : (asNumber(resumenFacturas.total_facturas) || facturas.length),
    }));

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Pagos de Empresas"
                subtitle="Gestión de comprobantes, facturas y deudas de empresas con la plataforma"
                actions={
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={loadEmitterConfig} className="v-btn-icon" title="Perfil fiscal emisor">
                            <FiUser />
                        </button>
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
                                <GlassStatCard title="Total por cobrar" value={fmt(resumenEmpresas.deuda_total)} icon={<FiDollarSign />} accentColor="#f44336" />
                                <GlassStatCard title="Total pagado" value={fmt(resumenEmpresas.total_pagado_global)} icon={<FiCheckCircle />} accentColor="#4caf50" />
                                <GlassStatCard title="Empresas con deuda" value={empresas.filter(e => hasActiveDebt(e)).length} icon={<FiUsers />} accentColor="#2196f3" />
                                <GlassStatCard title="Pagos pendientes" value={resumenEmpresas.reportes_pendientes || 0} icon={<FiClock />} accentColor="#ff9800" />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
                                <div className="v-search-bar" style={{ maxWidth: 400, flex: 1 }}>
                                    <FiSearch className="v-search-bar__icon" />
                                    <input
                                        type="text"
                                        placeholder="Buscar empresa por nombre..."
                                        className="v-search-bar__input"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>
                                    Mostrando {empresas.filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase())).length} empresas
                                </div>
                            </div>

                            {empresas.length === 0 ? (
                                <EmptyState icon={<FiUsers />} title="Sin deudas" description="No hay empresas con saldo pendiente en este momento." />
                            ) : (
                                <div className="v-table-container">
                                    <table className="v-table">
                                        <thead>
                                            <tr>
                                                <th>Empresa</th>
                                                <th>Saldo Pendiente</th>
                                                <th>Total Cargos</th>
                                                <th>Total Pagado</th>
                                                <th>Estado / Reportes</th>
                                                <th style={{ textAlign: 'right' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {empresas.filter(e => e.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(e => {
                                                const saldo = normalizeSaldoCop(e.saldo_pendiente);
                                                const debtActive = hasActiveDebt(e);
                                                const hasPending = parseInt(e.reportes_pendientes || 0) > 0;
                                                return (
                                                    <tr key={e.id} className={saldo > 1000000 ? 'v-row-highlight-error' : ''}>
                                                        <td>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{e.nombre}</span>
                                                                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>ID: #{e.id}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <div style={{
                                                                    padding: '4px 10px',
                                                                    borderRadius: 8,
                                                                    background: debtActive ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                                                                    color: debtActive ? '#f44336' : '#4caf50',
                                                                    fontWeight: 800,
                                                                    fontSize: '0.9rem'
                                                                }}>
                                                                    {fmt(saldo)}
                                                                </div>
                                                                {saldo > 500000 && <FiAlertTriangle color="#f44336" title="Deuda alta" />}
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: '0.85rem' }}>{fmt(e.total_cargos)}</td>
                                                        <td style={{ fontSize: '0.85rem' }}>{fmt(e.total_pagado)}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                                                {hasPending ? (
                                                                    <StatusBadge status="warning" label={`${e.reportes_pendientes} pendiente(s)`} />
                                                                ) : debtActive ? (
                                                                    <StatusBadge status="error" label="Con Deuda" />
                                                                ) : (
                                                                    <StatusBadge status="success" label="Al Día" />
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                                <button
                                                                    className="v-btn-icon"
                                                                    title="Registrar pago manual"
                                                                    onClick={() => { setSelectedEmpresa(e); setShowManualPayment(true); }}
                                                                    style={{ background: 'rgba(76, 175, 80, 0.12)', color: '#4caf50' }}
                                                                >
                                                                    <FiPlus />
                                                                </button>
                                                                <button
                                                                    className="v-btn-icon"
                                                                    title="Ver reportes"
                                                                    onClick={() => { setFiltroEstado(''); setActiveTab('comprobantes'); }}
                                                                >
                                                                    <FiFileText />
                                                                </button>
                                                            </div>
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

                    {/* ═══ Modal: Perfil fiscal emisor ═══ */}
                    {showEmitterConfig && (
                        <div className="v-modal-overlay" onClick={() => !savingEmitter && setShowEmitterConfig(false)}>
                            <div className="v-modal-content" style={{ maxWidth: 640, width: '94%' }} onClick={e => e.stopPropagation()}>
                                <div className="v-modal-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(25, 118, 210, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FiUser color="#1976d2" size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Perfil Fiscal del Emisor</h3>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Correo principal fijo: braianoquen@gmail.com</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowEmitterConfig(false)} className="v-close-btn" disabled={savingEmitter}><FiX /></button>
                                </div>
                                <div className="v-modal-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label className="v-label">Nombre Legal / Razón Social</label>
                                            <input className="v-input" value={emitterForm.nombre_legal} onChange={e => setEmitterForm(prev => ({ ...prev, nombre_legal: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="v-label">Tipo Documento</label>
                                            <select className="v-input" value={emitterForm.tipo_documento} onChange={e => setEmitterForm(prev => ({ ...prev, tipo_documento: e.target.value }))}>
                                                <option value="cedula_ciudadania">Cédula de ciudadanía</option>
                                                <option value="nit">NIT</option>
                                                <option value="cedula_extranjeria">Cédula de extranjería</option>
                                                <option value="pasaporte">Pasaporte</option>
                                                <option value="otro">Otro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="v-label">Número Documento</label>
                                            <input className="v-input" value={emitterForm.numero_documento} onChange={e => setEmitterForm(prev => ({ ...prev, numero_documento: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="v-label">Régimen Fiscal</label>
                                            <input className="v-input" value={emitterForm.regimen_fiscal} onChange={e => setEmitterForm(prev => ({ ...prev, regimen_fiscal: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="v-label">Teléfono</label>
                                            <input className="v-input" value={emitterForm.telefono} onChange={e => setEmitterForm(prev => ({ ...prev, telefono: e.target.value }))} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label className="v-label">Dirección Fiscal</label>
                                            <input className="v-input" value={emitterForm.direccion_fiscal} onChange={e => setEmitterForm(prev => ({ ...prev, direccion_fiscal: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="v-label">Ciudad</label>
                                            <input className="v-input" value={emitterForm.ciudad} onChange={e => setEmitterForm(prev => ({ ...prev, ciudad: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="v-label">Departamento</label>
                                            <input className="v-input" value={emitterForm.departamento} onChange={e => setEmitterForm(prev => ({ ...prev, departamento: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="v-label">País</label>
                                            <input className="v-input" value={emitterForm.pais} onChange={e => setEmitterForm(prev => ({ ...prev, pais: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="v-label">Correo emisor principal</label>
                                            <input className="v-input" value="braianoquen@gmail.com" disabled />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                                        <button onClick={() => setShowEmitterConfig(false)} className="v-btn-secondary" style={{ flex: 1 }} disabled={savingEmitter}>Cancelar</button>
                                        <button onClick={saveEmitterConfig} className="v-btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={savingEmitter}>
                                            {savingEmitter ? <FiRefreshCw className="v-spin" /> : <FiCheck />}
                                            {savingEmitter ? 'Guardando...' : 'Guardar Perfil Fiscal'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                                        <td style={{ fontWeight: 700 }}>{fmt(r.monto_reportado || r.monto)}</td>
                                                        <td><StatusBadge status={estado.color} label={estado.label} /></td>
                                                        <td style={{ fontSize: '0.85rem' }}>{fmtDate(r.created_at)}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                                <button
                                                                    onClick={() => setSelectedReport(r)}
                                                                    className="v-btn-icon"
                                                                    title="Ver detalles"
                                                                >
                                                                    <FiEye />
                                                                </button>
                                                                {r.estado === 'pendiente_revision' && (
                                                                    <button
                                                                        className="v-btn-icon"
                                                                        onClick={() => handleAction('approve', r.id)}
                                                                        title="Aprobar rápido"
                                                                        style={{ background: 'rgba(76, 175, 80, 0.12)', color: '#4caf50' }}
                                                                        disabled={processingId === r.id}
                                                                    >
                                                                        {processingId === r.id ? <FiRefreshCw className="v-spin" /> : <FiCheck />}
                                                                    </button>
                                                                )}
                                                            </div>
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
                                <GlassStatCard title="Total facturas" value={resumenFacturas.total_facturas || 0} icon={<FiFileText />} accentColor="#1976d2" />
                                <GlassStatCard title="Total facturado" value={fmt(resumenFacturas.total_facturado)} icon={<FiDollarSign />} accentColor="#4caf50" />
                            </div>

                            {facturas.length === 0 ? (
                                <EmptyState icon={<FiFileText />} title="Sin facturas" description="No se han generado facturas aún." />
                            ) : (
                                <div className="v-table-container">
                                    <table className="v-table">
                                        <thead>
                                            <tr>
                                                <th>Nº Factura</th>
                                                <th>Receptor</th>
                                                <th>Monto</th>
                                                <th>Estado</th>
                                                <th>Fecha</th>
                                                <th style={{ textAlign: 'right' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {facturas.map(f => (
                                                <tr key={f.id}>
                                                    <td><strong>{f.numero_factura}</strong></td>
                                                    <td>{f.receptor_nombre}</td>
                                                    <td style={{ fontWeight: 800, color: 'var(--accent-color)' }}>{fmt(asNumber(f.total, asNumber(f.subtotal, asNumber(f.monto))))}</td>
                                                    <td>
                                                        <StatusBadge
                                                            status={f.estado === 'pagada' ? 'success' : 'warning'}
                                                            label={f.estado === 'pagada' ? 'Pagada' : 'Emitida'}
                                                        />
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem' }}>{fmtDate(f.fecha_emision)}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                            {(f.pdf_ruta || f.pdf_url) && (
                                                                <button
                                                                    onClick={() => downloadR2File(getR2ImageUrl(f.pdf_ruta || f.pdf_url), `${f.numero_factura || 'factura'}`)}
                                                                    className="v-btn-icon"
                                                                    title="Descargar PDF"
                                                                    style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}
                                                                >
                                                                    <FiDownload />
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
                        </section>
                    )}

                    {/* ═══ Modal: Detalle de Reporte ═══ */}
                    {selectedReport && (
                        <div className="v-modal-overlay" onClick={() => setSelectedReport(null)}>
                            <div className="v-modal-content" style={{ maxWidth: 850, width: '96%' }} onClick={e => e.stopPropagation()}>
                                <div className="v-modal-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(33, 150, 243, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FiFileText color="#2196f3" size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Detalle de Comprobante #{selectedReport.id}</h3>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enviado el {fmtDate(selectedReport.created_at)}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedReport(null)} className="v-close-btn"><FiX /></button>
                                </div>
                                <div className="v-modal-body" style={{ padding: 0 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 0, minHeight: 400 }}>
                                        {/* Info Column */}
                                        <div style={{ padding: 24, borderRight: '1px solid rgba(128,128,128,0.1)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            <div className="v-info-section">
                                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Información de la Empresa</h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                    <ProfileAvatar
                                                        src={selectedReport.logo_url || selectedReport.empresa_logo_url}
                                                        name={selectedReport.empresa_nombre || 'Empresa'}
                                                        size={44}
                                                        borderRadius={12}
                                                        bgColor="#1976d2"
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: 800 }}>{selectedReport.empresa_nombre}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ID Empresa: #{selectedReport.empresa_id}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="v-info-section">
                                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detalles del Pago</h4>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Monto Reportado:</span>
                                                        <span style={{ fontWeight: 900, color: 'var(--accent-color)', fontSize: '1.1rem' }}>
                                                            {fmt(selectedReport.monto_reportado || selectedReport.monto)}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Método:</span>
                                                        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                                            {safeText(selectedReport.metodo_pago, 'transferencia').replace(/_/g, ' ')}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estado Actual:</span>
                                                        <StatusBadge
                                                            status={(ESTADO_MAP[selectedReport.estado] || {}).color || 'default'}
                                                            label={(ESTADO_MAP[selectedReport.estado] || {}).label || selectedReport.estado}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {(selectedReport.observaciones_empresa || selectedReport.notas) && (
                                                <div className="v-info-section">
                                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Notas de la Empresa</h4>
                                                    <div style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.85rem', fontStyle: 'italic', borderLeft: '3px solid var(--accent-color)' }}>
                                                        "{selectedReport.observaciones_empresa || selectedReport.notas}"
                                                    </div>
                                                </div>
                                            )}

                                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {selectedReport.estado === 'pendiente_revision' ? (
                                                    <>
                                                        <div style={{ display: 'flex', gap: 10 }}>
                                                            <button
                                                                className="v-btn-success"
                                                                style={{ flex: 1, height: 44 }}
                                                                onClick={() => handleAction('approve', selectedReport.id)}
                                                                disabled={processingId}
                                                            >
                                                                {processingId === selectedReport.id ? <FiRefreshCw className="v-spin" /> : <FiCheck style={{ marginRight: 8 }} />}
                                                                Aprobar
                                                            </button>
                                                            <button
                                                                className="v-btn-danger"
                                                                style={{ flex: 1, height: 44 }}
                                                                onClick={() => {
                                                                    const reason = (quickRejectReason || '').trim();
                                                                    if (!reason) {
                                                                        showSnackbar('Escribe el motivo de rechazo para continuar.', { type: 'warning' });
                                                                        return;
                                                                    }
                                                                    handleAction('reject', selectedReport.id, { motivo: reason });
                                                                }}
                                                                disabled={processingId}
                                                            >
                                                                <FiX style={{ marginRight: 8 }} />
                                                                Rechazar
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            className="v-input"
                                                            rows={3}
                                                            placeholder="Motivo de rechazo (requerido)..."
                                                            value={quickRejectReason}
                                                            onChange={(e) => setQuickRejectReason(e.target.value)}
                                                            style={{ marginTop: 10, resize: 'vertical' }}
                                                        />
                                                    </>
                                                ) : selectedReport.estado === 'comprobante_aprobado' ? (
                                                    <button
                                                        className="v-btn-primary"
                                                        style={{ width: '100%', height: 44, background: 'linear-gradient(135deg, #1976d2, #2196f3)' }}
                                                        onClick={() => handleAction('confirm_payment', selectedReport.id)}
                                                        disabled={processingId}
                                                    >
                                                        {processingId === selectedReport.id ? <FiRefreshCw className="v-spin" /> : <FiCheckCircle style={{ marginRight: 8 }} />}
                                                        Confirmar Pago Final
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Image Column */}
                                        <div style={{ background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                                            {selectedReport.comprobante_url ? (
                                                <>
                                                    {/* Reutilización obligatoria: resolver URL con helper compartido */}
                                                    <img
                                                        src={getR2ImageUrl(selectedReport.comprobante_url)}
                                                        alt="Voucher"
                                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', zIndex: 2 }}
                                                        onError={(e) => {
                                                            const rawOriginal = safeText(selectedReport.comprobante_url, '').trim();
                                                            // Primer fallback: probar URL original tal cual venga del backend.
                                                            if (rawOriginal && e.target.dataset.fallbackTried !== 'true') {
                                                                e.target.dataset.fallbackTried = 'true';
                                                                e.target.src = rawOriginal;
                                                                return;
                                                            }

                                                            e.target.onerror = null;
                                                            e.target.src = 'https://placehold.co/600x800?text=Error+al+cargar+comprobante';
                                                        }}
                                                    />
                                                    <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 3, display: 'flex', gap: 8 }}>
                                                        <button
                                                            onClick={() => setFullscreenImage(getR2ImageUrl(selectedReport.comprobante_url))}
                                                            className="v-btn-icon"
                                                            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', border: 'none', cursor: 'pointer' }}
                                                            title="Ver en pantalla completa"
                                                        >
                                                            <FiExternalLink />
                                                        </button>
                                                        <button
                                                            onClick={() => downloadR2File(getR2ImageUrl(selectedReport.comprobante_url), `comprobante_${selectedReport.id}.jpg`)}
                                                            className="v-btn-icon"
                                                            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', border: 'none', cursor: 'pointer' }}
                                                            title="Descargar comprobante"
                                                        >
                                                            <FiDownload />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                    <FiAlertTriangle size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
                                                    <p>Imagen no disponible</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ Modal: Config bancaria ═══ */}
                    {showBankConfig && (
                        <div className="v-modal-overlay" onClick={() => setShowBankConfig(false)}>
                            <div className="v-modal-content" style={{ maxWidth: 520, width: '92%' }} onClick={e => e.stopPropagation()}>
                                <div className="v-modal-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(156, 39, 176, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FiSettings color="#9c27b0" size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Configuración Bancaria</h3>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Datos que verán las empresas para transferencias</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowBankConfig(false)} className="v-close-btn"><FiX /></button>
                                </div>
                                <div className="v-modal-body">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label className="v-label">Método de Recaudo</label>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                {['cuenta_bancaria', 'nequi'].map(m => (
                                                    <button
                                                        key={m}
                                                        className={`v-toggle-btn ${bankForm.metodo_recaudo === m ? 'active' : ''}`}
                                                        onClick={() => setBankForm(prev => ({
                                                            ...prev,
                                                            metodo_recaudo: m,
                                                            banco_nombre: m === 'nequi' ? 'Nequi' : prev.banco_nombre,
                                                            banco_codigo: m === 'nequi' ? 'NEQUI' : prev.banco_codigo,
                                                            tipo_cuenta: m === 'nequi' ? 'nequi' : prev.tipo_cuenta,
                                                        }))}
                                                        style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid rgba(128,128,128,0.2)', background: bankForm.metodo_recaudo === m ? 'rgba(156, 39, 176, 0.1)' : 'transparent', color: bankForm.metodo_recaudo === m ? '#9c27b0' : 'inherit', fontWeight: 600, cursor: 'pointer' }}
                                                    >
                                                        {m === 'nequi' ? 'Nequi' : 'Cuenta Bancaria'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {bankForm.metodo_recaudo === 'cuenta_bancaria' && (
                                            <>
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <label className="v-label">Banco</label>
                                                    <select
                                                        value={bankForm.banco_codigo || ''}
                                                        onChange={e => {
                                                            const bank = banks.find(b => b.codigo === e.target.value);
                                                            setBankForm(prev => ({
                                                                ...prev,
                                                                banco_codigo: e.target.value,
                                                                banco_nombre: bank?.nombre || prev.banco_nombre,
                                                            }));
                                                        }}
                                                        className="v-input"
                                                        disabled={loadingBanks}
                                                    >
                                                        <option value="">{loadingBanks ? 'Cargando bancos...' : 'Selecciona un banco'}</option>
                                                        {banks.map(b => <option key={b.codigo} value={b.codigo}>{b.nombre}</option>)}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="v-label">Tipo Cuenta</label>
                                                    <select
                                                        value={bankForm.tipo_cuenta || ''}
                                                        onChange={e => setBankForm(prev => ({ ...prev, tipo_cuenta: e.target.value }))}
                                                        className="v-input"
                                                    >
                                                        <option value="">Selecciona tipo</option>
                                                        <option value="ahorros">Ahorros</option>
                                                        <option value="corriente">Corriente</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}

                                        <div style={{ gridColumn: bankForm.metodo_recaudo === 'nequi' ? 'span 2' : 'span 1' }}>
                                            <label className="v-label">
                                                {bankForm.metodo_recaudo === 'nequi' ? 'Número Nequi' : 'Número de Cuenta'}
                                            </label>
                                            <input
                                                type="text"
                                                value={bankForm.numero_cuenta || ''}
                                                onChange={e => setBankForm(prev => ({ ...prev, numero_cuenta: e.target.value }))}
                                                className="v-input"
                                                placeholder={bankForm.metodo_recaudo === 'nequi' ? '300 000 0000' : '000-00000-00'}
                                            />
                                        </div>

                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label className="v-label">Titular de la Cuenta</label>
                                            <input
                                                type="text"
                                                value={bankForm.titular_cuenta || ''}
                                                onChange={e => setBankForm(prev => ({ ...prev, titular_cuenta: e.target.value }))}
                                                className="v-input"
                                            />
                                        </div>

                                        <div>
                                            <label className="v-label">NIT / Documento</label>
                                            <input
                                                type="text"
                                                value={bankForm.documento_titular || ''}
                                                onChange={e => setBankForm(prev => ({ ...prev, documento_titular: e.target.value }))}
                                                className="v-input"
                                            />
                                        </div>

                                        <div>
                                            <label className="v-label">Ref. Pago (Opcional)</label>
                                            <input
                                                type="text"
                                                value={bankForm.referencia_transferencia || ''}
                                                onChange={e => setBankForm(prev => ({ ...prev, referencia_transferencia: e.target.value }))}
                                                className="v-input"
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                                        <button onClick={() => setShowBankConfig(false)} className="v-btn-secondary" style={{ flex: 1 }}>
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={saveBankConfig}
                                            disabled={savingBank}
                                            className="v-btn-primary"
                                            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                        >
                                            {savingBank ? <FiRefreshCw className="v-spin" /> : <FiCheck />}
                                            {savingBank ? 'Guardando...' : 'Guardar Cambios'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ Modal: Registro Pago Manual ═══ */}
                    {showManualPayment && selectedEmpresa && (
                        <div className="v-modal-overlay" onClick={() => !savingManualPayment && setShowManualPayment(false)}>
                            <div className="v-modal-content" style={{ maxWidth: 480, width: '92%' }} onClick={e => e.stopPropagation()}>
                                <div className="v-modal-header">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(76, 175, 80, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FiPlus color="#4caf50" size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Registrar Pago Recibido</h3>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedEmpresa.nombre}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowManualPayment(false)} className="v-close-btn" disabled={savingManualPayment}><FiX /></button>
                                </div>
                                <div className="v-modal-body">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div className="v-info-card" style={{ background: 'rgba(25, 118, 210, 0.05)', padding: '12px', borderRadius: 12, border: '1px dashed rgba(25, 118, 210, 0.2)' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Saldo Pendiente</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: hasActiveDebt(selectedEmpresa) ? '#f44336' : '#4caf50' }}>{fmt(normalizeSaldoCop(selectedEmpresa.saldo_pendiente))}</span>
                                        </div>

                                        <div>
                                            <label className="v-label">Monto Recibido</label>
                                            <div style={{ position: 'relative' }}>
                                                <FiDollarSign style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                                                <input
                                                    type="text"
                                                    className="v-input"
                                                    style={{ paddingLeft: 32 }}
                                                    placeholder="0"
                                                    value={manualPaymentForm.monto}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        setManualPaymentForm(prev => ({ ...prev, monto: val }));
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="v-label">Método de Pago</label>
                                            <select
                                                className="v-input"
                                                value={manualPaymentForm.metodo_pago}
                                                onChange={(e) => setManualPaymentForm(prev => ({ ...prev, metodo_pago: e.target.value }))}
                                            >
                                                <option value="transferencia">Transferencia Bancaria</option>
                                                <option value="efectivo">Efectivo</option>
                                                <option value="consignacion">Consignación</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="v-label">Notas / Observaciones</label>
                                            <textarea
                                                className="v-input"
                                                rows={3}
                                                placeholder="Ej: Recibido por ventanilla..."
                                                value={manualPaymentForm.notas}
                                                onChange={(e) => setManualPaymentForm(prev => ({ ...prev, notas: e.target.value }))}
                                                style={{ resize: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                                        <button onClick={() => setShowManualPayment(false)} className="v-btn-secondary" style={{ flex: 1 }} disabled={savingManualPayment}>
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleManualPayment}
                                            disabled={savingManualPayment || !manualPaymentForm.monto}
                                            className="v-btn-success"
                                            style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                        >
                                            {savingManualPayment ? <FiRefreshCw className="v-spin" /> : <FiCheck />}
                                            {savingManualPayment ? 'Registrando...' : 'Confirmar Pago'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ═══ Overlay: Comprobante pantalla completa (sin salir del sistema) ═══ */}
            {fullscreenImage && (
                <div
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
                    onClick={() => setFullscreenImage(null)}
                >
                    <img
                        src={fullscreenImage}
                        alt="Comprobante ampliado"
                        style={{ maxWidth: '95vw', maxHeight: '95vh', objectFit: 'contain', borderRadius: 8 }}
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setFullscreenImage(null)}
                        style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 22 }}
                    >
                        <FiX />
                    </button>
                    <div style={{ position: 'absolute', bottom: 20, display: 'flex', gap: 12 }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); downloadR2File(fullscreenImage, 'comprobante.jpg'); }}
                            className="v-btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <FiDownload /> Descargar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCompanyPayments;
