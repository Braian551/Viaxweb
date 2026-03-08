import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiAlertTriangle, FiCreditCard, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaBalance, getEmpresaReports } from '../services/empresaService';
import GlassStatCard from '../../shared/components/GlassStatCard';
import PageHeader from '../../shared/components/PageHeader';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerStatGrid } from '../../shared/components/ShimmerLoader';
import { ViaxBarChart, ViaxDonutChart, ViaxAreaChart } from '../../shared/components/ViaxCharts';
import StatusBadge from '../../shared/components/StatusBadge';

const EmpresaFinances = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const empresaId = user.empresa_id || user.id;
        const load = async () => {
            setLoading(true);
            const [balanceRes, reportRes] = await Promise.all([
                getEmpresaBalance(empresaId),
                getEmpresaReports(empresaId, '30d')
            ]);

            if (balanceRes.success) setData(balanceRes.data || {});
            if (reportRes.success) setReportData(reportRes.data || {});
            setLoading(false);
        };
        load();
    }, [user]);

    const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

    if (loading) return <div className="v-dashboard"><PageHeader title="Finanzas" subtitle="Cargando..." /><ShimmerStatGrid count={4} /></div>;

    const empresa = data?.empresa || {};
    const resumen = data?.resumen || {};
    const earnings = reportData?.earnings_stats || {};
    const charts = reportData?.chart_data || {};

    const financeBars = [
        { metric: 'Ingresos Totales', valor: Number(earnings.ingresos_totales || 0) },
        { metric: 'Ganancia Empresa', valor: Number(earnings.ganancia_neta || 0) },
        { metric: 'Cargos Plataforma', valor: Number(resumen.total_cargos || 0) },
    ];

    const balanceDonut = [
        { name: 'Pagado', value: Number(resumen.total_pagos || 0), color: '#2196f3' },
        { name: 'Saldo Deuda', value: Number(empresa.saldo_pendiente || 0), color: '#f44336' },
    ].filter(item => item.value > 0);

    const trendData = (charts.labels || []).map((l, i) => ({
        label: l,
        valor: charts.ingresos ? charts.ingresos[i] : 0,
        viajes: charts.viajes ? charts.viajes[i] : 0
    }));

    const movimientos = data?.ultimos_movimientos || [];

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Centro Financiero"
                subtitle="Gestión de ganancias, pagos y balance de flota"
                actions={
                    <button className="v-btn-primary" onClick={() => navigate('/empresa/reports')}>
                        <FiTrendingUp /> Ver Reportes Avanzados
                    </button>
                }
            />

            <section className="v-finance-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Rendimiento del Negocio (Últimos 30 días)</h3>
                </div>
                <div className="v-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    <GlassStatCard
                        icon={<FiTrendingUp />}
                        title="Ingresos Totales (GMV)"
                        value={fmt(earnings.ingresos_totales)}
                        accentColor="#4caf50"
                        info="Valor bruto de todos los viajes realizados por tus conductores."
                    />
                    <GlassStatCard
                        icon={<FiDollarSign />}
                        title="Ganancia Neta Empresa"
                        value={fmt(earnings.ganancia_neta)}
                        accentColor="#2196f3"
                        info="Comisiones que ya han sido efectivamente cobradas por la empresa."
                    />
                    <GlassStatCard
                        icon={<FiInfo />}
                        title="Ingreso Promedio / Viaje"
                        value={fmt(earnings.ingreso_promedio)}
                        accentColor="#ff9800"
                        info="Promedio de ingresos generados por cada servicio completado."
                    />
                </div>
            </section>

            <div className="v-chart-grid" style={{ marginTop: '24px' }}>
                <div className="glass-card v-chart-card" style={{ gridColumn: 'span 2' }}>
                    <h3 className="v-chart-title">Tendencia de Ingresos Diarios</h3>
                    <ViaxAreaChart
                        data={trendData}
                        xKey="label"
                        areas={[{ dataKey: 'valor', name: 'Ingresos', color: '#4caf50' }]}
                        valueFormatter={(v) => fmt(v)}
                    />
                </div>
            </div>

            <section className="v-finance-section" style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '4px', height: '24px', background: '#9c27b0', borderRadius: '4px' }}></div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Balance con la Plataforma</h3>
                </div>
                <div className="v-stat-grid">
                    <GlassStatCard
                        icon={<FiCreditCard />}
                        title="Total Cargos (Deuda)"
                        value={fmt(resumen.total_cargos)}
                        accentColor="#9c27b0"
                        info="Suma total de deudas por comisiones administrativas de VIAX."
                    />
                    <GlassStatCard
                        icon={<FiDollarSign />}
                        title="Total Pagos Realizados"
                        value={fmt(resumen.total_pagos)}
                        accentColor="#2196f3"
                        info="Monto total pagado a la plataforma hasta la fecha."
                    />
                    <GlassStatCard
                        icon={<FiAlertTriangle />}
                        title="Saldo Pendiente"
                        value={fmt(empresa.saldo_pendiente)}
                        accentColor={(Number(empresa.saldo_pendiente || 0) > 0) ? '#f44336' : '#4caf50'}
                        info="Monto que debes pagar a VIAX para mantener tu cuenta al día."
                    />
                    <GlassStatCard
                        icon={<FiInfo />}
                        title="Tu Comisión Admin"
                        value={`${Number(empresa.comision_admin_porcentaje || 0).toFixed(1)}%`}
                        accentColor="#e91e63"
                        info="Porcentaje que VIAX deduce de tus operaciones."
                    />
                </div>
            </section>

            <div className="v-chart-grid" style={{ marginTop: '24px' }}>
                <div className="glass-card v-chart-card">
                    <h3 className="v-chart-title">Distribución de Saldos</h3>
                    {balanceDonut.length > 0 ? (
                        <ViaxDonutChart data={balanceDonut} valueFormatter={(value) => fmt(value)} />
                    ) : (
                        <EmptyState icon={<FiInfo size={36} />} title="Sin balance" description="No hay datos de pago suficientes." />
                    )}
                </div>
                <div className="glass-card v-chart-card">
                    <h3 className="v-chart-title">Comparativa de Operación</h3>
                    <ViaxBarChart
                        data={financeBars}
                        xKey="metric"
                        bars={[{ dataKey: 'valor', name: 'Monto', color: '#9c27b0' }]}
                        valueFormatter={(value) => fmt(value)}
                    />
                </div>
            </div>

            <div className="glass-card v-section" style={{ padding: '0' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
                    <h3 className="v-section__title">Historial de Movimientos</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                        Últimos pagos y cargos registrados en tu cuenta
                    </p>
                </div>

                <div className="v-table-wrapper">
                    {movimientos.length > 0 ? (
                        <table className="v-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Concepto</th>
                                    <th>Tipo</th>
                                    <th style={{ textAlign: 'right' }}>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movimientos.map((mov, i) => (
                                    <tr key={i}>
                                        <td>{new Date(mov.creado_en).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                        <td style={{ fontWeight: 600 }}>{mov.descripcion || 'Sin descripción'}</td>
                                        <td>
                                            <StatusBadge
                                                status={mov.tipo === 'pago' ? 'aprobada' : 'rechazada'}
                                                label={mov.tipo}
                                            />
                                        </td>
                                        <td style={{
                                            textAlign: 'right',
                                            fontWeight: 900,
                                            fontSize: '1rem',
                                            color: mov.tipo === 'pago' ? '#4caf50' : 'inherit'
                                        }}>
                                            {mov.tipo === 'pago' ? '+' : ''}{fmt(mov.monto)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '40px' }}>
                            <EmptyState
                                icon={<FiCreditCard size={40} />}
                                title="Sin movimientos"
                                description="No se han registrado pagos o cargos recientemente."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmpresaFinances;
