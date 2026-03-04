import React, { useEffect, useState } from 'react';
import { FiSave, FiSettings, FiPercent, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaPricing, updateEmpresaPricing } from '../services/empresaService';
import PageHeader from '../../shared/components/PageHeader';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';

const VEHICLE_LABELS = {
    moto: 'Moto',
    mototaxi: 'Mototaxi',
    taxi: 'Taxi',
    carro: 'Carro',
};

const EmpresaSettings = () => {
    const { user } = useAuth();
    const [pricing, setPricing] = useState([]);
    const [empresaInfo, setEmpresaInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const empresaId = user?.empresa_id || user?.id;

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            const res = await getEmpresaPricing(empresaId);
            if (res.success) {
                setPricing(res?.data?.precios || []);
                setEmpresaInfo(res?.data?.empresa || null);
            }
            setLoading(false);
        };
        load();
    }, [user]);

    const handlePriceChange = (index, key, value) => {
        setPricing((prev) => prev.map((item, current) => (
            current === index ? { ...item, [key]: value } : item
        )));
    };

    const parseNumber = (value, fallback = 0) => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('');

        const payload = pricing.map((item) => ({
            tipo_vehiculo: item.tipo_vehiculo,
            tarifa_base: parseNumber(item.tarifa_base),
            costo_por_km: parseNumber(item.costo_por_km),
            costo_por_minuto: parseNumber(item.costo_por_minuto),
            tarifa_minima: parseNumber(item.tarifa_minima),
            tarifa_maxima: item.tarifa_maxima === null || item.tarifa_maxima === '' ? null : parseNumber(item.tarifa_maxima),
            recargo_hora_pico: parseNumber(item.recargo_hora_pico),
            recargo_nocturno: parseNumber(item.recargo_nocturno),
            recargo_festivo: parseNumber(item.recargo_festivo),
            descuento_distancia_larga: parseNumber(item.descuento_distancia_larga),
            umbral_km_descuento: parseNumber(item.umbral_km_descuento, 15),
            comision_plataforma: parseNumber(item.comision_plataforma),
            comision_metodo_pago: parseNumber(item.comision_metodo_pago),
            distancia_minima: parseNumber(item.distancia_minima, 1),
            distancia_maxima: parseNumber(item.distancia_maxima, 50),
            tiempo_espera_gratis: parseNumber(item.tiempo_espera_gratis, 3),
            costo_tiempo_espera: parseNumber(item.costo_tiempo_espera),
            activo: item.activo === false ? 0 : 1,
        }));

        const res = await updateEmpresaPricing(empresaId, payload);
        setMessage(res.message || (res.success ? 'Configuración guardada' : 'Error al guardar'));
        setSaving(false);
        setTimeout(() => setMessage(''), 4000);
    };

    if (loading) return <div className="v-dashboard" style={{ maxWidth: 700 }}><PageHeader title="Configuración" subtitle="Cargando..." /><ShimmerDashboard /></div>;

    return (
        <div className="v-dashboard">
            <PageHeader title="Configuración" subtitle="Tarifas por tipo de vehículo (alineado con la app)" />

            {message && (
                <div className={message.includes('Error') ? 'v-error-box' : 'v-success-box'}>{message}</div>
            )}

            <div className="glass-card v-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div className="v-section__header" style={{ marginBottom: 0 }}>
                    <div className="v-section__icon" style={{ background: 'rgba(33,150,243,0.12)' }}>
                        <FiSettings size={20} color="#2196f3" />
                    </div>
                    <div>
                        <h3 className="v-section__title" style={{ marginBottom: 2 }}>Tarifas de la empresa</h3>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Comisión admin: {Number(empresaInfo?.comision_admin_porcentaje || 0).toFixed(1)}% · Saldo pendiente: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(empresaInfo?.saldo_pendiente || 0))}
                        </p>
                    </div>
                </div>
                <button className="v-btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? <><FiRefreshCw className="v-spin" /> Guardando...</> : <><FiSave /> Guardar cambios</>}
                </button>
            </div>

            {pricing.length === 0 ? (
                <div className="glass-card v-section" style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No hay tarifas activas para esta empresa.</p>
                </div>
            ) : (
                <div className="v-card-grid">
                    {pricing.map((vehicle, index) => (
                        <div key={`${vehicle.tipo_vehiculo}-${index}`} className="glass-card v-section">
                            <div className="v-section__header">
                                <div className="v-section__icon" style={{ background: 'rgba(156,39,176,0.12)' }}>
                                    <FiDollarSign size={18} color="#9c27b0" />
                                </div>
                                <h3 className="v-section__title">{VEHICLE_LABELS[vehicle.tipo_vehiculo] || vehicle.tipo_vehiculo}</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Tarifas</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                    <div>
                                        <label className="v-form-label">Tarifa base (COP)</label>
                                        <input className="v-form-input" type="number" value={vehicle.tarifa_base ?? ''} onChange={(e) => handlePriceChange(index, 'tarifa_base', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="v-form-label">Tarifa mínima (COP)</label>
                                        <input className="v-form-input" type="number" value={vehicle.tarifa_minima ?? ''} onChange={(e) => handlePriceChange(index, 'tarifa_minima', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="v-form-label">Tarifa máxima (COP)</label>
                                        <input className="v-form-input" type="number" value={vehicle.tarifa_maxima ?? ''} onChange={(e) => handlePriceChange(index, 'tarifa_maxima', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="v-form-label">Costo por KM (COP)</label>
                                        <input className="v-form-input" type="number" value={vehicle.costo_por_km ?? ''} onChange={(e) => handlePriceChange(index, 'costo_por_km', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="v-form-label">Costo por minuto (COP)</label>
                                        <input className="v-form-input" type="number" value={vehicle.costo_por_minuto ?? ''} onChange={(e) => handlePriceChange(index, 'costo_por_minuto', e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>Distancia</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                    <div>
                                        <label className="v-form-label">Distancia mínima (km)</label>
                                        <input className="v-form-input" type="number" value={vehicle.distancia_minima ?? 1} onChange={(e) => handlePriceChange(index, 'distancia_minima', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="v-form-label">Distancia máxima (km)</label>
                                        <input className="v-form-input" type="number" value={vehicle.distancia_maxima ?? 50} onChange={(e) => handlePriceChange(index, 'distancia_maxima', e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>Recargos</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                    <div>
                                        <label className="v-form-label">Recargo hora pico (%)</label>
                                        <input className="v-form-input" type="number" value={vehicle.recargo_hora_pico ?? 0} onChange={(e) => handlePriceChange(index, 'recargo_hora_pico', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="v-form-label">Recargo nocturno (%)</label>
                                        <input className="v-form-input" type="number" value={vehicle.recargo_nocturno ?? 0} onChange={(e) => handlePriceChange(index, 'recargo_nocturno', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="v-form-label">Recargo festivo (%)</label>
                                        <input className="v-form-input" type="number" value={vehicle.recargo_festivo ?? 0} onChange={(e) => handlePriceChange(index, 'recargo_festivo', e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>Descuentos</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                    <div>
                                        <label className="v-form-label">Descuento larga distancia (%)</label>
                                        <input className="v-form-input" type="number" value={vehicle.descuento_distancia_larga ?? 0} onChange={(e) => handlePriceChange(index, 'descuento_distancia_larga', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="v-form-label">Umbral descuento (km)</label>
                                        <input className="v-form-input" type="number" value={vehicle.umbral_km_descuento ?? 15} onChange={(e) => handlePriceChange(index, 'umbral_km_descuento', e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>Comisión</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                    <div>
                                        <label className="v-form-label"><FiPercent style={{ marginRight: 6 }} />Comisión plataforma (%)</label>
                                        <input className="v-form-input" type="number" value={vehicle.comision_plataforma ?? 0} onChange={(e) => handlePriceChange(index, 'comision_plataforma', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="v-form-label">Comisión método pago (%)</label>
                                        <input className="v-form-input" type="number" value={vehicle.comision_metodo_pago ?? 0} onChange={(e) => handlePriceChange(index, 'comision_metodo_pago', e.target.value)} />
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>Espera</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                    <div>
                                        <label className="v-form-label">Tiempo espera gratis (min)</label>
                                        <input className="v-form-input" type="number" value={vehicle.tiempo_espera_gratis ?? 3} onChange={(e) => handlePriceChange(index, 'tiempo_espera_gratis', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="v-form-label">Costo tiempo espera (COP/min)</label>
                                        <input className="v-form-input" type="number" value={vehicle.costo_tiempo_espera ?? 0} onChange={(e) => handlePriceChange(index, 'costo_tiempo_espera', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {pricing.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="v-btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? <><FiRefreshCw className="v-spin" /> Guardando...</> : <><FiSave /> Guardar cambios</>}
                    </button>
                </div>
            )}
        </div>
    );
};

export default EmpresaSettings;
