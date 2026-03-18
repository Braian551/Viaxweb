import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'viax_cookie_consent_v1';

const defaultConsent = {
    essential: true,
    analytics: false,
    marketing: false,
    timestamp: null,
};

export function readCookieConsent() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return {
            ...defaultConsent,
            ...parsed,
            essential: true,
        };
    } catch {
        return null;
    }
}

export function saveCookieConsent(consent) {
    const normalized = {
        ...defaultConsent,
        ...consent,
        essential: true,
        timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('viax-cookie-consent-updated', { detail: normalized }));
}

const CookieConsentBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [marketing, setMarketing] = useState(false);

    useEffect(() => {
        const existing = readCookieConsent();
        if (!existing) {
            setIsVisible(true);
            return;
        }
        setAnalytics(Boolean(existing.analytics));
        setMarketing(Boolean(existing.marketing));
    }, []);

    const summary = useMemo(() => {
        if (analytics || marketing) return 'Personalizadas';
        return 'Solo esenciales';
    }, [analytics, marketing]);

    const acceptAll = () => {
        saveCookieConsent({ essential: true, analytics: true, marketing: true });
        setAnalytics(true);
        setMarketing(true);
        setIsVisible(false);
    };

    const rejectOptional = () => {
        saveCookieConsent({ essential: true, analytics: false, marketing: false });
        setAnalytics(false);
        setMarketing(false);
        setIsVisible(false);
    };

    const savePreferences = () => {
        saveCookieConsent({ essential: true, analytics, marketing });
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 'auto 18px 18px 18px',
            zIndex: 1200,
            maxWidth: 760,
            margin: '0 auto',
            background: 'var(--glass-strong)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-lg)',
            padding: 16,
            color: 'var(--text)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <strong style={{ fontSize: '1rem' }}>Privacidad y Cookies</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Modo: {summary}</span>
            </div>
            <p style={{ margin: '10px 0 14px 0', fontSize: '0.88rem', lineHeight: 1.45, color: 'var(--text-secondary)' }}>
                Usamos cookies esenciales para iniciar sesión y asegurar la plataforma. Puedes habilitar cookies opcionales para analítica y mejoras de experiencia.
            </p>

            {showOptions && (
                <div style={{ display: 'grid', gap: 10, marginBottom: 14 }}>
                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.86rem' }}>
                        <input type="checkbox" checked disabled />
                        Cookies esenciales (siempre activas)
                    </label>
                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.86rem' }}>
                        <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
                        Cookies analíticas
                    </label>
                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.86rem' }}>
                        <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
                        Cookies de personalización
                    </label>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button className="btn btn--primary" type="button" onClick={acceptAll}>Aceptar todo</button>
                <button className="btn btn--outline" type="button" onClick={rejectOptional}>Solo esenciales</button>
                <button className="btn btn--outline" type="button" onClick={() => setShowOptions((prev) => !prev)}>
                    {showOptions ? 'Ocultar preferencias' : 'Configurar'}
                </button>
                {showOptions && (
                    <button className="btn btn--outline" type="button" onClick={savePreferences}>Guardar preferencias</button>
                )}
            </div>
        </div>
    );
};

export default CookieConsentBanner;
