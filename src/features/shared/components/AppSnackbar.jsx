import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';

const SnackbarContext = createContext({
    showSnackbar: () => {},
});

const TYPE_CONFIG = {
    success: { icon: FiCheckCircle, className: 'success' },
    error: { icon: FiAlertCircle, className: 'error' },
    warning: { icon: FiAlertTriangle, className: 'warning' },
    info: { icon: FiInfo, className: 'info' },
};

export const SnackbarProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const timersRef = useRef(new Map());

    const dismissSnackbar = useCallback((id) => {
        const timer = timersRef.current.get(id);
        if (timer) {
            clearTimeout(timer);
            timersRef.current.delete(id);
        }
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const showSnackbar = useCallback((message, options = {}) => {
        if (!message) return;

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const type = options.type || 'info';
        const duration = Number.isFinite(options.duration) ? options.duration : 3600;

        setItems((prev) => {
            const next = [...prev, { id, message, type, action: options.action || null }];
            return next.slice(-4);
        });

        const timer = setTimeout(() => dismissSnackbar(id), Math.max(1400, duration));
        timersRef.current.set(id, timer);
    }, [dismissSnackbar]);

    const value = useMemo(() => ({ showSnackbar, dismissSnackbar }), [showSnackbar, dismissSnackbar]);

    return (
        <SnackbarContext.Provider value={value}>
            {children}
            <div className="v-snackbar-stack" role="region" aria-live="polite" aria-label="Notificaciones">
                {items.map((item) => {
                    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;
                    const Icon = config.icon;
                    return (
                        <div key={item.id} className={`v-snackbar ${config.className}`}>
                            <span className="v-snackbar__icon"><Icon /></span>
                            <div className="v-snackbar__content">
                                <p>{item.message}</p>
                                {item.action?.label && typeof item.action?.onClick === 'function' && (
                                    <button
                                        type="button"
                                        className="v-snackbar__action"
                                        onClick={() => {
                                            item.action.onClick();
                                            dismissSnackbar(item.id);
                                        }}
                                    >
                                        {item.action.label}
                                    </button>
                                )}
                            </div>
                            <button
                                type="button"
                                className="v-snackbar__close"
                                onClick={() => dismissSnackbar(item.id)}
                                aria-label="Cerrar notificación"
                            >
                                <FiX />
                            </button>
                        </div>
                    );
                })}
            </div>
        </SnackbarContext.Provider>
    );
};

export const useSnackbar = () => useContext(SnackbarContext);
