import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiAlertTriangle, FiArrowDownRight, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getPlatformEarnings } from '../services/adminService';
import { getR2ImageUrl } from '../../../utils/r2Images';
import '../layout/AdminLayout.css';

const StatCard = ({ title, value, subtitle, icon, colorClass }) => (
    <div className={`glass-card stat-card ${colorClass}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--text)' }}>{title}</h3>
            <div className="stat-icon-wrapper" style={{ padding: '10px', borderRadius: '12px', display: 'flex' }}>
                {icon}
            </div>
        </div>
        <div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)', lineHeight: '1.2' }}>{value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>{subtitle}</div>
        </div>
    </div>
);

const AdminFinances = () => {
    const { user } = useAuth();
    const [finances, setFinances] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [periodo, setPeriodo] = useState('mes'); // 'hoy', 'semana', 'mes', 'anio', 'todo'

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

    return (
        <div className="admin-dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Finanzas</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Ganancias de plataforma y movimientos</p>
                </div>

                {/* Period Selector */}
                <div style={{ background: 'var(--bg)', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px', border: '1px solid var(--border)' }}>
                    {['hoy', 'semana', 'mes', 'anio', 'todo'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriodo(p)}
                            style={{
                                padding: '8px 16px', borderRadius: '8px', border: 'none',
                                background: periodo === p ? 'var(--primary)' : 'transparent',
                                color: periodo === p ? '#fff' : 'var(--text-secondary)',
                                fontWeight: '600', fontSize: '0.85rem', textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Cargando finanzas...</div>
            ) : error ? (
                <div style={{ color: '#f44336', padding: '20px', background: 'rgba(244, 67, 54, 0.1)', borderRadius: '12px', border: '1px solid rgba(244,67,54,0.2)' }}>{error}</div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                        <StatCard
                            title={`Ganancias de plataforma (${periodo})`}
                            value={formatCurrency(resumen?.ganancias_periodo)}
                            subtitle="Comisiones generadas"
                            icon={<FiTrendingUp size={24} color="#4caf50" />}
                            colorClass="stat-green"
                        />
                        <StatCard
                            title={`Pagos recibidos (${periodo})`}
                            value={formatCurrency(resumen?.pagos_recibidos_periodo)}
                            subtitle="Dinero transferido por empresas"
                            icon={<FiArrowDownRight size={24} color="#2196f3" />}
                            colorClass="stat-blue"
                        />
                        <StatCard
                            title="Total Por Cobrar (Actual)"
                            value={formatCurrency(resumen?.total_por_cobrar)}
                            subtitle="Deuda total empresas a VIAX"
                            icon={<FiAlertTriangle size={24} color="#ff9800" />}
                            colorClass="stat-orange"
                        />
                        <StatCard
                            title="Total Histórico Recibido"
                            value={formatCurrency(resumen?.total_recibido_historico)}
                            subtitle="Desde todas las empresas"
                            icon={<FiCreditCard size={24} color="#9c27b0" />}
                            colorClass="stat-purple"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>

                        {/* Empresas Deudoras */}
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text)' }}>Cuentas por cobrar (Top 10)</h2>
                            </div>

                            {empresas_deudoras && empresas_deudoras.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {empresas_deudoras.filter(e => e.saldo_pendiente > 0).map(empresa => (
                                        <div key={empresa.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border, rgba(0,0,0,0.05))' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-alpha)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {empresa.logo_url ? <img src={getR2ImageUrl(empresa.logo_url)} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : <FiBriefcase color="var(--primary)" />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.95rem' }}>{empresa.nombre}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{empresa.total_viajes} viajes • {empresa.comision_porcentaje}% com</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: '800', color: '#f44336' }}>{formatCurrency(empresa.saldo_pendiente)}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {empresas_deudoras.filter(e => e.saldo_pendiente > 0).length === 0 && (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay empresas con deudas activas.</div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay empresas para mostrar.</div>
                            )}
                        </div>

                        {/* Recent Transactions */}
                        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text)' }}>Últimos Pagos Recibidos</h2>
                            </div>

                            {ultimos_movimientos && ultimos_movimientos.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    {ultimos_movimientos.map((mov, i) => (
                                        <div key={mov.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < ultimos_movimientos.length - 1 ? '1px solid var(--border, rgba(0,0,0,0.05))' : 'none' }}>
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '0.95rem' }}>{mov.empresa_nombre}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(mov.fecha).toLocaleString()} • {mov.descripcion}</div>
                                            </div>
                                            <div style={{ fontWeight: '800', color: '#4caf50', background: 'rgba(76, 175, 80, 0.1)', padding: '6px 12px', borderRadius: '8px' }}>
                                                +{formatCurrency(mov.monto)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay pagos registrados recientemente.</div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .stat-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
                .stat-blue .stat-icon-wrapper { background: rgba(33, 150, 243, 0.15); }
                .stat-green .stat-icon-wrapper { background: rgba(76, 175, 80, 0.15); }
                .stat-orange .stat-icon-wrapper { background: rgba(255, 152, 0, 0.15); }
                .stat-purple .stat-icon-wrapper { background: rgba(156, 39, 176, 0.15); }
                [data-theme='dark'] .stat-card { box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
                [data-theme='dark'] .stat-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
            `}} />
        </div>
    );
};

export default AdminFinances;
