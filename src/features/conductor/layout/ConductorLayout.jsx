import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { FiHome, FiDollarSign, FiUser, FiBell, FiLifeBuoy, FiLogOut, FiX } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import DashboardHeader from '../../shared/components/DashboardHeader';
import '../../shared/DashboardLayout.css';

const ConductorLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const navItems = [
        { path: '/conductor', label: 'Dashboard', icon: <FiHome />, end: true },
        { path: '/conductor/earnings', label: 'Mis Ganancias', icon: <FiDollarSign /> },
        { path: '/conductor/notifications', label: 'Notificaciones', icon: <FiBell /> },
        { path: '/conductor/support', label: 'Soporte', icon: <FiLifeBuoy /> },
        { path: '/conductor/profile', label: 'Mi Perfil', icon: <FiUser /> },
    ];

    return (
        <div className="dashboard-layout">
            <div className={`dash-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
            <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="dash-sidebar-header">
                    <img src="/logo.png" alt="Viax" className="dash-sidebar-logo" />
                    <h2 className="dash-sidebar-title">Conductor</h2>
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
                    userName={user?.nombre || 'Conductor'}
                    roleLabel="CONDUCTOR"
                    roleClass="conductor"
                    onMenuClick={() => setSidebarOpen(true)}
                    avatarSrc={user?.foto_perfil}
                    avatarName={user?.nombre || 'Conductor'}
                    avatarColor="#ff9800"
                />
                <main className="dash-content"><Outlet /></main>
            </div>
        </div>
    );
};

export default ConductorLayout;
