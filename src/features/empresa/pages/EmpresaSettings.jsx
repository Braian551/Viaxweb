import React, { useEffect, useState } from 'react';
import { FiSave, FiSettings, FiPercent, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaSettings, updateEmpresaSettings } from '../services/empresaService';
import '../../shared/DashboardLayout.css';

const EmpresaSettings = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const empresaId = user?.empresa_id || user?.id;

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            const res = await getEmpresaSettings(empresaId);
            if (res.success) setSettings(res.data || res.settings || res.configuracion || {});
            setLoading(false);
        };
        load();
    }, [user]);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        const res = await updateEmpresaSettings({ empresa_id: empresaId, ...settings });
        setMessage(res.message || (res.success ? 'Configuración guardada' : 'Error al guardar'));
        setSaving(false);
        setTimeout(() => setMessage(''), 4000);
    };

    if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>Cargando configuración...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '700px' }}>
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text)' }}>Configuración</h1>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Ajustes de precios y comisiones de tu empresa</p>
            </div>

            {message && (
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: message.includes('Error') ? 'rgba(244,67,54,0.1)' : 'rgba(76,175,80,0.1)', color: message.includes('Error') ? '#f44336' : '#4caf50', fontWeight: '600', fontSize: '0.9rem' }}>{message}</div>
            )}

            <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}><FiSettings color="var(--primary)" /> Configuración de Precios</h3>

                <SettingField icon={<FiDollarSign />} label="Tarifa Base (COP)" value={settings?.tarifa_base ?? ''} onChange={v => handleChange('tarifa_base', v)} type="number" />
                <SettingField icon={<FiDollarSign />} label="Precio por KM (COP)" value={settings?.precio_km ?? ''} onChange={v => handleChange('precio_km', v)} type="number" />
                <SettingField icon={<FiDollarSign />} label="Precio por Minuto (COP)" value={settings?.precio_minuto ?? ''} onChange={v => handleChange('precio_minuto', v)} type="number" />
                <SettingField icon={<FiPercent />} label="Comisión Plataforma (%)" value={settings?.comision_plataforma ?? ''} onChange={v => handleChange('comision_plataforma', v)} type="number" disabled={true} hint="Este valor es definido por VIAX" />
                <SettingField icon={<FiDollarSign />} label="Tarifa Mínima (COP)" value={settings?.tarifa_minima ?? ''} onChange={v => handleChange('tarifa_minima', v)} type="number" />

                <button onClick={handleSave} disabled={saving} style={{
                    marginTop: '8px', padding: '14px 24px', borderRadius: '14px', border: 'none',
                    background: 'var(--primary)', color: 'white', fontWeight: '700', fontSize: '1rem',
                    cursor: saving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'opacity 0.2s', opacity: saving ? 0.7 : 1
                }}>
                    {saving ? <><FiRefreshCw className="spin" /> Guardando...</> : <><FiSave /> Guardar Cambios</>}
                </button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}} />
        </div>
    );
};

const SettingField = ({ icon, label, value, onChange, type = 'text', disabled = false, hint }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>{icon} {label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            style={{
                padding: '12px 16px', borderRadius: '12px',
                border: '1px solid var(--border, rgba(0,0,0,0.1))',
                background: disabled ? 'var(--bg, #f0f4f8)' : 'transparent',
                color: 'var(--text)', fontSize: '1rem', fontWeight: '600',
                outline: 'none', transition: 'border-color 0.2s',
                opacity: disabled ? 0.6 : 1
            }}
        />
        {hint && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{hint}</span>}
    </div>
);

export default EmpresaSettings;
