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
