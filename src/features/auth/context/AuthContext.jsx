import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authService';

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

    const logout = () => {
        setUser(null);
        localStorage.removeItem('viax_user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
