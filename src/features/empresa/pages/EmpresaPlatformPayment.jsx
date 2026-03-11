import React, { useState, useEffect, useCallback } from 'react';
import {
    FiDollarSign, FiUpload, FiClock, FiCheckCircle, FiFileText,
    FiRefreshCw, FiAlertTriangle, FiCreditCard, FiInfo, FiDownload
} from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import {
    getPlatformDebtContext,
    submitPlatformPaymentProof,
    getEmpresaFacturas
} from '../services/empresaService';
import PageHeader from '../../shared/components/PageHeader';
import GlassStatCard from '../../shared/components/GlassStatCard';
import EmptyState from '../../shared/components/EmptyState';
import StatusBadge from '../../shared/components/StatusBadge';
import { ShimmerStatGrid } from '../../shared/components/ShimmerLoader';
import { useSnackbar } from '../../shared/components/AppSnackbar';
import CurrencyInput from '../../shared/components/CurrencyInput';
import { getR2ImageUrl } from '../../../utils/r2Images';

const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return d; } };

const EmpresaPlatformPayment = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [context, setContext] = useState({});
    const [facturas, setFacturas] = useState([]);
    const [resumenFacturas, setResumenFacturas] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('pagar');

    // Formulario de pago
    const [monto, setMonto] = useState(0);
    const [comprobante, setComprobante] = useState(null);
    const [observaciones, setObservaciones] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const { showSnackbar } = useSnackbar();

    const empresaId = user?.empresa_id || user?.id;

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

    const fetchData = useCallback(async () => {
        if (!empresaId) return;
        setLoading(true);
        try {
            const [ctxRes, facRes] = await Promise.all([
                getPlatformDebtContext(empresaId),
                getEmpresaFacturas(empresaId)
            ]);
            if (ctxRes?.success) {
                setContext(ctxRes.data || {});
                const deuda = parseFloat(ctxRes.data?.deuda_actual || 0);
                if (deuda > 0 && !monto) setMonto(Math.round(deuda));
            }
            if (facRes?.success) {
                const facturasData = Array.isArray(facRes.data) ? facRes.data : (facRes.data?.facturas || []);
                setFacturas(facturasData);
                setResumenFacturas(facRes.resumen || facRes.data?.resumen || {});
            }
        } catch (e) {
            console.error('Error cargando datos:', e);
        } finally {
            setLoading(false);
        }
    }, [empresaId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const montoNum = Number(monto || 0);
        const bloqueaEnvio = estadoReporte === 'pendiente_revision' || estadoReporte === 'comprobante_aprobado';

        if (bloqueaEnvio) {
            showSnackbar('Ya tienes un comprobante en proceso de revisión. Debes esperar el nuevo estado.', { type: 'warning' });
            return;
        }

        if (!montoNum || montoNum <= 0) {
            showSnackbar('Ingresa un monto válido para reportar el pago.', { type: 'warning' });
            return;
        }
        if (!comprobante) {
            showSnackbar('Debes adjuntar un comprobante de pago.', { type: 'warning' });
            return;
        }

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('empresa_id', empresaId);
            fd.append('user_id', user?.id);
            fd.append('monto', montoNum);
            fd.append('comprobante', comprobante);
            if (observaciones.trim()) fd.append('observaciones', observaciones.trim());

            const res = await submitPlatformPaymentProof(fd);
            if (res?.success) {
                setSubmitSuccess(true);
                setComprobante(null);
                setObservaciones('');
                showSnackbar('Comprobante enviado con éxito. Queda pendiente validación del administrador.', { type: 'success' });
                setTimeout(() => { setSubmitSuccess(false); fetchData(); }, 3000);
            } else {
                showSnackbar(res?.message || 'Error al enviar comprobante', { type: 'error' });
            }
        } catch (e) {
            showSnackbar('Error de conexión al enviar comprobante.', { type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const deuda = parseFloat(context.deuda_actual || 0);
    const totalPagado = parseFloat(context.total_pagado || 0);
    const comision = parseFloat(context.comision_porcentaje || 0);
    const cuenta = context.cuenta_transferencia || {};
    const hasCuenta = cuenta.configurada;
    const isNequi = (cuenta.metodo_recaudo || '').toLowerCase() === 'nequi' ||
        (cuenta.tipo_cuenta || '').toLowerCase() === 'nequi' ||
        (cuenta.banco_nombre || '').toLowerCase() === 'nequi';
    const estadoReporte = context.estado_reporte;
    const bloqueaEnvio = estadoReporte === 'pendiente_revision' || estadoReporte === 'comprobante_aprobado';

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Pagar Plataforma"
                subtitle="Gestiona tu deuda con el administrador de VIAX"
                actions={
                    <button onClick={fetchData} className="v-btn-icon" title="Actualizar">
                        <FiRefreshCw />
                    </button>
                }
            />

            {loading ? <ShimmerStatGrid count={3} /> : (
                <>
                    {/* KPI */}
                    <section className="v-finance-section">
                        <div className="v-stat-grid">
                            <GlassStatCard
                                title="Deuda actual"
                                value={fmt(deuda)}
                                icon={<FiDollarSign />}
                                color={deuda > 0 ? '#f44336' : '#4caf50'}
                            />
                            <GlassStatCard
                                title="Total pagado"
                                value={fmt(totalPagado)}
                                icon={<FiCheckCircle />}
                                color="#2196f3"
                            />
                            <GlassStatCard
                                title="Comisión"
                                value={`${comision}%`}
                                icon={<FiCreditCard />}
                                color="#9c27b0"
                            />
                        </div>
                    </section>

                    {/* Estado del reporte actual */}
                    {estadoReporte && estadoReporte !== 'none' && (
                        <div style={{
                            background: 'rgba(255,152,0,0.08)',
                            border: '1px solid rgba(255,152,0,0.25)',
                            borderRadius: 12,
                            padding: '14px 20px',
                            marginBottom: 24,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            <FiClock style={{ color: '#ff9800' }} />
                            <span style={{ fontSize: '0.9rem' }}>
                                Estado del último comprobante: <strong>{String(estadoReporte || '').replace(/_/g, ' ')}</strong>
                            </span>
                        </div>
                    )}

                    {bloqueaEnvio && (
                        <div style={{
                            background: 'rgba(33,150,243,0.08)',
                            border: '1px solid rgba(33,150,243,0.25)',
                            borderRadius: 12,
                            padding: '12px 16px',
                            marginBottom: 24,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}>
                            <FiInfo style={{ color: '#2196f3' }} />
                            <span style={{ fontSize: '0.9rem' }}>
                                Tu último comprobante está en proceso de revisión. El envío de nuevos comprobantes está bloqueado hasta que cambie el estado.
                            </span>
                        </div>
                    )}

                    {!hasCuenta && (
                        <div style={{
                            background: 'rgba(244, 67, 54, 0.08)',
                            border: '1px solid rgba(244, 67, 54, 0.3)',
                            borderRadius: 12,
                            padding: '14px 20px',
                            marginBottom: 24,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                        }}>
                            <FiAlertTriangle style={{ color: '#ef4444' }} />
                            <span style={{ fontSize: '0.9rem' }}>
                                El administrador aún no configuró el destino de recaudo. No realices transferencias hasta ver la cuenta o Nequi oficial.
                            </span>
                        </div>
                    )}

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                        {[
                            { value: 'pagar', label: 'Pagar deuda', icon: <FiUpload /> },
                            { value: 'facturas', label: 'Facturas', icon: <FiFileText /> },
                        ].map(t => (
                            <button
                                key={t.value}
                                onClick={() => setActiveTab(t.value)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '8px 18px', borderRadius: 10,
                                    border: activeTab === t.value ? '2px solid var(--color-primary, #1976d2)' : '1px solid rgba(128,128,128,0.2)',
                                    background: activeTab === t.value ? 'rgba(25,118,210,0.08)' : 'transparent',
                                    color: activeTab === t.value ? 'var(--color-primary, #1976d2)' : 'inherit',
                                    fontWeight: activeTab === t.value ? 700 : 400,
                                    cursor: 'pointer', fontSize: '0.9rem'
                                }}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'pagar' && (
                        <div style={{ display: 'grid', gridTemplateColumns: hasCuenta ? '1fr 1fr' : '1fr', gap: 24 }}>
                            {/* Cuenta de transferencia */}
                            {hasCuenta && (
                                <div className="v-card" style={{ padding: 24 }}>
                                    <h4 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FiInfo style={{ color: '#1976d2' }} /> Cuenta de transferencia
                                    </h4>
                                    {(isNequi
                                        ? ['metodo_recaudo', 'numero_cuenta', 'titular_cuenta', 'documento_titular', 'referencia_transferencia']
                                        : ['metodo_recaudo', 'banco_nombre', 'tipo_cuenta', 'numero_cuenta', 'titular_cuenta', 'documento_titular', 'referencia_transferencia']
                                    ).map(k => {
                                        const val = k === 'metodo_recaudo'
                                            ? (cuenta[k] || (isNequi ? 'nequi' : 'cuenta_bancaria'))
                                            : cuenta[k];
                                        if (!val) return null;
                                        const label = k === 'metodo_recaudo'
                                            ? 'Método'
                                            : (k === 'numero_cuenta' && isNequi
                                                ? 'Número Nequi'
                                                : k.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()));
                                        const display = k === 'metodo_recaudo'
                                            ? (isNequi ? 'Nequi' : 'Cuenta bancaria')
                                            : val;
                                        return (
                                            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(128,128,128,0.1)' }}>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
                                                <strong style={{ fontSize: '0.9rem' }}>{display}</strong>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Formulario */}
                            <div className="v-card" style={{ padding: 24 }}>
                                {submitSuccess ? (
                                    <div style={{ textAlign: 'center', padding: 40 }}>
                                        <FiCheckCircle style={{ color: '#4caf50', fontSize: 48, marginBottom: 16 }} />
                                        <h3 style={{ color: '#4caf50' }}>Comprobante enviado</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>El administrador revisará tu comprobante de pago.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <h4 style={{ margin: '0 0 20px' }}>Enviar comprobante de pago</h4>

                                        <label style={{ display: 'block', marginBottom: 16 }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>Monto (COP)</span>
                                            <CurrencyInput
                                                value={monto}
                                                onChange={(e) => setMonto(Number(e.target.value || 0))}
                                                placeholder="Ej: 150.000"
                                                className="v-input"
                                                min={0}
                                                hint="Solo valores enteros COP (sin decimales)."
                                                disabled={bloqueaEnvio}
                                            />
                                        </label>

                                        <label style={{ display: 'block', marginBottom: 16 }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>Comprobante</span>
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => setComprobante(e.target.files?.[0] || null)}
                                                className="v-input"
                                                required
                                                disabled={bloqueaEnvio}
                                                style={{ width: '100%' }}
                                            />
                                            {comprobante && (
                                                <span style={{ fontSize: '0.8rem', color: '#4caf50', marginTop: 4, display: 'block' }}>
                                                    ✓ {comprobante.name}
                                                </span>
                                            )}
                                        </label>

                                        <label style={{ display: 'block', marginBottom: 20 }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, display: 'block' }}>Observaciones (opcional)</span>
                                            <textarea
                                                value={observaciones}
                                                onChange={(e) => setObservaciones(e.target.value)}
                                                placeholder="Referencia de transferencia, banco emisor..."
                                                className="v-input"
                                                rows={3}
                                                disabled={bloqueaEnvio}
                                                style={{ width: '100%', resize: 'vertical' }}
                                            />
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={submitting || bloqueaEnvio}
                                            className="v-btn-primary"
                                            style={{ width: '100%', padding: '12px', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600 }}
                                        >
                                            {bloqueaEnvio ? 'Comprobante en revisión' : (submitting ? 'Enviando...' : 'Enviar comprobante')}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'facturas' && (
                        <div>
                            {/* Resumen facturas */}
                            <div className="v-stat-grid" style={{ marginBottom: 20 }}>
                                <GlassStatCard
                                    title="Total facturas"
                                    value={resumenFacturas.total_facturas || 0}
                                    icon={<FiFileText />}
                                    color="#1976d2"
                                />
                                <GlassStatCard
                                    title="Total facturado"
                                    value={fmt(resumenFacturas.total_facturado || 0)}
                                    icon={<FiDollarSign />}
                                    color="#4caf50"
                                />
                            </div>

                            {facturas.length === 0 ? (
                                <EmptyState
                                    icon={<FiFileText />}
                                    title="Sin facturas"
                                    message="Aún no se han generado facturas para tu empresa."
                                />
                            ) : (
                                <div className="v-table-container">
                                    <table className="v-table">
                                        <thead>
                                            <tr>
                                                <th>Nº Factura</th>
                                                <th>Fecha</th>
                                                <th>Monto</th>
                                                <th>Estado</th>
                                                <th>PDF</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {facturas.map(f => (
                                                <tr key={f.id}>
                                                    <td><strong>{f.numero_factura}</strong></td>
                                                    <td>{fmtDate(f.fecha_emision)}</td>
                                                    <td>{fmt(Number(f.total ?? f.subtotal ?? f.monto ?? 0))}</td>
                                                    <td>
                                                        <StatusBadge
                                                            status={f.estado === 'pagada' ? 'success' : 'warning'}
                                                            label={f.estado === 'pagada' ? 'Pagada' : 'Emitida'}
                                                        />
                                                    </td>
                                                    <td>
                                                        {(f.pdf_ruta || f.pdf_url) && (
                                                            <button
                                                                onClick={() => downloadR2File(getR2ImageUrl(f.pdf_ruta || f.pdf_url), `${f.numero_factura || 'factura'}`)}
                                                                style={{ border: 'none', background: 'transparent', color: '#1976d2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}
                                                            >
                                                                <FiDownload /> Descargar
                                                            </button>
                                                        )}
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
        </div>
    );
};

export default EmpresaPlatformPayment;
