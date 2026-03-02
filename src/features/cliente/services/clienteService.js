import { API_BASE_URL } from '../../../config/env';

export const getTripHistory = async (userId, { page = 1, perPage = 10 } = {}) => {
    try {
        const params = new URLSearchParams({ user_id: userId, page, per_page: perPage });
        const res = await fetch(`${API_BASE_URL}/user/get_trip_history.php?${params}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const getPaymentSummary = async (userId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/user/get_payment_summary.php?user_id=${userId}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const getFavoriteDrivers = async (userId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/user/get_favorite_drivers.php?user_id=${userId}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};

export const getProfile = async (email) => {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/profile.php?email=${encodeURIComponent(email)}`, { headers: { Accept: 'application/json' } });
        return await res.json();
    } catch (e) { return { success: false, message: 'Error de conexión' }; }
};
