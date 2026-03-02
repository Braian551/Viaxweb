import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiBriefcase, FiDollarSign, FiActivity, FiLogOut, FiX } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import './AdminLayout.css';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: <FiHome />, end: true },
        { path: '/admin/users', label: 'Usuarios', icon: <FiUsers /> },
        { path: '/admin/companies', label: 'Empresas', icon: <FiBriefcase /> },
        { path: '/admin/finances', label: 'Finanzas', icon: <FiDollarSign /> },
        { path: '/admin/audit', label: 'Auditoría', icon: <FiActivity /> },
    ];

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
                    {isOpen && <h2 className="sidebar-title">VIAX Admin</h2>}
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
