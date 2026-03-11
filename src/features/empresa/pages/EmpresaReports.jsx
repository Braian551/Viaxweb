import React, { useState, useEffect, useMemo } from 'react';
import {
    FiTrendingUp, FiMap, FiUsers, FiClock, FiCheckCircle,
    FiCalendar, FiArrowUpRight, FiArrowDownLeft, FiActivity,
    FiTruck, FiDollarSign, FiAward, FiPieChart, FiDownload,
    FiFilter, FiSearch, FiExternalLink, FiClipboard
} from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import {
    getEmpresaReports,
    getEmpresaDriversReport,
    getEmpresaTripsReport,
    getEmpresaVehicleTypesReport,
    getEmpresaReportPdfFallbackUrls
} from '../services/empresaService';
import PageHeader from '../../shared/components/PageHeader';
import GlassStatCard from '../../shared/components/GlassStatCard';
import FilterBar from '../../shared/components/FilterBar';
import { ViaxAreaChart, ViaxDonutChart, ViaxBarChart, CHART_COLORS } from '../../shared/components/ViaxCharts';
import { ShimmerStatGrid } from '../../shared/components/ShimmerLoader';
import EmptyState from '../../shared/components/EmptyState';
import StatusBadge from '../../shared/components/StatusBadge';
import Pagination from '../../shared/components/Pagination';
import { getR2ImageUrl } from '../../../utils/r2Images';

const EmpresaReports = () => {
    const { user } = useAuth();
    const [period, setPeriod] = useState('7d');
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Data states
    const [overviewData, setOverviewData] = useState(null);
    const [driversData, setDriversData] = useState(null);
    const [tripsData, setTripsData] = useState(null);
    const [vehicleData, setVehicleData] = useState(null);
    const [page, setPage] = useState(1);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const empresaId = useMemo(() => user?.empresa_id || user?.id, [user]);

    // Load data based on active tab
    useEffect(() => {
        if (!empresaId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'overview') {
                    const res = await getEmpresaReports(empresaId, period);
                    if (res.success) setOverviewData(res.data);
                } else if (activeTab === 'drivers') {
                    const res = await getEmpresaDriversReport(empresaId, period);
                    if (res.success) setDriversData(res.data);
                } else if (activeTab === 'trips') {
                    const res = await getEmpresaTripsReport(empresaId, period, page);
                    if (res.success) setTripsData(res.data);
                } else if (activeTab === 'vehicles') {
                    const res = await getEmpresaVehicleTypesReport(empresaId, period);
                    if (res.success) setVehicleData(res.data);
                }
            } catch (err) {
                console.error("Error loading report data:", err);
            }
            setLoading(false);
        };

        loadData();
    }, [empresaId, period, activeTab, page]);

    const fmt = (v) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v || 0);

    const periods = [
        { value: '7d', label: '7 días' },
        { value: '30d', label: '30 días' },
        { value: '90d', label: '3 meses' },
        { value: '1y', label: '1 año' },
    ];

    const tabs = [
        { id: 'overview', label: 'Resumen', icon: <FiActivity /> },
        { id: 'drivers', label: 'Conductores', icon: <FiUsers /> },
        { id: 'trips', label: 'Viajes', icon: <FiTruck /> },
        { id: 'vehicles', label: 'Flota', icon: <FiPieChart /> },
    ];

    const exportToCSV = (data, filename) => {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}_${period}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    // Rendering Helpers
    const renderOverview = () => {
        if (!overviewData) return <ShimmerStatGrid count={6} />;
        const { trip_stats = {}, earnings_stats = {}, trends = {}, chart_data = {}, top_drivers = [], vehicle_distribution = [], peak_hours = [] } = overviewData;

        const trendColor = (t) => t === 'up' ? '#4caf50' : '#f44336';
        const trendChart = (chart_data.labels || []).map((l, i) => ({
            label: l,
            viajes: chart_data.viajes ? chart_data.viajes[i] : 0,
            ingresos: chart_data.ingresos ? chart_data.ingresos[i] : 0
        }));

        return (
            <div className="v-reports-content">
                <div className="v-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <GlassStatCard icon={<FiActivity />} title="Viajes Totales" value={trip_stats.total} accentColor="#2196f3"
                        badge={<span style={{ color: trendColor(trends.viajes?.tendencia), fontSize: '0.75rem', fontWeight: 800 }}>{trends.viajes?.cambio_porcentaje}% vs anterior</span>} />
                    <GlassStatCard icon={<FiDollarSign />} title="Ingresos (GMV)" value={fmt(earnings_stats.ingresos_totales)} accentColor="#4caf50"
                        badge={<span style={{ color: trendColor(trends.ingresos?.tendencia), fontSize: '0.75rem', fontWeight: 800 }}>{trends.ingresos?.cambio_porcentaje}% vs anterior</span>} />
                    <GlassStatCard icon={<FiCheckCircle />} title="Éxito Real" value={`${trip_stats.tasa_completados}%`} accentColor="#00bcd4" />
                    <GlassStatCard icon={<FiMap />} title="Distancia Flota" value={`${trip_stats.distancia_total?.toLocaleString()} km`} accentColor="#ff9800" />
                </div>

                <div className="v-chart-grid" style={{ marginTop: '24px' }}>
                    <div className="glass-card v-chart-card" style={{ gridColumn: 'span 2' }}>
                        <h3 className="v-chart-title">Crecimiento y Demanda</h3>
                        <ViaxAreaChart data={trendChart} xKey="label" areas={[{ dataKey: 'viajes', name: 'Viajes', color: '#2196f3' }, { dataKey: 'ingresos', name: 'Ingresos', color: '#4caf50' }]} valueFormatter={(v, n) => n === 'Ingresos' ? fmt(v) : `${v} vjs`} />
                    </div>
                </div>

                <div className="v-card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', marginTop: '24px' }}>
                    <div className="glass-card v-section" style={{ padding: '24px' }}>
                        <h3 className="v-section__title"><FiClock /> Horas Pico</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '120px', marginTop: '20px' }}>
                            {peak_hours.map((v, h) => (
                                <div key={h} style={{ flex: 1, background: v === Math.max(...peak_hours) ? 'var(--primary)' : 'rgba(33, 150, 243, 0.2)', height: `${(v / Math.max(...peak_hours, 1)) * 100}%`, borderRadius: '2px' }} title={`${h}h: ${v} viajes`} />
                            ))}
                        </div>
                    </div>

                    <div className="glass-card v-section" style={{ padding: '24px' }}>
                        <h3 className="v-section__title"><FiAward /> Top Conductores</h3>
                        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {top_drivers.map(d => (
                                <div key={d.id} className="v-list-item-lite">
                                    <img src={getR2ImageUrl(d.foto_perfil) || '/avatar-default.png'} alt="" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                                    <div style={{ flex: 1, fontWeight: 600, fontSize: '0.85rem' }}>{d.nombre}</div>
                                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{fmt(d.ingresos)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderDrivers = () => {
        if (loading) return <ShimmerStatGrid count={4} />;
        const drivers = driversData?.conductores || [];

        return (
            <div className="v-reports-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 className="v-section__title">Ranking de Conductores</h3>
                    <button className="v-btn-lite" onClick={() => exportToCSV(drivers, 'conductores')}><FiDownload /> Exportar</button>
                </div>
                <div className="v-table-wrapper glass-card">
                    <table className="v-table">
                        <thead>
                            <tr>
                                <th>Conductor</th>
                                <th>Viajes</th>
                                <th>Eficiencia</th>
                                <th>Calificación</th>
                                <th style={{ textAlign: 'right' }}>Producción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map(d => (
                                <tr key={d.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <img src={getR2ImageUrl(d.foto_perfil) || '/avatar-default.png'} alt="" style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
                                            <div>
                                                <div style={{ fontWeight: 700 }}>{d.nombre}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.telefono}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{d.total_viajes}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', maxWidth: '60px' }}>
                                                <div style={{ width: `${d.tasa_completados}%`, height: '100%', background: '#4caf50', borderRadius: '3px' }} />
                                            </div>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{d.tasa_completados}%</span>
                                        </div>
                                    </td>
                                    <td><span style={{ color: '#ffc107', fontWeight: 800 }}>★ {d.rating}</span></td>
                                    <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--primary)' }}>{fmt(d.ingresos)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderTrips = () => {
        if (loading) return <ShimmerStatGrid count={4} />;
        const trips = tripsData?.viajes || [];
        const pagination = tripsData?.pagination || {};

        return (
            <div className="v-reports-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 className="v-section__title">Bitácora de Servicios</h3>
                    <button className="v-btn-lite" onClick={() => exportToCSV(trips, 'viajes')}><FiDownload /> Exportar</button>
                </div>
                <div className="v-table-wrapper glass-card">
                    <table className="v-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Conductor</th>
                                <th>Servicio</th>
                                <th>Ruta</th>
                                <th>Estado</th>
                                <th style={{ textAlign: 'right' }}>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trips.map(t => (
                                <tr key={t.id}>
                                    <td style={{ fontSize: '0.8rem' }}>{new Date(t.solicitado_en).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td style={{ fontWeight: 600 }}>{t.conductor_nombre}</td>
                                    <td><StatusBadge status={t.tipo_operacion || t.tipo_vehiculo || t.tipo_servicio} label={t.tipo_operacion_nombre || t.tipo_vehiculo || t.tipo_servicio} /></td>
                                    <td style={{ maxWidth: '180px', fontSize: '0.75rem' }}>
                                        <div className="v-text-truncate" title={t.direccion_recogida}><b>De:</b> {t.direccion_recogida}</div>
                                        <div className="v-text-truncate" title={t.direccion_destino}><b>A:</b> {t.direccion_destino}</div>
                                    </td>
                                    <td><StatusBadge status={t.estado} /></td>
                                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(t.precio_final)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={pagination.total_pages} onPageChange={setPage} style={{ marginTop: '20px' }} />
            </div>
        );
    };

    const renderVehicles = () => {
        if (loading) return <ShimmerStatGrid count={4} />;
        const vehicles = vehicleData?.vehiculos || [];

        const chartData = vehicles.map(v => ({ name: v.nombre, value: v.viajes || v.total_viajes }));

        return (
            <div className="v-reports-content">
                <div className="v-chart-grid">
                    <div className="glass-card v-chart-card">
                        <h3 className="v-chart-title">Composición de Operación</h3>
                        <ViaxDonutChart data={chartData} valueFormatter={(v) => `${v} viajes`} />
                    </div>
                    <div className="glass-card v-chart-card">
                        <h3 className="v-chart-title">Producción por Tipo</h3>
                        <ViaxBarChart data={vehicles} xKey="nombre" bars={[{ dataKey: 'ingresos', name: 'Ingresos', color: '#4caf50' }]} valueFormatter={(v) => fmt(v)} />
                    </div>
                </div>

                <div className="v-table-wrapper glass-card" style={{ marginTop: '24px' }}>
                    <table className="v-table">
                        <thead>
                            <tr>
                                <th>Tipo de Vehículo</th>
                                <th>Servicios</th>
                                <th>Tasa Éxito</th>
                                <th>Dist. Promedio</th>
                                <th style={{ textAlign: 'right' }}>GMV Generado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map(v => (
                                <tr key={v.tipo}>
                                    <td style={{ fontWeight: 700 }}><StatusBadge status={v.tipo} label={v.nombre} /></td>
                                    <td>{v.total_viajes}</td>
                                    <td><span style={{ fontWeight: 800, color: v.tasa_completados > 80 ? '#4caf50' : '#ff9800' }}>{v.tasa_completados}%</span></td>
                                    <td>{v.distancia_promedio} km</td>
                                    <td style={{ textAlign: 'right', fontWeight: 900 }}>{fmt(v.ingresos)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const handleGeneratePdf = async () => {
        if (!empresaId || generatingPdf) return;

        setGeneratingPdf(true);
        try {
            const urls = getEmpresaReportPdfFallbackUrls(empresaId, period);
            let opened = false;

            for (const url of urls) {
                try {
                    const response = await fetch(url, { method: 'GET', credentials: 'include' });
                    if (!response.ok) {
                        continue;
                    }

                    const contentType = (response.headers.get('content-type') || '').toLowerCase();

                    if (contentType.includes('application/pdf')) {
                        const blob = await response.blob();
                        const objectUrl = URL.createObjectURL(blob);
                        window.open(objectUrl, '_blank', 'noopener,noreferrer');
                        // Let browser read the object URL before revoking.
                        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
                        opened = true;
                        break;
                    }

                    // Some outdated backends return JSON with "Acción no válida".
                    const maybeJson = await response.text();
                    if (maybeJson && maybeJson.toLowerCase().includes('no v')) {
                        continue;
                    }
                } catch (err) {
                    console.error('Error probando endpoint PDF:', url, err);
                }
            }

            if (!opened) {
                alert('No fue posible generar el PDF. Debes desplegar el backend actualizado de reportes (reports.php acción pdf / reports_pdf.php).');
            }
        } finally {
            setGeneratingPdf(false);
        }
    };

    return (
        <div className="v-dashboard">
            <PageHeader
                title="Sistemas de Reportes"
                subtitle="Inteligencia de negocios y analítica profunda de flota"
                actions={
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <FilterBar filters={periods} activeValue={period} onChange={setPeriod} />
                        <button className="v-btn-primary" onClick={handleGeneratePdf} disabled={generatingPdf}><FiClipboard /> {generatingPdf ? 'Generando...' : 'Generar PDF'}</button>
                    </div>
                }
            />

            <div className="v-tabs-container">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        className={`v-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                        onClick={() => { setActiveTab(t.id); setPage(1); }}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            <div className="v-reports-pane">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'drivers' && renderDrivers()}
                {activeTab === 'trips' && renderTrips()}
                {activeTab === 'vehicles' && renderVehicles()}
            </div>
        </div>
    );
};

export default EmpresaReports;
