import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiBriefcase, FiDollarSign, FiActivity, FiBell, FiLifeBuoy, FiLogOut, FiX, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import './AdminLayout.css';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isSupportUser = user?.tipo_usuario === 'soporte_tecnico';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminNavItems = [
        { path: '/admin', label: 'Dashboard', icon: <FiHome />, end: true },
        { path: '/admin/users', label: 'Usuarios', icon: <FiUsers /> },
        { path: '/admin/companies', label: 'Empresas', icon: <FiBriefcase /> },
        { path: '/admin/finances', label: 'Finanzas', icon: <FiDollarSign /> },
        { path: '/admin/company-payments', label: 'Pagos Empresas', icon: <FiCreditCard /> },
        { path: '/admin/audit', label: 'Auditoría', icon: <FiActivity /> },
        { path: '/admin/notifications', label: 'Notificaciones', icon: <FiBell /> },
        { path: '/admin/support', label: 'Soporte', icon: <FiLifeBuoy /> },
    ];

    const supportNavItems = [
        { path: '/soporte', label: 'Bandeja Soporte', icon: <FiLifeBuoy />, end: true },
        { path: '/soporte/notifications', label: 'Notificaciones', icon: <FiBell /> },
    ];

    const navItems = isSupportUser ? supportNavItems : adminNavItems;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`admin-sidebar-overlay ${isOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
            ></div>

            <aside className={`admin-sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Viax Logo" className="sidebar-logo" />
                    {isOpen && <h2 className="sidebar-title">{isSupportUser ? 'VIAX Soporte' : 'VIAX Admin'}</h2>}
                    <button className="sidebar-close-btn mobile-only" onClick={toggleSidebar}>
                        <FiX />
                    </button>
                </div>

                <div className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            title={!isOpen ? item.label : ''}
                            onClick={() => {
                                if (window.innerWidth <= 768) toggleSidebar();
                            }}
                        >
                            <span className="sidebar-icon">{item.icon}</span>
                            {isOpen && <span className="sidebar-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </div>

                <div className="sidebar-footer">
                    <button className="sidebar-link logout-btn" onClick={handleLogout} title={!isOpen ? 'Cerrar Sesión' : ''}>
                        <span className="sidebar-icon"><FiLogOut /></span>
                        {isOpen && <span className="sidebar-label">Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
