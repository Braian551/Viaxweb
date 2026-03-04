import { API_BASE_URL } from '../../../config/env';
import { requestJson } from '../../../config/httpClient';

const NOTIFICATIONS_API_URL = `${API_BASE_URL}/notifications`;

const toQueryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === false) return;
        query.append(key, String(value));
    });
    return query.toString();
};

export async function getNotifications({
    userId,
    page = 1,
    limit = 20,
    soloNoLeidas = false,
    tipo,
}) {
    const query = toQueryString({
        usuario_id: userId,
        page,
        limit,
        solo_no_leidas: soloNoLeidas ? 'true' : undefined,
        tipo,
    });

    const data = await requestJson(
        `${NOTIFICATIONS_API_URL}/get_notifications.php?${query}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        },
        'Error de conexión al cargar notificaciones'
    );

    return {
        success: !!data?.success,
        notificaciones: data?.notificaciones || [],
        no_leidas: data?.no_leidas || 0,
        pagination: data?.pagination || null,
        error: data?.error || data?.message,
    };
}

export async function getUnreadCount({ userId }) {
    const query = toQueryString({ usuario_id: userId });
    const data = await requestJson(
        `${NOTIFICATIONS_API_URL}/get_unread_count.php?${query}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        },
        'Error de conexión al cargar no leídas'
    );
    return data?.count || 0;
}

export async function markAsRead({
    userId,
    notificationId,
    notificationIds,
    markAll = false,
}) {
    const body = {
        usuario_id: userId,
        ...(notificationId ? { notification_id: notificationId } : {}),
        ...(Array.isArray(notificationIds) && notificationIds.length
            ? { notification_ids: notificationIds }
            : {}),
        ...(markAll ? { mark_all: true } : {}),
    };

    const data = await requestJson(
        `${NOTIFICATIONS_API_URL}/mark_as_read.php`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        },
        'Error de conexión al actualizar notificaciones'
    );

    return {
        success: !!data?.success,
        no_leidas: data?.no_leidas ?? 0,
        affected: data?.affected ?? 0,
        error: data?.error || data?.message,
    };
}

export async function deleteNotification({
    userId,
    notificationId,
    notificationIds,
    deleteAll = false,
}) {
    const body = {
        usuario_id: userId,
        ...(notificationId ? { notification_id: notificationId } : {}),
        ...(Array.isArray(notificationIds) && notificationIds.length
            ? { notification_ids: notificationIds }
            : {}),
        ...(deleteAll ? { delete_all: true } : {}),
    };

    const data = await requestJson(
        `${NOTIFICATIONS_API_URL}/delete_notification.php`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        },
        'Error de conexión al eliminar notificaciones'
    );

    return {
        success: !!data?.success,
        no_leidas: data?.no_leidas ?? 0,
        affected: data?.affected ?? 0,
        error: data?.error || data?.message,
    };
}
