import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const getInitialTheme = () => {
    const storedTheme = localStorage.getItem('viax-theme');
    if (storedTheme === 'dark') return true;
    if (storedTheme === 'light') return false;
    return false;
};

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(getInitialTheme);

    useEffect(() => {
        const theme = isDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('viax-theme', theme);
    }, [isDark]);

    const value = useMemo(
        () => ({
            isDark,
            toggleTheme: () => setIsDark((prev) => !prev),
            setIsDark,
        }),
        [isDark]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
