import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    FiBell,
    FiCheck,
    FiCheckCircle,
    FiClock,
    FiTrash2,
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
    deleteNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
} from '../services/notificationService';
import './NotificationBell.css';

const POLLING_MS = 30000;
const UNDO_MS = 4000;

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
    const [undoState, setUndoState] = useState(null);

    const pendingSingleDeletesRef = useRef(new Map());
    const pendingDeleteAllRef = useRef(null);

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

    const commitSingleDelete = async (notificationId) => {
        const pending = pendingSingleDeletesRef.current.get(notificationId);
        if (!pending || !userId) return;

        pendingSingleDeletesRef.current.delete(notificationId);
        const result = await deleteNotification({ userId, notificationId });

        if (!result.success) {
            setNotifications((prev) => {
                const restored = [...prev];
                const index = Math.max(0, Math.min(pending.originalIndex, restored.length));
                restored.splice(index, 0, pending.notification);
                return restored;
            });
            if (!pending.notification.leida) {
                setUnreadCount((prev) => prev + 1);
            }
            return;
        }

        setUnreadCount(result.no_leidas ?? 0);
    };

    const handleStageDeleteOne = (notification) => {
        if (!notification || pendingDeleteAllRef.current) return;
        if (pendingSingleDeletesRef.current.has(notification.id)) return;

        const index = notifications.findIndex((item) => item.id === notification.id);
        if (index === -1) return;

        const timer = setTimeout(() => {
            commitSingleDelete(notification.id);
        }, UNDO_MS);

        pendingSingleDeletesRef.current.set(notification.id, {
            notification,
            originalIndex: index,
            timer,
        });

        setNotifications((prev) => prev.filter((item) => item.id !== notification.id));
        if (!notification.leida) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        setUndoState({ type: 'single', notificationId: notification.id, label: 'Notificación eliminada' });
    };

    const handleStageDeleteAll = () => {
        if (!notifications.length || pendingDeleteAllRef.current) return;

        pendingSingleDeletesRef.current.forEach((entry) => clearTimeout(entry.timer));
        pendingSingleDeletesRef.current.clear();

        const snapshot = {
            notificationsSnapshot: notifications,
            unreadCountSnapshot: unreadCount,
            timer: null,
        };

        snapshot.timer = setTimeout(async () => {
            const pending = pendingDeleteAllRef.current;
            if (!pending || !userId) return;

            pendingDeleteAllRef.current = null;
            const result = await deleteNotification({ userId, deleteAll: true });
            if (!result.success) {
                setNotifications(pending.notificationsSnapshot);
                setUnreadCount(pending.unreadCountSnapshot);
                return;
            }
            setUnreadCount(0);
        }, UNDO_MS);

        pendingDeleteAllRef.current = snapshot;
        setNotifications([]);
        setUnreadCount(0);
        setUndoState({ type: 'all', label: 'Se eliminaron todas' });
    };

    const handleUndoDelete = () => {
        if (!undoState) return;

        if (undoState.type === 'single') {
            const pending = pendingSingleDeletesRef.current.get(undoState.notificationId);
            if (pending) {
                clearTimeout(pending.timer);
                pendingSingleDeletesRef.current.delete(undoState.notificationId);
                setNotifications((prev) => {
                    const restored = [...prev];
                    const index = Math.max(0, Math.min(pending.originalIndex, restored.length));
                    restored.splice(index, 0, pending.notification);
                    return restored;
                });
                if (!pending.notification.leida) {
                    setUnreadCount((prev) => prev + 1);
                }
            }
        }

        if (undoState.type === 'all') {
            const pendingAll = pendingDeleteAllRef.current;
            if (pendingAll) {
                clearTimeout(pendingAll.timer);
                pendingDeleteAllRef.current = null;
                setNotifications(pendingAll.notificationsSnapshot);
                setUnreadCount(pendingAll.unreadCountSnapshot);
            }
        }

        setUndoState(null);
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
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
            pendingSingleDeletesRef.current.forEach((entry) => clearTimeout(entry.timer));
            pendingSingleDeletesRef.current.clear();
            if (pendingDeleteAllRef.current) {
                clearTimeout(pendingDeleteAllRef.current.timer);
                pendingDeleteAllRef.current = null;
            }
        };
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
                        <button
                            type="button"
                            className="notif-panel__delete-all"
                            onClick={handleStageDeleteAll}
                            disabled={notifications.length === 0}
                        >
                            <FiTrash2 /> Eliminar todas
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
                                    <span className="notif-item__meta-actions">
                                        {!notification.leida && <span className="notif-item__dot" />}
                                        <span
                                            role="button"
                                            tabIndex={0}
                                            className="notif-item__delete"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleStageDeleteOne(notification);
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    handleStageDeleteOne(notification);
                                                }
                                            }}
                                        >
                                            <FiTrash2 />
                                        </span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {undoState && (
                        <div className="notif-undo-bar">
                            <span>{undoState.label}</span>
                            <button type="button" onClick={handleUndoDelete}>Deshacer</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
