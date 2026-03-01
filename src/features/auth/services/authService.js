import { AUTH_API_URL } from '../../../config/env';

/**
 * Registers a new user.
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} The JSON response from the backend
 */
export async function registerUser(userData) {
    try {
        const response = await fetch(`${AUTH_API_URL}/register.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Server Error ${response.status}: ${text}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error during registration:', error);
        throw error;
    }
}

/**
 * Logs in a user.
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} The JSON response from the backend
 */
export async function loginUser(email, password) {
    try {
        const response = await fetch(`${AUTH_API_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        // The backend might return non-200 or 200 with success: false. We parse it first.
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error during login:', error);
        return {
            success: false,
            message: 'No se pudo completar el inicio de sesión. Verifica tu conexión e inténtalo de nuevo.',
        };
    }
}

/**
 * Sends a request to reset password, which sends an email with a 4-digit code.
 */
export async function requestPasswordResetCode(email) {
    try {
        const response = await fetch(`${AUTH_API_URL}/email_service.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, type: 'password_recovery', userName: email.split('@')[0], code: Math.floor(1000 + Math.random() * 9000).toString() })
        });
        return await response.json();
    } catch (e) {
        return { success: false, message: 'No se pudo enviar el código.' };
    }
}

/**
 * Note: the backend handles code verification locally or via the change_password.php?action=verify_change_code
 * We'll use the proper change_password.php endpoint which uses real verification logic.
 */
export async function requestPasswordResetCodeReal(userId) {
    try {
        const response = await fetch(`${AUTH_API_URL}/change_password.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ action: 'request_change_code', user_id: userId })
        });
        return await response.json();
    } catch (e) {
        return { success: false, message: 'No se pudo enviar el código.' };
    }
}

export async function verifyPasswordResetCode(userId, code) {
    try {
        const response = await fetch(`${AUTH_API_URL}/change_password.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify_change_code', user_id: userId, verification_code: code })
        });
        return await response.json();
    } catch (e) {
        return { success: false, message: 'No se pudo verificar el código.' };
    }
}

export async function changePasswordWithCode(userId, newPassword, verificationCode) {
    try {
        const response = await fetch(`${AUTH_API_URL}/change_password.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'change_password_with_code', user_id: userId, new_password: newPassword, verification_code: verificationCode })
        });
        return await response.json();
    } catch (e) {
        return { success: false, message: 'No se pudo cambiar la contraseña.' };
    }
}

export async function checkUserExists(email) {
    try {
        const response = await fetch(`${AUTH_API_URL}/check_user.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        return data; // returns { exists: true/false, user_id: ... } from backend typically
    } catch (e) {
        return { exists: false };
    }
}

export async function getProfileByEmail(email) {
    try {
        const response = await fetch(`${AUTH_API_URL}/profile.php?email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();

        if (data && data.success && data.data && data.data.user) {
            return { success: true, user: data.data.user };
        } else if (data && data.success && data.user) {
            return { success: true, user: data.user };
        }
        return { success: false, message: 'Perfil no encontrado' };
    } catch (e) {
        return { success: false, message: 'Error obteniendo perfil' };
    }
}
