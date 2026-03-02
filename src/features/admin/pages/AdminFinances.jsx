import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiAlertTriangle, FiArrowDownRight, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getPlatformEarnings } from '../services/adminService';
import PageHeader from '../../shared/components/PageHeader';
import GlassStatCard from '../../shared/components/GlassStatCard';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerStatGrid } from '../../shared/components/ShimmerLoader';
import { ViaxAreaChart, ViaxDonutChart } from '../../shared/components/ViaxCharts';

const PERIODS = ['hoy', 'semana', 'mes', 'anio', 'todo'];

const AdminFinances = () => {
    const { user } = useAuth();
    const [finances, setFinances] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [periodo, setPeriodo] = useState('mes');

    const fetchFinances = async () => {
        if (!user || !['admin', 'administrador'].includes(user.tipo_usuario)) return;
        setLoading(true);
        const res = await getPlatformEarnings(user.id, periodo);
        if (res.success && res.data) {
            setFinances(res.data);
            setError(null);
        } else {
            setError(res.message || 'Error al obtener finanzas');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchFinances();
        // eslint-disable-next-line
    }, [user, periodo]);

    const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);

    const { resumen, empresas_deudoras, ultimos_movimientos } = finances || {};
    const movimientosChartData = (ultimos_movimientos || []).slice(0, 8).map((mov, index) => ({
        fecha: mov.fecha ? new Date(mov.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : `M${index + 1}`,
        monto: Number(mov.monto || 0),
    }));
    const deudasChartData = (empresas_deudoras || [])
        .filter(empresa => Number(empresa.saldo_pendiente || 0) > 0)
        .slice(0, 5)
        .map(empresa => ({
            name: empresa.nombre,
            value: Number(empresa.saldo_pendiente || 0),
        }));

    return (
        <div className="v-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <PageHeader title="Finanzas" subtitle="Ganancias de plataforma y movimientos" />
                <div className="v-period-selector">
                    {PERIODS.map(p => (
                        <button key={p} className={`v-period-selector__btn ${periodo === p ? 'active' : ''}`} onClick={() => setPeriodo(p)}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <ShimmerStatGrid count={4} />
            ) : error ? (
                <div className="v-error-box">{error}</div>
            ) : (
                <>
                    <div className="v-stat-grid">
                        <GlassStatCard
                            title={`Ganancias (${periodo})`}
                            value={formatCurrency(resumen?.ganancias_periodo)}
                            subtitle="Comisiones generadas"
                            icon={<FiTrendingUp size={22} color="#4caf50" />}
                            accentColor="#4caf50"
                        />
                        <GlassStatCard
                            title={`Pagos recibidos (${periodo})`}
                            value={formatCurrency(resumen?.pagos_recibidos_periodo)}
                            subtitle="Transferido por empresas"
                            icon={<FiArrowDownRight size={22} color="#2196f3" />}
                            accentColor="#2196f3"
                        />
                        <GlassStatCard
                            title="Total Por Cobrar"
                            value={formatCurrency(resumen?.total_por_cobrar)}
                            subtitle="Deuda actual de empresas"
                            icon={<FiAlertTriangle size={22} color="#ff9800" />}
                            accentColor="#ff9800"
                        />
                        <GlassStatCard
                            title="Histórico Recibido"
                            value={formatCurrency(resumen?.total_recibido_historico)}
                            subtitle="Desde todas las empresas"
                            icon={<FiCreditCard size={22} color="#9c27b0" />}
                            accentColor="#9c27b0"
                        />
                    </div>

                    <div className="v-chart-grid">
                        <div className="glass-card v-chart-card">
                            <h3 className="v-chart-title">Tendencia de pagos recibidos</h3>
                            {movimientosChartData.length > 0 ? (
                                <ViaxAreaChart
                                    data={movimientosChartData}
                                    xKey="fecha"
                                    areas={[{ dataKey: 'monto', name: 'Pago', color: '#4caf50' }]}
                                    valueFormatter={(value) => formatCurrency(value)}
                                />
                            ) : (
                                <EmptyState icon={<FiDollarSign size={36} />} title="Sin pagos" description="No hay pagos para graficar." />
                            )}
                        </div>

                        <div className="glass-card v-chart-card">
                            <h3 className="v-chart-title">Distribución de cartera</h3>
                            {deudasChartData.length > 0 ? (
                                <ViaxDonutChart data={deudasChartData} valueFormatter={(value) => formatCurrency(value)} />
                            ) : (
                                <EmptyState icon={<FiBriefcase size={36} />} title="Sin cartera pendiente" description="No hay deudas activas de empresas." />
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
                        {/* Empresas Deudoras */}
                        <div className="glass-card v-section">
                            <div className="v-section__header">
                                <div className="v-section__icon" style={{ background: 'rgba(255, 152, 0, 0.1)' }}>
                                    <FiAlertTriangle size={20} color="#ff9800" />
                                </div>
                                <h2 className="v-section__title">Cuentas por cobrar (Top 10)</h2>
                            </div>

                            {empresas_deudoras && empresas_deudoras.filter(e => e.saldo_pendiente > 0).length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {empresas_deudoras.filter(e => e.saldo_pendiente > 0).map(empresa => (
                                        <div key={empresa.id} className="v-activity-item" style={{ padding: '12px', background: 'var(--bg)', borderRadius: '14px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                                                <ProfileAvatar src={empresa.logo_url} name={empresa.nombre} size={38} borderRadius={10} bgColor="#ff9800" />
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>{empresa.nombre}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{empresa.total_viajes} viajes &bull; {empresa.comision_porcentaje}% com</div>
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 800, color: '#f44336', fontSize: '0.95rem' }}>{formatCurrency(empresa.saldo_pendiente)}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<FiDollarSign size={40} />} title="Sin deudas" description="No hay empresas con saldos pendientes." />
                            )}
                        </div>

                        {/* Últimos Pagos */}
                        <div className="glass-card v-section">
                            <div className="v-section__header">
                                <div className="v-section__icon" style={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                                    <FiDollarSign size={20} color="#4caf50" />
                                </div>
                                <h2 className="v-section__title">Últimos Pagos Recibidos</h2>
                            </div>

                            {ultimos_movimientos && ultimos_movimientos.length > 0 ? (
                                <div>
                                    {ultimos_movimientos.map((mov) => (
                                        <div key={mov.id} className="v-activity-item">
                                            <div className="v-activity-item__content">
                                                <div className="v-activity-item__title">{mov.empresa_nombre}</div>
                                                <div className="v-activity-item__meta">{new Date(mov.fecha).toLocaleString()} &bull; {mov.descripcion}</div>
                                            </div>
                                            <span style={{ fontWeight: 800, color: '#4caf50', background: 'rgba(76, 175, 80, 0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                +{formatCurrency(mov.monto)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState icon={<FiCreditCard size={40} />} title="Sin pagos" description="No hay pagos registrados recientemente." />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminFinances;
