import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { FiHome, FiUsers, FiDollarSign, FiSettings, FiBell, FiLogOut, FiX } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaProfile } from '../services/empresaService';
import { getR2ImageUrl } from '../../../utils/r2Images';
import DashboardHeader from '../../shared/components/DashboardHeader';
import '../../shared/DashboardLayout.css';

const EmpresaLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [companyBrand, setCompanyBrand] = useState({ name: 'Empresa', logo: '/logo.png' });

    const handleLogout = () => { logout(); navigate('/login'); };

    useEffect(() => {
        let mounted = true;

        const loadCompanyProfile = async () => {
            const empresaId = user?.empresa_id || user?.id;
            if (!empresaId) return;

            const res = await getEmpresaProfile(empresaId);
            const profile = res?.data?.empresa || res?.data || res?.empresa || res || {};

            if (!mounted) return;

            const resolvedName =
                profile?.nombre_empresa ||
                profile?.nombre ||
                user?.empresa_nombre ||
                user?.nombre_empresa ||
                user?.nombre ||
                'Empresa';

            const rawLogo =
                profile?.logo_url ||
                user?.empresa_logo ||
                user?.logo_url ||
                user?.foto_perfil ||
                '';

            setCompanyBrand({
                name: resolvedName,
                logo: rawLogo ? getR2ImageUrl(rawLogo) : '/logo.png',
            });
        };

        loadCompanyProfile();

        return () => {
            mounted = false;
        };
    }, [user]);

    const navItems = [
        { path: '/empresa', label: 'Dashboard', icon: <FiHome />, end: true },
        { path: '/empresa/conductors', label: 'Conductores', icon: <FiUsers /> },
        { path: '/empresa/finances', label: 'Finanzas', icon: <FiDollarSign /> },
        { path: '/empresa/notifications', label: 'Notificaciones', icon: <FiBell /> },
        { path: '/empresa/settings', label: 'Configuración', icon: <FiSettings /> },
    ];

    return (
        <div className="dashboard-layout">
            <div className={`dash-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="dash-sidebar-header">
                    <img
                        src={companyBrand.logo}
                        alt={companyBrand.name}
                        className="dash-sidebar-logo"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                    />
                    <h2 className="dash-sidebar-title" title={companyBrand.name}>{companyBrand.name}</h2>
                    <button className="dash-menu-btn" onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto' }}><FiX /></button>
                </div>
                <nav className="dash-sidebar-nav">
                    {navItems.map(item => (
                        <NavLink key={item.path} to={item.path} end={item.end}
                            className={({ isActive }) => `dash-sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}>
                            <span className="dash-sidebar-icon">{item.icon}</span>
                            <span className="dash-sidebar-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="dash-sidebar-footer">
                    <button className="dash-logout-btn" onClick={handleLogout}>
                        <span className="dash-sidebar-icon"><FiLogOut /></span>
                        <span className="dash-sidebar-label">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            <div className="dash-main">
                <DashboardHeader
                    userName={user?.nombre || 'Empresa'}
                    roleLabel="EMPRESA"
                    roleClass="empresa"
                    onMenuClick={() => setSidebarOpen(true)}
                    avatarSrc={companyBrand.logo}
                    avatarName={companyBrand.name || user?.nombre || 'Empresa'}
                    avatarColor="#9c27b0"
                />
                <main className="dash-content"><Outlet /></main>
            </div>
        </div>
    );
};

export default EmpresaLayout;
