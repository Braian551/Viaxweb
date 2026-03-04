import { API_BASE_URL } from '../../../config/env';

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
    try {
        const query = toQueryString({
            usuario_id: userId,
            page,
            limit,
            solo_no_leidas: soloNoLeidas ? 'true' : undefined,
            tipo,
        });

        const response = await fetch(`${NOTIFICATIONS_API_URL}/get_notifications.php?${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }

        const data = await response.json();
        return {
            success: !!data?.success,
            notificaciones: data?.notificaciones || [],
            no_leidas: data?.no_leidas || 0,
            pagination: data?.pagination || null,
            error: data?.error,
        };
    } catch (error) {
        console.error('Error getNotifications:', error);
        return { success: false, error: 'Error de conexión al cargar notificaciones' };
    }
}

export async function getUnreadCount({ userId }) {
    try {
        const query = toQueryString({ usuario_id: userId });
        const response = await fetch(`${NOTIFICATIONS_API_URL}/get_unread_count.php?${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            return 0;
        }

        const data = await response.json();
        return data?.count || 0;
    } catch (error) {
        console.error('Error getUnreadCount:', error);
        return 0;
    }
}

export async function markAsRead({
    userId,
    notificationId,
    notificationIds,
    markAll = false,
}) {
    try {
        const body = {
            usuario_id: userId,
            ...(notificationId ? { notification_id: notificationId } : {}),
            ...(Array.isArray(notificationIds) && notificationIds.length
                ? { notification_ids: notificationIds }
                : {}),
            ...(markAll ? { mark_all: true } : {}),
        };

        const response = await fetch(`${NOTIFICATIONS_API_URL}/mark_as_read.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }

        const data = await response.json();
        return {
            success: !!data?.success,
            no_leidas: data?.no_leidas ?? 0,
            affected: data?.affected ?? 0,
            error: data?.error,
        };
    } catch (error) {
        console.error('Error markAsRead:', error);
        return { success: false, error: 'Error de conexión al actualizar notificaciones' };
    }
}
