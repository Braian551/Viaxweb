import React, { useEffect, useState } from 'react';
import { FiUsers, FiActivity, FiDollarSign, FiAlertCircle, FiMonitor } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getDashboardStats } from '../services/adminService';
import '../layout/AdminLayout.css'; // Reusing glass styles

const StatCard = ({ title, value, subtitle, icon, colorClass }) => (
    <div className={`glass-card stat-card ${colorClass}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: 'var(--text)' }}>{title}</h3>
            <div className="stat-icon-wrapper" style={{ padding: '10px', borderRadius: '12px', display: 'flex' }}>
                {icon}
            </div>
        </div>
        <div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text)', lineHeight: '1' }}>{value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', fontWeight: '500' }}>{subtitle}</div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            if (!user || user.tipo_usuario !== 'admin') {
                setError('No autorizado');
                setLoading(false);
                return;
            }

            const response = await getDashboardStats(user.id);
            if (response.success && response.data) {
                setStats(response.data);
            } else {
                setError(response.message || 'Error al cargar estadísticas');
            }
            setLoading(false);
        };

        fetchStats();
    }, [user]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--primary)' }}>Cargando dashboard in vivo...</div>;
    }

    if (error) {
        return <div style={{ color: '#f44336', padding: '20px', background: 'rgba(244, 67, 54, 0.1)', borderRadius: '12px', border: '1px solid rgba(244,67,54,0.2)' }}>{error}</div>;
    }

    const { usuarios, solicitudes, ingresos, reportes, actividades_recientes } = stats || {};

    // Formatter
    const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val || 0);

    return (
        <div className="admin-dashboard-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Header Greeting inside content */}
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Dashboard en vivo</h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Resumen general de la plataforma Viax</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <StatCard
                    title="Usuarios Totales"
                    value={usuarios?.total_usuarios || 0}
                    subtitle={`Activos: ${usuarios?.usuarios_activos || 0}`}
                    icon={<FiUsers size={24} color="#2196f3" />}
                    colorClass="stat-blue"
                />
                <StatCard
                    title="Solicitudes (Viajes)"
                    value={solicitudes?.total_solicitudes || 0}
                    subtitle={`Hoy: ${solicitudes?.solicitudes_hoy || 0}`}
                    icon={<FiActivity size={24} color="#00bcd4" />}
                    colorClass="stat-cyan"
                />
                <StatCard
                    title="Ingresos Totales"
                    value={formatCurrency(ingresos?.ingresos_totales)}
                    subtitle={`Hoy: ${formatCurrency(ingresos?.ingresos_hoy)}`}
                    icon={<FiDollarSign size={24} color="#4caf50" />}
                    colorClass="stat-green"
                />
                <StatCard
                    title="Reportes"
                    value={reportes?.reportes_pendientes || 0}
                    subtitle="Pendientes de revisión"
                    icon={<FiAlertCircle size={24} color="#ff9800" />}
                    colorClass="stat-orange"
                />
            </div>

            {/* Recent Activity Table using Glass Card */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ background: 'rgba(33, 150, 243, 0.1)', padding: '12px', borderRadius: '12px' }}>
                        <FiMonitor size={24} color="#2196f3" />
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text)' }}>Actividad Reciente</h2>
                </div>

                {actividades_recientes && actividades_recientes.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {actividades_recientes.slice(0, 5).map((act, index) => (
                            <div key={act.id} style={{
                                padding: '16px 0',
                                borderBottom: index < 4 ? '1px solid var(--border, rgba(0,0,0,0.05))' : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{act.descripcion}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {act.nombre} {act.apellido} • {new Date(act.fecha_creacion).toLocaleString()}
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'var(--bg)', borderRadius: '6px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                                    {act.accion}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No hay actividad reciente.</div>
                )}
            </div>

            {/* Custom inject CSS for stat cards hover effects within the component */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .stat-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); }
                .stat-blue .stat-icon-wrapper { background: rgba(33, 150, 243, 0.15); }
                .stat-cyan .stat-icon-wrapper { background: rgba(0, 188, 212, 0.15); }
                .stat-green .stat-icon-wrapper { background: rgba(76, 175, 80, 0.15); }
                .stat-orange .stat-icon-wrapper { background: rgba(255, 152, 0, 0.15); }
                [data-theme='dark'] .stat-card { box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
                [data-theme='dark'] .stat-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
            `}} />
        </div>
    );
};

export default AdminDashboard;
