import React, { useEffect, useState } from 'react';
import { FiSave, FiSettings, FiPercent, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaSettings, updateEmpresaSettings } from '../services/empresaService';
import PageHeader from '../../shared/components/PageHeader';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';

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

    if (loading) return <div className="v-dashboard" style={{ maxWidth: 700 }}><PageHeader title="Configuración" subtitle="Cargando..." /><ShimmerDashboard /></div>;

    return (
        <div className="v-dashboard" style={{ maxWidth: 700 }}>
            <PageHeader title="Configuración" subtitle="Ajustes de precios y comisiones de tu empresa" />

            {message && (
                <div className={message.includes('Error') ? 'v-error-box' : 'v-success-box'}>{message}</div>
            )}

            <div className="glass-card v-section">
                <div className="v-section__header">
                    <FiSettings className="v-section__icon" />
                    <h3 className="v-section__title">Configuración de Precios</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>
                    <div>
                        <label className="v-form-label"><FiDollarSign style={{ marginRight: 6 }} /> Tarifa Base (COP)</label>
                        <input className="v-form-input" type="number" value={settings?.tarifa_base ?? ''} onChange={e => handleChange('tarifa_base', e.target.value)} />
                    </div>
                    <div>
                        <label className="v-form-label"><FiDollarSign style={{ marginRight: 6 }} /> Precio por KM (COP)</label>
                        <input className="v-form-input" type="number" value={settings?.precio_km ?? ''} onChange={e => handleChange('precio_km', e.target.value)} />
                    </div>
                    <div>
                        <label className="v-form-label"><FiDollarSign style={{ marginRight: 6 }} /> Precio por Minuto (COP)</label>
                        <input className="v-form-input" type="number" value={settings?.precio_minuto ?? ''} onChange={e => handleChange('precio_minuto', e.target.value)} />
                    </div>
                    <div>
                        <label className="v-form-label"><FiPercent style={{ marginRight: 6 }} /> Comisión Plataforma (%)</label>
                        <input className="v-form-input" type="number" value={settings?.comision_plataforma ?? ''} disabled style={{ opacity: 0.6 }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 4, display: 'block' }}>Este valor es definido por VIAX</span>
                    </div>
                    <div>
                        <label className="v-form-label"><FiDollarSign style={{ marginRight: 6 }} /> Tarifa Mínima (COP)</label>
                        <input className="v-form-input" type="number" value={settings?.tarifa_minima ?? ''} onChange={e => handleChange('tarifa_minima', e.target.value)} />
                    </div>

                    <button className="v-btn v-btn--primary" onClick={handleSave} disabled={saving} style={{ marginTop: 8, justifyContent: 'center' }}>
                        {saving ? <><FiRefreshCw className="v-spin" /> Guardando...</> : <><FiSave /> Guardar Cambios</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmpresaSettings;
