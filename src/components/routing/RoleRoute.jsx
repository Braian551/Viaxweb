import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';

/**
 * Componente para proteger rutas basado en el rol del usuario actual.
 * @param {Array<string>} allowedRoles - Arreglo de roles permitidos (ej. ['admin', 'empresa']).
 * @param {string} redirectPath - Ruta a redirigir si no tiene acceso (por defecto a '/').
 */
const RoleRoute = ({ allowedRoles, redirectPath = '/' }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Cargando...</div>;
    }

    if (!user) {
        // Redirigir al login si no está autenticado
        return <Navigate to="/login" replace />;
    }

    const { tipo_usuario } = user;

    // Normalizar el rol admin (en BD es administrador, a veces se pasa como admin en allowedRoles)
    const normalizedUserRole = tipo_usuario === 'administrador' ? 'admin' : tipo_usuario;
    const normalizedAllowedRoles = allowedRoles ? allowedRoles.map(r => r === 'administrador' ? 'admin' : r) : [];

    // Verificar si el rol del usuario está en los roles permitidos
    if (allowedRoles && !normalizedAllowedRoles.includes(normalizedUserRole)) {
        // Si no tiene permiso, lo enviamos al home o donde corresponda
        return <Navigate to={redirectPath} replace />;
    }

    // Si tiene acceso, renderizamos el outlet o los children
    return <Outlet />;
};

export default RoleRoute;
