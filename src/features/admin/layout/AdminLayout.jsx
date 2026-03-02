import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './AdminLayout.css';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="admin-layout-container">
            {/* Background Effects */}
            <div className="admin-bg-blob blob-1"></div>
            <div className="admin-bg-blob blob-2"></div>

            <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className={`admin-main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
                <AdminHeader toggleSidebar={toggleSidebar} />
                <div className="admin-page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
