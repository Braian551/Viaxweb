import React from 'react';
import { FiMenu, FiMoon, FiSun } from 'react-icons/fi';
import ProfileAvatar from './ProfileAvatar';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';

const DashboardHeader = ({
    variant = 'default',
    userName,
    roleLabel,
    roleClass,
    onMenuClick,
    avatarSrc,
    avatarName,
    avatarColor,
}) => {
    const { isDark, toggleTheme } = useTheme();

    if (variant === 'admin') {
        return (
            <header className="admin-header glass-panel">
                <div className="header-left">
                    <button className="icon-btn" onClick={onMenuClick} aria-label="Toggle Sidebar">
                        <FiMenu />
                    </button>
                    <div className="header-greeting">
                        <span className="greeting-text">Hola, <strong>{userName}</strong></span>
                        <span className="role-badge">{roleLabel}</span>
                    </div>
                </div>

                <div className="header-right">
                    <button className="icon-btn theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                        {isDark ? <FiSun /> : <FiMoon />}
                    </button>
                    <NotificationBell buttonClassName="icon-btn notification-btn" />

                    <ProfileAvatar
                        src={avatarSrc}
                        name={avatarName}
                        size={44}
                        borderRadius={14}
                        bgColor={avatarColor}
                    />
                </div>
            </header>
        );
    }

    return (
        <header className="dash-header">
            <div className="dash-header-left">
                <button className="dash-menu-btn" onClick={onMenuClick} aria-label="Open menu">
                    <FiMenu />
                </button>
                <div>
                    <div className="dash-header-greeting">Hola, <span>{userName}</span></div>
                    <span className={`dash-role-badge ${roleClass}`}>{roleLabel}</span>
                </div>
            </div>
            <div className="dash-header-right">
                <button className="dash-header-btn" onClick={toggleTheme} aria-label="Toggle theme">
                    {isDark ? <FiSun /> : <FiMoon />}
                </button>
                <NotificationBell buttonClassName="dash-header-btn" />
                <ProfileAvatar
                    src={avatarSrc}
                    name={avatarName}
                    size={44}
                    borderRadius={14}
                    bgColor={avatarColor}
                />
            </div>
        </header>
    );
};

export default DashboardHeader;
