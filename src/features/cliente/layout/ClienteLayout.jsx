import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { FiHome, FiUser, FiLogOut, FiMenu, FiX, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import '../../../features/shared/DashboardLayout.css';

const ClienteLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); };

    const navItems = [
        { path: '/cliente', label: 'Mi Panel', icon: <FiHome />, end: true },
        { path: '/cliente/profile', label: 'Mi Perfil', icon: <FiUser /> },
    ];

    const toggleTheme = () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('viax-theme', next);
    };

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    return (
        <div className="dashboard-layout">
            <div className={`dash-sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

            <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="dash-sidebar-header">
                    <img src="/logo.png" alt="Viax" className="dash-sidebar-logo" />
                    <h2 className="dash-sidebar-title">Mi Cuenta</h2>
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
                <header className="dash-header">
                    <div className="dash-header-left">
                        <button className="dash-menu-btn" onClick={() => setSidebarOpen(true)}><FiMenu /></button>
                        <div>
                            <div className="dash-header-greeting">Hola, <span>{user?.nombre || 'Cliente'}</span></div>
                            <span className="dash-role-badge cliente">CLIENTE</span>
                        </div>
                    </div>
                    <div className="dash-header-right">
                        <button className="dash-header-btn" onClick={toggleTheme}>{isDark ? <FiSun /> : <FiMoon />}</button>
                        <div className="dash-avatar">{user?.nombre?.charAt(0)?.toUpperCase() || 'C'}</div>
                    </div>
                </header>
                <main className="dash-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ClienteLayout;
