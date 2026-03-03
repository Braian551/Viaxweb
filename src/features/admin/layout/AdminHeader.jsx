import React from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import DashboardHeader from '../../shared/components/DashboardHeader';

const AdminHeader = ({ toggleSidebar }) => {
    const { user } = useAuth();

    return (
        <DashboardHeader
            variant="admin"
            userName={user?.nombre || 'Administrador'}
            roleLabel="ADMIN"
            onMenuClick={toggleSidebar}
            avatarSrc={user?.foto_perfil}
            avatarName={user?.nombre || 'Admin'}
            avatarColor="#2196f3"
            showNotifications
        />
    );
};

export default AdminHeader;
