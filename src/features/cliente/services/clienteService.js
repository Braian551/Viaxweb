import { API_BASE_URL } from '../../../config/env';
import { requestJson } from '../../../config/httpClient';

export const getTripHistory = async (userId, { page = 1, perPage = 10 } = {}) => {
    const params = new URLSearchParams({ user_id: userId, page, per_page: perPage });
    return await requestJson(`${API_BASE_URL}/user/get_trip_history.php?${params}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const getPaymentSummary = async (userId) => {
    return await requestJson(`${API_BASE_URL}/user/get_payment_summary.php?user_id=${userId}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const getFavoriteDrivers = async (userId) => {
    return await requestJson(`${API_BASE_URL}/user/get_favorite_drivers.php?user_id=${userId}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};

export const getProfile = async (email) => {
    return await requestJson(`${API_BASE_URL}/auth/profile.php?email=${encodeURIComponent(email)}`, { headers: { Accept: 'application/json' } }, 'Error de conexión');
};
