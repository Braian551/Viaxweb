import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiDollarSign,
    FiInfo,
    FiMapPin,
    FiMessageCircle,
    FiTag,
    FiTruck,
    FiXCircle,
} from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
} from '../services/notificationService';
import './NotificationBell.css';

const POLLING_MS = 30000;

const getUserId = (user) => {
    if (!user) return null;
    return user.id || user.usuario_id || user.user_id || null;
};

const iconByType = {
    directions_car: FiTruck,
    cancel: FiXCircle,
    check_circle: FiCheckCircle,
    near_me: FiMapPin,
    access_time: FiClock,
    payment: FiDollarSign,
    pending: FiClock,
    local_offer: FiTag,
    info: FiInfo,
    chat: FiMessageCircle,
};

const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const createdAt = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Hace ${days} días`;
    return createdAt.toLocaleDateString('es-CO');
};

const NotificationBell = ({ buttonClassName }) => {
    const { user } = useAuth();
    const userId = useMemo(() => getUserId(user), [user]);

    const containerRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loadingList, setLoadingList] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshUnreadCount = async () => {
        if (!userId) return;
        const count = await getUnreadCount({ userId });
        setUnreadCount(count);
    };

    const loadNotifications = async () => {
        if (!userId) return;
        setLoadingList(true);
        const result = await getNotifications({ userId, page: 1, limit: 20 });
        if (result.success) {
            setNotifications(result.notificaciones || []);
            setUnreadCount(result.no_leidas || 0);
        }
        setLoadingList(false);
    };

    const handleMarkAllRead = async () => {
        if (!userId || unreadCount === 0) return;
        setMarkingAll(true);
        const result = await markAsRead({ userId, markAll: true });
        if (result.success) {
            setNotifications((prev) => prev.map((item) => ({ ...item, leida: true })));
            setUnreadCount(result.no_leidas || 0);
        }
        setMarkingAll(false);
    };

    const handleMarkOneRead = async (notification) => {
        if (!userId || !notification || notification.leida) return;
        const result = await markAsRead({ userId, notificationId: notification.id });
        if (result.success) {
            setNotifications((prev) =>
                prev.map((item) => (item.id === notification.id ? { ...item, leida: true } : item))
            );
            setUnreadCount(result.no_leidas ?? 0);
        }
    };

    useEffect(() => {
        if (!userId) {
            setUnreadCount(0);
            setNotifications([]);
            return undefined;
        }

        refreshUnreadCount();
        const timer = setInterval(refreshUnreadCount, POLLING_MS);
        return () => clearInterval(timer);
    }, [userId]);

    useEffect(() => {
        if (!isOpen) return;
        loadNotifications();
    }, [isOpen]);

    useEffect(() => {
        const onClickOutside = (event) => {
            if (!containerRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    return (
        <div className="notif-wrapper" ref={containerRef}>
            <button
                className={buttonClassName}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Notificaciones"
                type="button"
            >
                <FiBell />
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notif-panel">
                    <div className="notif-panel__header">
                        <div>
                            <h4>Notificaciones</h4>
                            <span>{unreadCount} sin leer</span>
                        </div>
                        <button
                            type="button"
                            className="notif-panel__mark-all"
                            onClick={handleMarkAllRead}
                            disabled={markingAll || unreadCount === 0}
                        >
                            <FiCheck /> Marcar todas
                        </button>
                    </div>

                    <div className="notif-panel__list">
                        {loadingList && <p className="notif-panel__empty">Cargando...</p>}

                        {!loadingList && notifications.length === 0 && (
                            <p className="notif-panel__empty">No tienes notificaciones</p>
                        )}

                        {!loadingList && notifications.map((notification) => {
                            const Icon = iconByType[notification.tipo_icono] || FiBell;
                            return (
                                <button
                                    type="button"
                                    key={notification.id}
                                    className={`notif-item ${notification.leida ? 'read' : 'unread'}`}
                                    onClick={() => handleMarkOneRead(notification)}
                                >
                                    <span className="notif-item__icon">
                                        <Icon />
                                    </span>
                                    <span className="notif-item__content">
                                        <span className="notif-item__title">{notification.titulo}</span>
                                        <span className="notif-item__message">{notification.mensaje}</span>
                                        <span className="notif-item__time">{formatRelativeTime(notification.created_at)}</span>
                                    </span>
                                    {!notification.leida && <span className="notif-item__dot" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
