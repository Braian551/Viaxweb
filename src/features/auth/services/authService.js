import { AUTH_API_URL } from '../../../config/env';
import { requestJson } from '../../../config/httpClient';

/**
 * Registers a new user.
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} The JSON response from the backend
 */
export async function registerUser(userData) {
    return await requestJson(
        `${AUTH_API_URL}/register.php`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(userData),
        },
        'No se pudo completar el registro. Verifica tu conexión e inténtalo de nuevo.'
    );
}

/**
 * Logs in a user.
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} The JSON response from the backend
 */
export async function loginUser(email, password) {
    const data = await requestJson(
        `${AUTH_API_URL}/login.php`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        },
        'No se pudo completar el inicio de sesión. Verifica tu conexión e inténtalo de nuevo.'
    );

    if (!data?.success) {
        return {
            success: false,
            message: data?.message || 'No se pudo completar el inicio de sesión. Verifica tu conexión e inténtalo de nuevo.',
        };
    }

    return data;
}

function normalizeBackendMessage(message, fallback) {
    if (!message) return fallback;
    if (typeof message !== 'string') return fallback;

    const trimmed = message.trim();
    if (!(trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        return trimmed;
    }

    try {
        const parsed = JSON.parse(trimmed);
        return parsed?.message || fallback;
    } catch {
        return trimmed;
    }
}

export async function loginWithGoogleToken({ idToken = null, accessToken = null } = {}) {
    const data = await requestJson(
        `${AUTH_API_URL}/google/callback.php`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ id_token: idToken, access_token: accessToken }),
        },
        'No se pudo completar el inicio con Google. Verifica tu conexión e inténtalo de nuevo.'
    );

    if (!data?.success) {
        return {
            success: false,
            message: normalizeBackendMessage(data?.message, 'No se pudo completar el inicio con Google.'),
        };
    }

    return data;
}

export async function updateGoogleUserPhone({ userId, phone }) {
    const data = await requestJson(
        `${AUTH_API_URL}/update_phone.php`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                phone,
            }),
        },
        'No pudimos actualizar tu teléfono. Intenta nuevamente.'
    );

    if (!data?.success) {
        return {
            success: false,
            message: normalizeBackendMessage(data?.message, 'No pudimos actualizar tu teléfono. Intenta nuevamente.'),
        };
    }

    const userData = data?.data?.user || data?.user || null;
    return {
        success: true,
        message: data?.message || 'Teléfono actualizado correctamente.',
        user: userData,
    };
}

/**
 * Sends a request to reset password, which sends an email with a 4-digit code.
 */
export async function requestPasswordResetCode(email) {
    return await requestJson(
        `${AUTH_API_URL}/email_service.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, type: 'password_recovery', userName: email.split('@')[0], code: Math.floor(1000 + Math.random() * 9000).toString() })
        },
        'No se pudo enviar el código.'
    );
}

/**
 * Sends a verification code for new user registration.
 */
export async function sendVerificationCode(email, code, userName) {
    return await requestJson(
        `${AUTH_API_URL}/email_service.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, type: 'verification', userName, code })
        },
        'No se pudo enviar el código de verificación.'
    );
}

/**
 * Note: the backend handles code verification locally or via the change_password.php?action=verify_change_code
 * We'll use the proper change_password.php endpoint which uses real verification logic.
 */
export async function requestPasswordResetCodeReal(userId) {
    return await requestJson(
        `${AUTH_API_URL}/change_password.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ action: 'request_change_code', user_id: userId })
        },
        'No se pudo enviar el código.'
    );
}

export async function verifyPasswordResetCode(userId, code) {
    return await requestJson(
        `${AUTH_API_URL}/change_password.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify_change_code', user_id: userId, verification_code: code })
        },
        'No se pudo verificar el código.'
    );
}

export async function changePasswordWithCode(userId, newPassword, verificationCode) {
    return await requestJson(
        `${AUTH_API_URL}/change_password.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'change_password_with_code', user_id: userId, new_password: newPassword, verification_code: verificationCode })
        },
        'No se pudo cambiar la contraseña.'
    );
}

export async function checkUserExists(email) {
    const data = await requestJson(
        `${AUTH_API_URL}/check_user.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        },
        'No se pudo verificar el usuario.'
    );

    return data?.success === false ? { exists: false } : data;
}

export async function getProfileByEmail(email) {
    const data = await requestJson(
        `${AUTH_API_URL}/profile.php?email=${encodeURIComponent(email)}`,
        {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        },
        'Error obteniendo perfil'
    );

    if (data && data.success && data.data && data.data.user) {
        return { success: true, user: data.data.user };
    }
    if (data && data.success && data.user) {
        return { success: true, user: data.user };
    }

    return { success: false, message: data?.message || 'Perfil no encontrado' };
}
