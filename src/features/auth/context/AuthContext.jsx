import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, hasFirebaseConfig } from '../../../config/firebase';
import { loginUser, loginWithGoogleToken, registerUser, updateGoogleUserPhone } from '../services/authService';

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

    // Initialize session from local storage
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('viax_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to parse user from local storage:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const response = await loginUser(email, password);
        if (response.success && response.data) {
            // Using the same logic as the Flutter app
            const userData = response.data.user || response.data.admin;
            if (userData) {
                setUser(userData);
                localStorage.setItem('viax_user', JSON.stringify(userData));
            }
        }
        return response;
    };

    const register = async (userData) => {
        const response = await registerUser(userData);
        if (response.success && response.data) {
            const uData = response.data.user;
            if (uData) {
                setUser(uData);
                localStorage.setItem('viax_user', JSON.stringify(uData));
            }
        }
        return response;
    };

    const loginWithGoogle = async () => {
        if (!hasFirebaseConfig || !auth || !googleProvider) {
            return {
                success: false,
                message: 'Google Sign-In no está configurado en este entorno.',
            };
        }

        try {
            const popupResult = await signInWithPopup(auth, googleProvider);
            const googleCredential = GoogleAuthProvider.credentialFromResult(popupResult);
            const response = await loginWithGoogleToken({
                idToken: googleCredential?.idToken || null,
                accessToken: googleCredential?.accessToken || null,
            });

            if (response.success && response.data?.user) {
                setUser(response.data.user);
                localStorage.setItem('viax_user', JSON.stringify(response.data.user));
            }

            return response;
        } catch (error) {
            const firebaseCode = error?.code;
            const firebaseMessage =
                firebaseCode === 'auth/popup-closed-by-user'
                    ? 'Cancelaste el inicio de sesión con Google.'
                    : firebaseCode === 'auth/popup-blocked'
                        ? 'El navegador bloqueó la ventana emergente de Google. Permite popups e inténtalo de nuevo.'
                        : 'No se pudo iniciar sesión con Google.';

            return { success: false, message: firebaseMessage };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('viax_user');
    };

    const completeGooglePhone = async ({ userId, phone }) => {
        const response = await updateGoogleUserPhone({ userId, phone });
        if (response.success && response.user) {
            setUser(response.user);
            localStorage.setItem('viax_user', JSON.stringify(response.user));
        }
        return response;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, completeGooglePhone, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
