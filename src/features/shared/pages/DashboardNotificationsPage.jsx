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
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { deleteNotification, getNotifications, getUnreadCount, markAsRead } from '../services/notificationService';
import { useSnackbar } from '../components/AppSnackbar';
import { resolveNotificationRedirectPath } from '../utils/notificationRedirect';
import './DashboardNotificationsPage.css';

const POLLING_MS = 30000;
const UNDO_MS = 4000;

const TRIP_TYPES = new Set(['trip_accepted', 'trip_cancelled', 'trip_completed', 'driver_arrived', 'driver_waiting']);
const PAYMENT_TYPES = new Set([
    'payment_received',
    'payment_pending',
    'admin_company_payment_info_updated',
    'empresa_payment_submitted',
    'empresa_payment_approved',
    'empresa_payment_rejected',
    'empresa_payment_confirmed',
    'invoice_generated',
]);
const DOCUMENT_TYPES = new Set([
    'document_approved',
    'document_rejected',
    'driver_document_update',
    'admin_company_documents_submitted',
]);
const CHAT_TYPES = new Set(['chat_message']);
const SYSTEM_TYPES = new Set(['system', 'admin_company_registration_pending']);

const FILTER_LABELS = {
    all: 'Todas',
    unread: 'No leídas',
    trips: 'Viajes',
    payments: 'Pagos',
    documents: 'Documentos',
    system: 'Sistema',
    chat: 'Chat',
    promo: 'Promos',
};

const ICON_BY_TYPE = {
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

const getVisibleFilters = (roleType) => {
    if (roleType === 'admin') return ['all', 'unread', 'documents', 'payments', 'system'];
    if (roleType === 'soporte_tecnico') return ['all', 'unread', 'documents', 'system', 'chat'];
    if (roleType === 'empresa') return ['all', 'unread', 'payments', 'documents'];
    if (roleType === 'conductor') return ['all', 'unread', 'trips', 'payments', 'documents'];
    return ['all', 'unread', 'trips', 'payments', 'documents', 'chat', 'promo'];
};

const getUserId = (user) => {
    if (!user) return null;
    return user.id || user.usuario_id || user.user_id || null;
};

const getRelativeTime = (dateString) => {
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

const DashboardNotificationsPage = ({ roleType = 'admin' }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const userId = useMemo(() => getUserId(user), [user]);
    const visibleFilters = useMemo(() => getVisibleFilters(roleType), [roleType]);

    const [selectedFilter, setSelectedFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [undoState, setUndoState] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const pendingSingleDeletesRef = useRef(new Map());
    const pendingDeleteAllRef = useRef(null);

    const filteredNotifications = useMemo(() => {
        if (selectedFilter === 'all') return notifications;
        if (selectedFilter === 'unread') return notifications.filter((item) => !item.leida);
        if (selectedFilter === 'trips') return notifications.filter((item) => TRIP_TYPES.has(item.tipo));
        if (selectedFilter === 'payments') return notifications.filter((item) => PAYMENT_TYPES.has(item.tipo));
        if (selectedFilter === 'documents') return notifications.filter((item) => DOCUMENT_TYPES.has(item.tipo));
        if (selectedFilter === 'system') return notifications.filter((item) => SYSTEM_TYPES.has(item.tipo));
        if (selectedFilter === 'chat') return notifications.filter((item) => CHAT_TYPES.has(item.tipo));
        if (selectedFilter === 'promo') return notifications.filter((item) => item.tipo === 'promo');
        return notifications;
    }, [notifications, selectedFilter]);

    const refreshUnreadCount = async () => {
        if (!userId) return;
        const count = await getUnreadCount({ userId });
        setUnreadCount(count);
    };

    const loadNotificationsPage = async ({ nextPage = 1, append = false }) => {
        if (!userId) return;
        const requestFilter = selectedFilter === 'unread' ? { soloNoLeidas: true } : {};

        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
        }

        const result = await getNotifications({
            userId,
            page: nextPage,
            limit: 20,
            ...requestFilter,
        });

        if (result.success) {
            const incoming = result.notificaciones || [];
            setNotifications((prev) => (append ? [...prev, ...incoming] : incoming));
            setUnreadCount(result.no_leidas || 0);
            setHasMore(!!result.pagination?.has_more);
            setPage(nextPage);
        }

        setIsLoading(false);
        setIsLoadingMore(false);
    };

    const handleMarkAsRead = async (notificationId) => {
        if (!userId) return;
        const result = await markAsRead({ userId, notificationId });
        if (!result.success) return;

        setNotifications((prev) => prev.map((item) => (
            item.id === notificationId ? { ...item, leida: true, leida_en: new Date().toISOString() } : item
        )));
        setUnreadCount(result.no_leidas ?? 0);
    };

    const handleNotificationClick = async (notification) => {
        if (!notification) return;

        if (!notification.leida) {
            await handleMarkAsRead(notification.id);
        }

        const targetPath = resolveNotificationRedirectPath({ notification, roleType });
        if (targetPath) {
            navigate(targetPath);
            return;
        }

        showSnackbar('Aún no es posible redireccionar esta notificación desde web.', { type: 'warning' });
    };

    const handleMarkAllAsRead = async () => {
        if (!userId || unreadCount === 0) return;
        setIsMarkingAll(true);
        const result = await markAsRead({ userId, markAll: true });
        if (result.success) {
            setNotifications((prev) => prev.map((item) => ({ ...item, leida: true, leida_en: new Date().toISOString() })));
            setUnreadCount(result.no_leidas ?? 0);
        }
        setIsMarkingAll(false);
    };

    const restorePendingSingles = () => {
        const pendingEntries = Array.from(pendingSingleDeletesRef.current.values())
            .sort((a, b) => a.originalIndex - b.originalIndex);

        if (pendingEntries.length === 0) return;

        setNotifications((prev) => {
            const restored = [...prev];
            pendingEntries.forEach((entry) => {
                const index = Math.max(0, Math.min(entry.originalIndex, restored.length));
                restored.splice(index, 0, entry.notification);
            });
            return restored;
        });

        const unreadToRestore = pendingEntries.reduce((acc, entry) => acc + (!entry.notification.leida ? 1 : 0), 0);
        if (unreadToRestore > 0) {
            setUnreadCount((prev) => prev + unreadToRestore);
        }

        pendingEntries.forEach((entry) => clearTimeout(entry.timer));
        pendingSingleDeletesRef.current.clear();
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

    const commitDeleteAll = async () => {
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
    };

    const handleStageDeleteAll = () => {
        if (!notifications.length || pendingDeleteAllRef.current) return;

        restorePendingSingles();

        const snapshot = {
            notificationsSnapshot: notifications,
            unreadCountSnapshot: unreadCount,
            timer: null,
        };

        snapshot.timer = setTimeout(() => {
            commitDeleteAll();
        }, UNDO_MS);

        pendingDeleteAllRef.current = snapshot;
        setNotifications([]);
        setUnreadCount(0);
        setUndoState({ type: 'all', label: 'Se eliminaron todas las notificaciones' });
    };

    const handleUndoDelete = () => {
        if (!undoState) return;

        if (undoState.type === 'single') {
            const pending = pendingSingleDeletesRef.current.get(undoState.notificationId);
            if (!pending) {
                setUndoState(null);
                return;
            }

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

        if (undoState.type === 'all') {
            const pendingAll = pendingDeleteAllRef.current;
            if (!pendingAll) {
                setUndoState(null);
                return;
            }

            clearTimeout(pendingAll.timer);
            pendingDeleteAllRef.current = null;
            setNotifications(pendingAll.notificationsSnapshot);
            setUnreadCount(pendingAll.unreadCountSnapshot);
        }

        setUndoState(null);
    };

    useEffect(() => {
        if (!userId) return undefined;
        loadNotificationsPage({ nextPage: 1, append: false });
        refreshUnreadCount();
        const timer = setInterval(refreshUnreadCount, POLLING_MS);
        return () => {
            clearInterval(timer);
            pendingSingleDeletesRef.current.forEach((entry) => clearTimeout(entry.timer));
            pendingSingleDeletesRef.current.clear();
            if (pendingDeleteAllRef.current) {
                clearTimeout(pendingDeleteAllRef.current.timer);
                pendingDeleteAllRef.current = null;
            }
        };
    }, [userId, selectedFilter]);

    return (
        <div className="dash-notif-page">
            <PageHeader
                title="Notificaciones"
                subtitle="Mantente al día con la actividad de tu cuenta"
                actions={(
                    <div className="dash-notif-header-actions">
                        <button
                            type="button"
                            className="dash-notif-mark-all"
                            onClick={handleMarkAllAsRead}
                            disabled={isMarkingAll || unreadCount === 0}
                        >
                            <FiCheck /> Marcar todas como leídas
                        </button>
                        <button
                            type="button"
                            className="dash-notif-delete-all"
                            onClick={handleStageDeleteAll}
                            disabled={notifications.length === 0}
                        >
                            <FiTrash2 /> Eliminar todas
                        </button>
                    </div>
                )}
            />

            <div className="dash-notif-filters glass-card">
                {visibleFilters.map((filter) => (
                    <button
                        key={filter}
                        type="button"
                        className={`dash-notif-filter-btn ${selectedFilter === filter ? 'active' : ''}`}
                        onClick={() => setSelectedFilter(filter)}
                    >
                        {FILTER_LABELS[filter] || filter}
                    </button>
                ))}
                <span className="dash-notif-unread-pill">{unreadCount} sin leer</span>
            </div>

            <div className="dash-notif-list glass-card">
                {isLoading && <p className="dash-notif-empty">Cargando notificaciones...</p>}

                {!isLoading && filteredNotifications.length === 0 && (
                    <p className="dash-notif-empty">No tienes notificaciones en esta categoría.</p>
                )}

                {!isLoading && filteredNotifications.map((notification) => {
                    const Icon = ICON_BY_TYPE[notification.tipo_icono] || FiBell;
                    return (
                        <button
                            key={notification.id}
                            type="button"
                            className={`dash-notif-item ${notification.leida ? 'read' : 'unread'}`}
                            onClick={() => handleMarkAsRead(notification.id)}
                        >
                            <span className="dash-notif-item__icon">
                                <Icon />
                            </span>
                            <span className="dash-notif-item__content">
                                <strong>{notification.titulo}</strong>
                                <span>{notification.mensaje}</span>
                                <small>{getRelativeTime(notification.created_at)}</small>
                            </span>
                            <span className="dash-notif-item__meta-actions">
                                {!notification.leida && <span className="dash-notif-item__dot" />}
                                <span
                                    role="button"
                                    tabIndex={0}
                                    className="dash-notif-item__delete"
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

                {!isLoading && hasMore && (
                    <div className="dash-notif-load-more-wrap">
                        <button
                            type="button"
                            className="dash-notif-load-more"
                            onClick={() => loadNotificationsPage({ nextPage: page + 1, append: true })}
                            disabled={isLoadingMore}
                        >
                            {isLoadingMore ? 'Cargando...' : 'Cargar más'}
                        </button>
                    </div>
                )}
            </div>

            {undoState && (
                <div className="dash-notif-undo-bar">
                    <span>{undoState.label}</span>
                    <button type="button" onClick={handleUndoDelete}>Deshacer</button>
                </div>
            )}
        </div>
    );
};

export default DashboardNotificationsPage;
