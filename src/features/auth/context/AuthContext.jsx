import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, hasFirebaseConfig } from '../../../config/firebase';
import { AUTH_API_URL } from '../../../config/env';
import { loginUser, loginWithGoogleToken, registerUser, requestWebSession, updateGoogleUserPhone } from '../services/authService';

import { SESSION_EXPIRED_EVENT } from '../../../config/httpClient';

const AuthContext = createContext(null);

let googleScriptPromise = null;
let googleClientIdPromise = null;

const loadGoogleIdentityScript = () => {
    if (window.google?.accounts?.oauth2) {
        return Promise.resolve();
    }

    if (googleScriptPromise) {
        return googleScriptPromise;
    }

    googleScriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-viax-google-gsi="true"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google Identity Services.')), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.viaxGoogleGsi = 'true';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services.'));
        document.head.appendChild(script);
    });

    return googleScriptPromise;
};

const getGoogleWebClientId = async () => {
    const response = await fetch(`${AUTH_API_URL}/google/client_config.php`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
        throw new Error('No se pudo obtener configuración de Google.');
    }

    const data = await response.json();
    const clientId = data?.config?.web_client_id;

    if (!clientId) {
        throw new Error('Google no está configurado en el backend.');
    }

    return clientId;
};

const preloadGoogleIdentity = () => {
    if (!googleClientIdPromise) {
        googleClientIdPromise = Promise.all([
            loadGoogleIdentityScript(),
            getGoogleWebClientId(),
        ]).then(([, clientId]) => clientId);
    }

    return googleClientIdPromise;
};

const requestGoogleAccessToken = (clientId) => new Promise((resolve, reject) => {
    const oauth2 = window.google?.accounts?.oauth2;

    if (!oauth2) {
        reject(new Error('Google Identity Services no disponible.'));
        return;
    }

    const tokenClient = oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: (tokenResponse) => {
            if (!tokenResponse) {
                reject(new Error('No recibimos respuesta de Google.'));
                return;
            }

            if (tokenResponse.error) {
                reject(new Error(tokenResponse.error));
                return;
            }

            if (!tokenResponse.access_token) {
                reject(new Error('No se recibió access token de Google.'));
                return;
            }

            resolve(tokenResponse.access_token);
        },
        error_callback: (error) => {
            const type = error?.type || 'popup_failed';
            reject(new Error(type));
        },
    });

    tokenClient.requestAccessToken({ prompt: 'select_account' });
});

const shouldFallbackToGis = (error) => {
    const code = (error?.code || '').toString().toLowerCase();
    const message = (error?.message || '').toString().toLowerCase();
    return (
        code.includes('unauthorized-domain') ||
        message.includes('domain is not authorized') ||
        message.includes('oauth operations') ||
        message.includes('auth domain')
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const sessionVersion = useRef(0);

    useEffect(() => {
        let mounted = true;
        const version = sessionVersion.current;
        const expire = () => {
            sessionVersion.current += 1;
            setUser(null);
        };
        window.addEventListener(SESSION_EXPIRED_EVENT, expire);
        // Remove the profile cached by previous builds without trusting its contents.
        try { localStorage.removeItem('viax_user'); } catch { /* Storage may be blocked. */ }
        requestWebSession().then((response) => {
            if (!mounted) return;
            if (sessionVersion.current === version) setUser(response.data?.user ?? null);
            setLoading(false);
        });
        return () => {
            mounted = false;
            window.removeEventListener(SESSION_EXPIRED_EVENT, expire);
        };
    }, []);

    const userId = user?.id;
    useEffect(() => {
        if (!userId) return;
        let lastRenewal = Date.now();
        let pending = false;
        let mounted = true;
        const renew = async () => {
            if (pending || Date.now() - lastRenewal < 5 * 60 * 1000) return;
            pending = true;
            const version = sessionVersion.current;
            const response = await requestWebSession('POST');
            pending = false;
            if (!mounted || sessionVersion.current !== version) return;
            if (response.success) {
                lastRenewal = Date.now();
                setUser(response.data.user);
            } else if (response.status === 401) {
                setUser(null);
            } else {
                // Retry during activity without sending a request on every event.
                lastRenewal = Date.now() - 4 * 60 * 1000;
            }
        };
        window.addEventListener('pointerdown', renew);
        window.addEventListener('keydown', renew);
        window.addEventListener('focus', renew);
        return () => {
            mounted = false;
            window.removeEventListener('pointerdown', renew);
            window.removeEventListener('keydown', renew);
            window.removeEventListener('focus', renew);
        };
    }, [userId]);

    // Precarga GIS y client_id para mantener el click gesture en el login de Google.
    useEffect(() => {
        preloadGoogleIdentity().catch(() => {
            // No bloquea la sesión; se reintenta durante el click de login.
        });
    }, []);

    const login = async (email, password) => {
        const version = ++sessionVersion.current;
        const response = await loginUser(email, password);
        if (version === sessionVersion.current && response.success) setUser(response.data.user);
        return response;
    };

    const register = registerUser;

    const loginWithGoogle = async () => {
        try {
            let response;

            // Flujo primario: Google Identity Services directo (evita dependencia de dominio autorizado de Firebase).
            try {
                const clientId = await preloadGoogleIdentity();
                const accessToken = await requestGoogleAccessToken(clientId);
                response = await loginWithGoogleToken({
                    idToken: null,
                    accessToken,
                });
            } catch (gisError) {
                // Fallback controlado a Firebase solo si está configurado.
                if (!(hasFirebaseConfig && auth && googleProvider)) {
                    throw gisError;
                }

                const popupResult = await signInWithPopup(auth, googleProvider);
                const googleCredential = GoogleAuthProvider.credentialFromResult(popupResult);
                response = await loginWithGoogleToken({
                    idToken: googleCredential?.idToken || null,
                    accessToken: googleCredential?.accessToken || null,
                });
            }

            if (response.success && response.data?.user) {
                const session = await requestWebSession();
                if (!session.success) return session;
                setUser(session.data.user);
                return session;
            }

            return response;
        } catch (error) {
            const firebaseCode = error?.code;
            const fallbackMessage = error?.message || '';
            const firebaseMessage =
                firebaseCode === 'auth/popup-closed-by-user'
                    ? 'Cancelaste el inicio de sesión con Google.'
                    : firebaseCode === 'auth/popup-blocked'
                        ? 'El navegador bloqueó la ventana emergente de Google. Permite popups e inténtalo de nuevo.'
                    : shouldFallbackToGis(error)
                        ? 'Google Sign-In requiere autorizar el dominio en Firebase. Mientras tanto usamos GIS directo; recarga e inténtalo de nuevo.'
                        : fallbackMessage === 'popup_closed' || fallbackMessage === 'access_denied'
                            ? 'Cancelaste el inicio de sesión con Google.'
                            : fallbackMessage === 'popup_failed'
                                ? 'El navegador bloqueó la ventana emergente de Google. Permite popups e inténtalo de nuevo.'
                                : 'No se pudo iniciar sesión con Google.';

            return { success: false, message: firebaseMessage };
        }
    };

    const logout = async () => {
        sessionVersion.current += 1;
        const response = await requestWebSession('DELETE');
        if (response.success || response.status === 401) {
            setUser(null);
            return true;
        }
        return false;
    };

    const completeGooglePhone = updateGoogleUserPhone;

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, completeGooglePhone, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
