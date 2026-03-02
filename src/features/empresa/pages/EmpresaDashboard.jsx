import React, { useEffect, useState } from 'react';
import { FiUsers, FiTruck, FiDollarSign, FiBriefcase, FiActivity, FiMapPin, FiMail, FiPhone, FiHash, FiPercent } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaProfile, getSolicitudesVinculacion } from '../services/empresaService';
import GlassStatCard from '../../shared/components/GlassStatCard';
import PageHeader from '../../shared/components/PageHeader';
import StatusBadge from '../../shared/components/StatusBadge';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import EmptyState from '../../shared/components/EmptyState';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';
import { ViaxBarChart, ViaxDonutChart } from '../../shared/components/ViaxCharts';

const EmpresaDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const empresaId = user.empresa_id || user.id;
        const load = async () => {
            setLoading(true);
            const [profRes, solRes] = await Promise.all([
                getEmpresaProfile(empresaId),
                getSolicitudesVinculacion(empresaId, { page: 1, perPage: 5 })
            ]);
            if (profRes.success) setProfile(profRes.data || profRes.empresa || profRes);
            if (solRes.success) setSolicitudes(solRes.data?.solicitudes || solRes.solicitudes || []);
            setLoading(false);
        };
        load();
    }, [user]);

    if (loading) return <div className="v-dashboard"><ShimmerDashboard /></div>;

    const empresa = profile?.empresa || profile || {};
    const stats = profile?.estadisticas || {};
    const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);
    const operationChartData = [
        { metric: 'Conductores', valor: Number(stats.conductores_vinculados ?? empresa.total_conductores ?? 0) },
        { metric: 'Viajes', valor: Number(stats.viajes_totales ?? 0) },
        { metric: 'Ingresos', valor: Number(stats.ingresos_totales ?? 0) },
    ];

    const solicitudStatusMap = solicitudes.reduce((acc, item) => {
        const key = (item.estado || 'pendiente').toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const solicitudStatusData = Object.entries(solicitudStatusMap).map(([estado, value]) => ({
        name: estado.replace(/_/g, ' '),
        value,
    }));

    return (
        <div className="v-dashboard">
            <PageHeader title="Dashboard Empresa" subtitle={empresa.nombre_empresa || empresa.nombre || 'Mi Empresa'} />

            <div className="v-stat-grid">
                <GlassStatCard icon={<FiUsers />} title="Conductores Vinculados" value={stats.conductores_vinculados ?? empresa.total_conductores ?? 0} accentColor="#9c27b0" />
                <GlassStatCard icon={<FiTruck />} title="Viajes Totales" value={stats.viajes_totales ?? 0} accentColor="#2196f3" />
                <GlassStatCard icon={<FiDollarSign />} title="Ingresos Generados" value={fmt(stats.ingresos_totales)} accentColor="#4caf50" />
                <GlassStatCard icon={<FiBriefcase />} title="Estado" value={empresa.es_activa || empresa.estado === 'activa' ? 'Activa' : 'Inactiva'} accentColor="#ff9800" />
            </div>

            <div className="v-chart-grid">
                <div className="glass-card v-chart-card">
                    <h3 className="v-chart-title">Operación de la empresa</h3>
                    <ViaxBarChart
                        data={operationChartData}
                        xKey="metric"
                        bars={[{ dataKey: 'valor', name: 'Valor', color: '#9c27b0' }]}
                    />
                </div>

                <div className="glass-card v-chart-card">
                    <h3 className="v-chart-title">Estado de solicitudes</h3>
                    {solicitudStatusData.length > 0 ? (
                        <ViaxDonutChart data={solicitudStatusData} valueFormatter={(value) => `${value} solicitud(es)`} />
                    ) : (
                        <EmptyState icon={<FiActivity size={36} />} title="Sin solicitudes" description="No hay solicitudes para graficar." />
                    )}
                </div>
            </div>

            <div className="glass-card v-section">
                <div className="v-section__header">
                    <FiBriefcase className="v-section__icon" />
                    <h3 className="v-section__title">Información de la Empresa</h3>
                </div>
                <div className="v-info-rows">
                    <div className="v-info-row"><span className="v-info-row__label"><FiHash style={{ marginRight: 6 }} />NIT</span><span className="v-info-row__value">{empresa.nit || '—'}</span></div>
                    <div className="v-info-row"><span className="v-info-row__label"><FiMail style={{ marginRight: 6 }} />Email</span><span className="v-info-row__value">{empresa.email_empresa || empresa.email || '—'}</span></div>
                    <div className="v-info-row"><span className="v-info-row__label"><FiPhone style={{ marginRight: 6 }} />Teléfono</span><span className="v-info-row__value">{empresa.telefono || '—'}</span></div>
                    <div className="v-info-row"><span className="v-info-row__label"><FiMapPin style={{ marginRight: 6 }} />Municipio</span><span className="v-info-row__value">{empresa.municipio || '—'}</span></div>
                    <div className="v-info-row"><span className="v-info-row__label"><FiMapPin style={{ marginRight: 6 }} />Dirección</span><span className="v-info-row__value">{empresa.direccion || '—'}</span></div>
                    <div className="v-info-row"><span className="v-info-row__label"><FiPercent style={{ marginRight: 6 }} />Comisión Plataforma</span><span className="v-info-row__value">{empresa.comision_plataforma ?? stats.comision_plataforma ?? '—'}%</span></div>
                </div>
            </div>

            <div className="glass-card v-section">
                <div className="v-section__header">
                    <FiActivity className="v-section__icon" />
                    <h3 className="v-section__title">Solicitudes de Vinculación Recientes</h3>
                </div>
                {solicitudes.length > 0 ? (
                    <div className="v-activity-list">
                        {solicitudes.map((s, i) => (
                            <div key={s.id || i} className="v-activity-item">
                                <ProfileAvatar name={`${s.conductor_nombre || s.nombre || '?'} ${s.conductor_apellido || s.apellido || ''}`} size={40} borderRadius={12} bgColor="#ff9800" />
                                <div className="v-activity-item__body">
                                    <span className="v-activity-item__title">{s.conductor_nombre || s.nombre} {s.conductor_apellido || s.apellido || ''}</span>
                                    <span className="v-activity-item__meta">{s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString() : '—'}</span>
                                </div>
                                <StatusBadge status={s.estado || 'pendiente'} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={<FiUsers />} title="Sin solicitudes" description="No hay solicitudes de vinculación recientes." />
                )}
            </div>
        </div>
    );
};

export default EmpresaDashboard;
