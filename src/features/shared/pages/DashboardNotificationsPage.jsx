import React, { useEffect, useMemo, useState } from 'react';
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
import PageHeader from '../components/PageHeader';
import { getNotifications, getUnreadCount, markAsRead } from '../services/notificationService';
import './DashboardNotificationsPage.css';

const POLLING_MS = 30000;

const TRIP_TYPES = new Set(['trip_accepted', 'trip_cancelled', 'trip_completed', 'driver_arrived', 'driver_waiting']);
const PAYMENT_TYPES = new Set(['payment_received', 'payment_pending']);
const DOCUMENT_TYPES = new Set(['document_approved', 'document_rejected', 'driver_document_update']);
const CHAT_TYPES = new Set(['chat_message']);

const FILTER_LABELS = {
    all: 'Todas',
    unread: 'No leídas',
    trips: 'Viajes',
    payments: 'Pagos',
    documents: 'Documentos',
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
    const userId = useMemo(() => getUserId(user), [user]);
    const visibleFilters = useMemo(() => getVisibleFilters(roleType), [roleType]);

    const [selectedFilter, setSelectedFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const filteredNotifications = useMemo(() => {
        if (selectedFilter === 'all') return notifications;
        if (selectedFilter === 'unread') return notifications.filter((item) => !item.leida);
        if (selectedFilter === 'trips') return notifications.filter((item) => TRIP_TYPES.has(item.tipo));
        if (selectedFilter === 'payments') return notifications.filter((item) => PAYMENT_TYPES.has(item.tipo));
        if (selectedFilter === 'documents') return notifications.filter((item) => DOCUMENT_TYPES.has(item.tipo));
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

    useEffect(() => {
        if (!userId) return undefined;
        loadNotificationsPage({ nextPage: 1, append: false });
        refreshUnreadCount();
        const timer = setInterval(refreshUnreadCount, POLLING_MS);
        return () => clearInterval(timer);
    }, [userId, selectedFilter]);

    return (
        <div className="dash-notif-page">
            <PageHeader
                title="Notificaciones"
                subtitle="Mantente al día con la actividad de tu cuenta"
                actions={(
                    <button
                        type="button"
                        className="dash-notif-mark-all"
                        onClick={handleMarkAllAsRead}
                        disabled={isMarkingAll || unreadCount === 0}
                    >
                        <FiCheck /> Marcar todas como leídas
                    </button>
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
                            {!notification.leida && <span className="dash-notif-item__dot" />}
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
        </div>
    );
};

export default DashboardNotificationsPage;
