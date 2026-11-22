import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { loginUser, loginWithGoogleToken, registerUser, requestWebSession, updateGoogleUserPhone } from '../services/authService';

import { SESSION_EXPIRED_EVENT } from '../../../config/httpClient';

const AuthContext = createContext(null);

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

    const login = async (email, password) => {
        const version = ++sessionVersion.current;
        const response = await loginUser(email, password);
        if (version === sessionVersion.current && response.success) setUser(response.data.user);
        return response;
    };

    const register = registerUser;

    const loginWithGoogle = async (credential) => {
        const version = ++sessionVersion.current;
        const response = await loginWithGoogleToken(credential);
        if (version === sessionVersion.current && response.success) setUser(response.data.user);
        return response;
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

    const completeGooglePhone = async (phone) => {
        const response = await updateGoogleUserPhone(phone);
        if (response.success) setUser(response.data.user);
        return response;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, completeGooglePhone, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
