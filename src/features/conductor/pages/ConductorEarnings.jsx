import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getGanancias } from '../services/conductorService';
import '../../shared/DashboardLayout.css';

const ConductorEarnings = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('semana'); // semana, mes, anio

    const getPeriodDates = (p) => {
        const now = new Date();
        let start;
        if (p === 'semana') { start = new Date(now); start.setDate(start.getDate() - 7); }
        else if (p === 'mes') { start = new Date(now); start.setMonth(start.getMonth() - 1); }
        else { start = new Date(now); start.setFullYear(start.getFullYear() - 1); }
        return { inicio: start.toISOString().split('T')[0], fin: now.toISOString().split('T')[0] };
    };

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            const { inicio, fin } = getPeriodDates(periodo);
            const res = await getGanancias(user.id, inicio, fin);
            if (res.success) setData(res.ganancias || res.data);
            setLoading(false);
        };
        load();
    }, [user, periodo]);

    const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Cargando ganancias...</div>;

    const desglose = data?.desglose_diario || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Mis Ganancias</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Desglose de ingresos y comisiones</p>
                </div>
                <div style={{ background: 'var(--bg)', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px', border: '1px solid var(--border)' }}>
                    {['semana', 'mes', 'anio'].map(p => (
                        <button key={p} onClick={() => setPeriodo(p)} style={{
                            padding: '8px 16px', borderRadius: '8px', border: 'none',
                            background: periodo === p ? 'var(--primary)' : 'transparent',
                            color: periodo === p ? '#fff' : 'var(--text-secondary)',
                            fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize'
                        }}>{p === 'anio' ? 'Año' : p.charAt(0).toUpperCase() + p.slice(1)}</button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(76,175,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiTrendingUp size={22} color="#4caf50" /></div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Ganancias Netas</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4caf50' }}>{fmt(data?.total)}</div>
                </div>
                <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(33,150,243,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiDollarSign size={22} color="#2196f3" /></div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Cobrado</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)' }}>{fmt(data?.total_cobrado)}</div>
                </div>
                <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(244,67,54,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiAlertTriangle size={22} color="#f44336" /></div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Deuda Comisión</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '800', color: (data?.deuda_comision || 0) > 0 ? '#f44336' : 'var(--text)' }}>{fmt(data?.deuda_comision)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Comisión: {data?.comision_porcentaje_promedio ?? 10}%</div>
                </div>
            </div>

            {/* Daily Breakdown */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiCalendar color="var(--primary)" /> Desglose Diario</h2>
                {desglose.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border, rgba(0,0,0,0.08))' }}>
                                    <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Fecha</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Viajes</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Ganancia</th>
                                    <th style={{ textAlign: 'right', padding: '10px 8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Comisión</th>
                                </tr>
                            </thead>
                            <tbody>
                                {desglose.map((d, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border, rgba(0,0,0,0.04))' }}>
                                        <td style={{ padding: '10px 8px', fontWeight: '600', color: 'var(--text)' }}>{new Date(d.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right', color: 'var(--text)' }}>{d.viajes}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right', color: '#4caf50', fontWeight: '700' }}>{fmt(d.ganancias)}</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right', color: '#ff9800', fontWeight: '600' }}>{fmt(d.comision)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay datos para este período.</div>
                )}
            </div>
        </div>
    );
};

export default ConductorEarnings;
