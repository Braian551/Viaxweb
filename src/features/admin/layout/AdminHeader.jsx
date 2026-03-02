import React from 'react';
import { FiMenu, FiBell, FiMoon, FiSun } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import './AdminLayout.css';

const AdminHeader = ({ toggleSidebar }) => {
    const { user } = useAuth();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('viax-theme', newTheme);
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <header className="admin-header glass-panel">
            <div className="header-left">
                <button className="icon-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                    <FiMenu />
                </button>
                <div className="header-greeting">
                    <span className="greeting-text">Hola, <strong>{user?.nombre || 'Administrador'}</strong></span>
                    <span className="role-badge">Admin</span>
                </div>
            </div>

            <div className="header-right">
                <button className="icon-btn theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                    {isDark ? <FiSun /> : <FiMoon />}
                </button>
                <button className="icon-btn notification-btn" aria-label="Notifications">
                    <FiBell />
                    <span className="notification-dot"></span>
                </button>

                <ProfileAvatar
                    src={user?.foto_perfil}
                    name={user?.nombre || 'Admin'}
                    size={44}
                    borderRadius={14}
                    bgColor="#2196f3"
                />
            </div>
        </header>
    );
};

export default AdminHeader;
