import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiAlertTriangle, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getGanancias } from '../services/conductorService';
import GlassStatCard from '../../shared/components/GlassStatCard';
import PageHeader from '../../shared/components/PageHeader';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerStatGrid, ShimmerTable } from '../../shared/components/ShimmerLoader';

const PERIODS = ['semana', 'mes', 'anio'];

const ConductorEarnings = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [periodo, setPeriodo] = useState('semana');

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

    const desglose = data?.desglose_diario || [];

    return (
        <div className="v-dashboard">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <PageHeader title="Mis Ganancias" subtitle="Desglose de ingresos y comisiones" />
                <div className="v-period-selector">
                    {PERIODS.map(p => (
                        <button key={p} className={`v-period-selector__btn ${periodo === p ? 'active' : ''}`} onClick={() => setPeriodo(p)}>
                            {p === 'anio' ? 'Año' : p.charAt(0).toUpperCase() + p.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <>
                    <ShimmerStatGrid count={3} />
                    <div className="glass-card v-section"><ShimmerTable rows={5} cols={4} /></div>
                </>
            ) : (
                <>
                    <div className="v-stat-grid">
                        <GlassStatCard
                            title="Ganancias Netas"
                            value={fmt(data?.total)}
                            icon={<FiTrendingUp size={22} color="#4caf50" />}
                            accentColor="#4caf50"
                        />
                        <GlassStatCard
                            title="Total Cobrado"
                            value={fmt(data?.total_cobrado)}
                            icon={<FiDollarSign size={22} color="#2196f3" />}
                            accentColor="#2196f3"
                        />
                        <GlassStatCard
                            title="Deuda Comisión"
                            value={fmt(data?.deuda_comision)}
                            subtitle={`Comisión: ${data?.comision_porcentaje_promedio ?? 10}%`}
                            icon={<FiAlertTriangle size={22} color="#f44336" />}
                            accentColor={(data?.deuda_comision || 0) > 0 ? '#f44336' : '#9e9e9e'}
                        />
                    </div>

                    {/* Daily Breakdown */}
                    <div className="glass-card v-section">
                        <div className="v-section__header">
                            <div className="v-section__icon" style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                                <FiCalendar size={20} color="#2196f3" />
                            </div>
                            <h2 className="v-section__title">Desglose Diario</h2>
                        </div>

                        {desglose.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="v-data-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th style={{ textAlign: 'right' }}>Viajes</th>
                                            <th style={{ textAlign: 'right' }}>Ganancia</th>
                                            <th style={{ textAlign: 'right' }}>Comisión</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {desglose.map((d, i) => (
                                            <tr key={i}>
                                                <td style={{ fontWeight: 600 }}>{new Date(d.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}</td>
                                                <td style={{ textAlign: 'right' }}>{d.viajes}</td>
                                                <td style={{ textAlign: 'right', color: '#4caf50', fontWeight: 700 }}>{fmt(d.ganancias)}</td>
                                                <td style={{ textAlign: 'right', color: '#ff9800', fontWeight: 600 }}>{fmt(d.comision)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState icon={<FiCalendar size={48} />} title="Sin datos" description="No hay datos para este período." />
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ConductorEarnings;
