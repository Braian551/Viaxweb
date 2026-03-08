import React, { useEffect, useState } from 'react';
import {
    FiSave, FiSettings, FiPercent, FiDollarSign, FiRefreshCw,
    FiTruck, FiNavigation, FiClock, FiTag, FiActivity, FiStar,
    FiTarget, FiZap, FiSunrise, FiMoon, FiGift, FiTrendingDown,
    FiCreditCard, FiChevronDown, FiChevronUp, FiCheck, FiInfo, FiMapPin
} from 'react-icons/fi';
import { FaMotorcycle, FaTaxi, FaCarSide } from 'react-icons/fa6';
import { MdOutlineElectricRickshaw } from 'react-icons/md';
import { useAuth } from '../../auth/context/AuthContext';
import { getEmpresaPricing, updateEmpresaPricing } from '../services/empresaService';
import PageHeader from '../../shared/components/PageHeader';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';
import CurrencyInput from '../../shared/components/CurrencyInput';
import InfoTooltip from '../../shared/components/InfoTooltip';

const VEHICLE_CONFIG = {
    moto: { label: 'Moto', icon: FaMotorcycle, color: '#2196f3', bg: 'rgba(33,150,243,0.1)' },
    mototaxi: { label: 'Mototaxi', icon: MdOutlineElectricRickshaw, color: '#ff9800', bg: 'rgba(255,152,0,0.1)' },
    taxi: { label: 'Taxi', icon: FaTaxi, color: '#ffc107', bg: 'rgba(255,193,7,0.1)' },
    carro: { label: 'Carro', icon: FaCarSide, color: '#4caf50', bg: 'rgba(76,175,80,0.1)' },
};

/* ───── Reusable styled input with icon + unit ───── */
const RateInput = ({ label, value, onChange, icon: Icon, unit = 'COP', hint, placeholder, min = 0, max = 100, info }) => {
    const [localError, setLocalError] = React.useState(null);

    const validate = (val) => {
        if (min !== null && val < min) return `Min: ${min}${unit}`;
        if (max !== null && val > max) return `Max: ${max}${unit}`;
        return null;
    };

    const handleChange = (e) => {
        const val = parseFloat(e.target.value) || 0;
        const error = validate(val);
        setLocalError(error);
        onChange({ target: { value: val, error } });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            animation: localError ? 'v-shake 0.4s both' : 'none'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="v-form-label" style={{ fontSize: '0.82rem', gap: '5px', color: localError ? '#f44336' : 'var(--text-secondary)' }}>
                    {Icon && <Icon size={13} style={{ opacity: 0.7 }} />}
                    {label}
                </label>
                {info && <InfoTooltip title={label} content={info} />}
            </div>
            <div style={{ position: 'relative' }}>
                <input
                    className={`v-form-input ${localError ? 'v-input-error' : ''}`}
                    type="number"
                    value={value ?? ''}
                    onChange={handleChange}
                    placeholder={placeholder || '0'}
                    style={{
                        width: '100%',
                        paddingRight: unit ? '50px' : '16px',
                        borderColor: localError ? '#f44336' : 'var(--border)',
                        transition: 'all 0.2s'
                    }}
                />
                {unit && (
                    <span style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '0.75rem', fontWeight: 700, color: localError ? '#f44336' : 'var(--text-secondary)',
                        opacity: 0.5, pointerEvents: 'none', letterSpacing: '0.03em',
                    }}>
                        {unit}
                    </span>
                )}
            </div>
            {(localError || hint) && (
                <span style={{
                    fontSize: '0.72rem',
                    color: localError ? '#f44336' : 'var(--text-secondary)',
                    fontStyle: localError ? 'normal' : 'italic',
                    fontWeight: localError ? 600 : 400
                }}>
                    {localError || hint}
                </span>
            )}
        </div>
    );
};

/* ───── Collapsible section ───── */
const RateSection = ({ title, icon: Icon, iconColor, children, defaultOpen = true, badge, info }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{
            background: 'var(--card-bg, var(--bg-color))',
            borderRadius: '16px',
            border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
            position: 'relative',
            zIndex: open ? 10 : 1, // Elevate active section
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: open ? '0 10px 30px rgba(0,0,0,0.04)' : 'none',
        }}>
            <button
                onClick={() => setOpen(prev => !prev)}
                style={{
                    width: '100%', padding: '18px 24px', border: 'none', background: 'transparent',
                    display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
                    transition: 'background 0.2s',
                    color: 'var(--text)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(33,150,243,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: `${iconColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 4px 12px ${iconColor}20`,
                }}>
                    <Icon size={20} color={iconColor} />
                </div>
                <div style={{ flex: 1, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text, #1e293b)' }}>
                        {title}
                    </span>
                    {info && <InfoTooltip title={title} content={info} />}
                </div>
                {badge && (
                    <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800,
                        background: 'rgba(33,150,243,0.12)', color: 'var(--v-blue, #2196f3)',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                        {badge}
                    </span>
                )}
                <div style={{
                    width: '32px', height: '32px', borderRadius: '10px',
                    border: '1px solid var(--border-color, rgba(0,0,0,0.08))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)', transition: 'all 0.3s',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    background: open ? 'var(--primary-bg)' : 'transparent',
                }}>
                    <FiChevronDown size={16} />
                </div>
            </button>
            <div style={{
                maxHeight: open ? '1400px' : '0px',
                overflow: open ? 'visible' : 'hidden', // Allow tooltips to overflow when open
                transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), padding 0.5s ease, opacity 0.5s ease',
                padding: open ? '0 24px 24px' : '0 24px 0',
                opacity: open ? 1 : 0,
            }}>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

/* ───── Trip Simulator Component ───── */
const TripSimulator = ({ pricing, vehicleName }) => {
    const [km, setKm] = useState(5);
    const [min, setMin] = useState(10);
    const [waitMin, setWaitMin] = useState(0);

    if (!pricing) return null;

    const calculateTotal = () => {
        let subtotal = Number(pricing.tarifa_base) + (Number(pricing.costo_por_km) * km) + (Number(pricing.costo_por_minuto) * min);

        // Wait time
        const extraWait = Math.max(0, waitMin - Number(pricing.tiempo_espera_gratis || 0));
        subtotal += extraWait * Number(pricing.costo_tiempo_espera || 0);

        // Min fare
        let total = Math.max(subtotal, Number(pricing.tarifa_minima));

        // Max fare
        if (pricing.tarifa_maxima) {
            total = Math.min(total, Number(pricing.tarifa_maxima));
        }

        // Long distance discount
        if (km >= Number(pricing.umbral_km_descuento || 15)) {
            total *= (1 - (Number(pricing.descuento_distancia_larga || 0) / 100));
        }

        return total;
    };

    const total = calculateTotal();

    return (
        <div style={{
            marginTop: '20px',
            padding: '24px',
            background: 'linear-gradient(135deg, var(--bg-color), rgba(33, 150, 243, 0.05))',
            border: '2px solid var(--primary-bg)',
            borderRadius: '20px',
            position: 'relative',
            zIndex: 5
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiActivity size={20} />
                </div>
                <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Simulador de Viaje ({vehicleName})</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prueba tus tarifas en tiempo real antes de guardar</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Distancia (KM)</label>
                    <input type="range" min="1" max="50" step="0.5" value={km} onChange={e => setKm(e.target.value)} style={{ width: '100%', cursor: 'pointer' }} />
                    <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', marginTop: '5px' }}>{km} km</div>
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Tiempo (Min)</label>
                    <input type="range" min="1" max="120" value={min} onChange={e => setMin(e.target.value)} style={{ width: '100%', cursor: 'pointer' }} />
                    <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', marginTop: '5px' }}>{min} min</div>
                </div>
                <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Espera (Min)</label>
                    <input type="range" min="0" max="30" value={waitMin} onChange={e => setWaitMin(e.target.value)} style={{ width: '100%', cursor: 'pointer' }} />
                    <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.9rem', marginTop: '5px' }}>{waitMin} min</div>
                </div>
            </div>

            <div style={{
                background: 'var(--glass-strong)',
                padding: '20px',
                borderRadius: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: 'var(--shadow-md)'
            }}>
                <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Costo estimado para el pasajero</span>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(total)}
                    </h2>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Basado en tus cambios actuales</span><br />
                    <strong>Sin incluir impuestos ni propinas</strong>
                </div>
            </div>
        </div>
    );
};

const EmpresaTarifas = () => {
    const { user } = useAuth();
    const [pricing, setPricing] = useState([]);
    const [empresaInfo, setEmpresaInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const empresaId = user?.empresa_id || user?.id;

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            const pricingRes = await getEmpresaPricing(empresaId);

            if (pricingRes.success) {
                setPricing(pricingRes?.data?.precios || []);
                setEmpresaInfo(pricingRes?.data?.empresa || null);
            }
            setLoading(false);
        };
        load();
    }, [user, empresaId]);

    const handlePriceChange = (index, key, value) => {
        setPricing((prev) => prev.map((item, i) => (
            i === index ? { ...item, [key]: value } : item
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
        setMessage(res.message || (res.success ? 'Tarifas guardadas correctamente.' : 'Error al guardar tarifas.'));
        setSaving(false);
        setTimeout(() => setMessage(''), 4000);
    };

    if (loading) return (
        <div className="v-dashboard" style={{ maxWidth: 900 }}>
            <PageHeader title="Tarifas y Precios" subtitle="Cargando..." />
            <ShimmerDashboard />
        </div>
    );

    const currentVehicle = pricing[activeTab];
    const ch = (key, val) => handlePriceChange(activeTab, key, val);

    return (
        <div className="v-dashboard">
            <PageHeader title="Tarifas y Precios" subtitle="Gestiona los costos de servicio para cada tipo de vehículo" />

            {/* Toast message */}
            {message && (
                <div
                    className={message.includes('Error') ? 'v-error-box' : 'v-success-box'}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <FiCheck size={18} />
                    {message}
                </div>
            )}

            {/* Header bar */}
            <div className="glass-card" style={{
                padding: '16px 24px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'rgba(33,150,243,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FiTag size={22} color="#2196f3" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text, #1e293b)' }}>
                            Tarifas de la empresa
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary, #64748b)' }}>
                            Comisión admin: <strong>{Number(empresaInfo?.comision_admin_porcentaje || 0).toFixed(1)}%</strong>
                            {' · '}Saldo: <strong>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(empresaInfo?.saldo_pendiente || 0))}</strong>
                        </p>
                    </div>
                </div>
                <button className="v-btn-primary" onClick={handleSave} disabled={saving} style={{ borderRadius: '10px' }}>
                    {saving ? <><FiRefreshCw className="v-spin" size={16} /> Guardando...</> : <><FiSave size={16} /> Guardar cambios</>}
                </button>
            </div>

            {pricing.length === 0 ? (
                <div className="glass-card v-section" style={{ textAlign: 'center', padding: '50px 20px' }}>
                    <FiTruck size={48} color="var(--text-secondary, #64748b)" style={{ marginBottom: '16px', opacity: 0.4 }} />
                    <h3 style={{ margin: '0 0 8px', color: 'var(--text, #1e293b)' }}>Sin tarifas activas</h3>
                    <p style={{ color: 'var(--text-secondary, #64748b)', margin: 0, fontSize: '0.9rem' }}>
                        Contacta al administrador para habilitar tipos de vehículo.
                    </p>
                </div>
            ) : (
                <>
                    {/* Vehicle tabs — pill style */}
                    <div className="v-period-selector" style={{ alignSelf: 'flex-start' }}>
                        {pricing.map((vehicle, index) => {
                            const cfg = VEHICLE_CONFIG[vehicle.tipo_vehiculo] || { label: vehicle.tipo_vehiculo, icon: FiTruck, color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
                            const VIcon = cfg.icon;
                            const isActive = activeTab === index;
                            return (
                                <button
                                    key={`tab-${index}`}
                                    className={`v-period-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => setActiveTab(index)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '7px',
                                        ...(isActive ? { background: cfg.color, boxShadow: `0 3px 12px ${cfg.color}40` } : {}),
                                    }}
                                >
                                    <VIcon size={15} />
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Active vehicle content */}
                    {currentVehicle && (() => {
                        const cfg = VEHICLE_CONFIG[currentVehicle.tipo_vehiculo] || { label: currentVehicle.tipo_vehiculo, icon: FiTruck, color: '#64748b' };
                        return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'tarifaFadeIn 0.3s ease' }}>

                                {/* ─── Precios Base ─── */}
                                <RateSection
                                    title="Precios Base"
                                    icon={FiDollarSign}
                                    iconColor="#4caf50"
                                    defaultOpen={true}
                                    badge="Principal"
                                    info="Configuración fundamental del servicio. Estos valores definen el costo de arranque y los límites del viaje."
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        <CurrencyInput
                                            label="Tarifa base"
                                            icon={FiTarget}
                                            value={currentVehicle.tarifa_base}
                                            onChange={e => ch('tarifa_base', e.target.value)}
                                            min={1000}
                                            hint="Cobro fijo al iniciar viaje"
                                            info="Es el valor que se cobra por el simple hecho de iniciar el viaje. Debe cubrir los costos fijos mínimos del conductor. Recomendado: $1.000 - $5.000"
                                        />
                                        <CurrencyInput
                                            label="Tarifa mínima"
                                            icon={FiActivity}
                                            value={currentVehicle.tarifa_minima}
                                            onChange={e => ch('tarifa_minima', e.target.value)}
                                            min={2000}
                                            hint="No se cobrará menos de este valor"
                                            info="Si el cálculo por distancia y tiempo es menor a este valor, se cobrará automáticamente esta tarifa. Garantiza que viajes muy cortos sean rentables."
                                        />
                                        <CurrencyInput
                                            label="Tarifa máxima"
                                            icon={FiStar}
                                            value={currentVehicle.tarifa_maxima}
                                            onChange={e => ch('tarifa_maxima', e.target.value)}
                                            placeholder="Sin límite"
                                            hint="Vacío = sin tope"
                                            info="Opcional. Es el valor máximo que un usuario pagaría por un viaje, independientemente de la distancia o el tiempo. Útil para proteger al usuario en atascos extremos."
                                        />
                                    </div>
                                </RateSection>

                                {/* ─── Distancia y Tiempo ─── */}
                                <RateSection
                                    title="Distancia y Tiempo"
                                    icon={FiNavigation}
                                    iconColor="#2196f3"
                                    defaultOpen={true}
                                    info="Variables dinámicas basadas en el trayecto real medido por GPS y cronómetro."
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                                        <CurrencyInput
                                            label="Costo por KM"
                                            icon={FiNavigation}
                                            value={currentVehicle.costo_por_km}
                                            onChange={e => ch('costo_por_km', e.target.value)}
                                            min={100}
                                            hint="Se cobra por cada kilómetro"
                                            info="Valor incremental por cada 1,000 metros recorridos. Es la fuente principal de ingresos por distancia."
                                        />
                                        <CurrencyInput
                                            label="Costo por minuto"
                                            icon={FiClock}
                                            value={currentVehicle.costo_por_minuto}
                                            onChange={e => ch('costo_por_minuto', e.target.value)}
                                            min={0}
                                            hint="Cobro por tiempo en viaje"
                                            info="Valor que se suma por cada minuto transcurrido desde que inicia el viaje hasta que finaliza. Compensa al conductor por el tiempo en tráfico lento."
                                        />
                                        <RateInput
                                            label="KM mínimos"
                                            icon={FiTarget}
                                            unit="km"
                                            value={currentVehicle.distancia_minima}
                                            onChange={e => ch('distancia_minima', e.target.value)}
                                            min={0.1}
                                            max={10}
                                            info="Distancia sugerida mínima para el cálculo. Ayuda a filtrar solicitudes de trayectos excesivamente cortos si fuera necesario configurar un radio de acción."
                                        />
                                        <RateInput
                                            label="KM máximos"
                                            icon={FiTarget}
                                            unit="km"
                                            value={currentVehicle.distancia_maxima}
                                            onChange={e => ch('distancia_maxima', e.target.value)}
                                            min={5}
                                            max={500}
                                            info="Límite operativo de la ciudad o zona. Si un viaje excede este valor, el sistema podría alertar o bloquear la solicitud por seguridad."
                                        />
                                    </div>
                                </RateSection>

                                {/* ─── Tiempos de Espera ─── */}
                                <RateSection
                                    title="Tiempos de Espera"
                                    icon={FiClock}
                                    iconColor="#ff9800"
                                    defaultOpen={false}
                                    info="Reglas para cuando el conductor llega al punto de origen y debe esperar al pasajero."
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        <RateInput
                                            label="Minutos de gracia"
                                            icon={FiClock}
                                            unit="min"
                                            value={currentVehicle.tiempo_espera_gratis}
                                            onChange={e => ch('tiempo_espera_gratis', e.target.value)}
                                            min={0}
                                            max={15}
                                            hint="Espera gratuita para el pasajero"
                                            info="Tiempo que el conductor debe esperar sin cobrar recargos una vez notifica su llegada. Recomendado: 2-5 minutos."
                                        />
                                        <CurrencyInput
                                            label="Costo por minuto extra"
                                            icon={FiDollarSign}
                                            value={currentVehicle.costo_tiempo_espera}
                                            onChange={e => ch('costo_tiempo_espera', e.target.value)}
                                            hint="Se cobra después de los min. de gracia"
                                            info="Valor que se añade por cada minuto que el conductor sigue esperando después de agotarse el tiempo de gracia."
                                        />
                                    </div>
                                </RateSection>

                                {/* ─── Recargos Dinámicos ─── */}
                                <RateSection
                                    title="Recargos Dinámicos"
                                    icon={FiZap}
                                    iconColor="#f44336"
                                    defaultOpen={false}
                                    info="Incrementos porcentuales automáticos basados en condiciones externas (horario, fechas)."
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        <RateInput
                                            label="Hora pico"
                                            icon={FiSunrise}
                                            unit="%"
                                            value={currentVehicle.recargo_hora_pico}
                                            onChange={e => ch('recargo_hora_pico', e.target.value)}
                                            hint="Recargo en horas de alta demanda"
                                            info="Porcentaje adicional que se suma al total del viaje durante las franjas horarias definidas por la administración como 'pico'."
                                        />
                                        <RateInput
                                            label="Nocturno"
                                            icon={FiMoon}
                                            unit="%"
                                            value={currentVehicle.recargo_nocturno}
                                            onChange={e => ch('recargo_nocturno', e.target.value)}
                                            hint="Recargo en horarios nocturnos"
                                            info="Porcentaje extra aplicado a viajes realizados entre las horas de la noche. Suele compensar el riesgo o la menor disponibilidad."
                                        />
                                        <RateInput
                                            label="Festivo"
                                            icon={FiGift}
                                            unit="%"
                                            value={currentVehicle.recargo_festivo}
                                            onChange={e => ch('recargo_festivo', e.target.value)}
                                            hint="Recargo en días festivos"
                                            info="Porcentaje adicional para domingos y días feriados oficiales. Incentiva a los conductores a trabajar en días de descanso."
                                        />
                                    </div>
                                </RateSection>

                                {/* ─── Descuentos ─── */}
                                <RateSection
                                    title="Descuentos Larga Distancia"
                                    icon={FiTrendingDown}
                                    iconColor="#9c27b0"
                                    defaultOpen={false}
                                    info="Incentivos para viajes largos, permitiendo ser competitivos en trayectos extensos."
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '12px' }}>
                                        <RateInput
                                            label="Descuento aplicado"
                                            icon={FiPercent}
                                            unit="%"
                                            value={currentVehicle.descuento_distancia_larga}
                                            onChange={e => ch('descuento_distancia_larga', e.target.value)}
                                            hint="Se aplica si supera el umbral de KM"
                                            info="Porcentaje que se resta del total si el viaje es muy largo. Ayuda a atraer usuarios para servicios intermunicipales o trayectos largos."
                                        />
                                        <RateInput
                                            label="Umbral de distancia"
                                            icon={FiNavigation}
                                            unit="km"
                                            value={currentVehicle.umbral_km_descuento}
                                            onChange={e => ch('umbral_km_descuento', e.target.value)}
                                            min={5}
                                            max={100}
                                            hint="A partir de cuántos KM aplica"
                                            info="Distancia exacta a partir de la cual el descuento anterior entra en vigor."
                                        />
                                    </div>
                                    <div style={{
                                        padding: '12px 16px', borderRadius: '12px', fontSize: '0.82rem',
                                        background: 'rgba(156,39,176,0.06)', borderLeft: '4px solid #9c27b0',
                                        color: 'var(--text-secondary, #64748b)', display: 'flex', alignItems: 'center', gap: '10px',
                                    }}>
                                        <FiInfo size={16} style={{ flexShrink: 0, color: '#9c27b0' }} />
                                        <span>Si el viaje supera los <strong>{currentVehicle.umbral_km_descuento || 15} km</strong>, se aplica un <strong>{currentVehicle.descuento_distancia_larga || 0}%</strong> de descuento automáticamente.</span>
                                    </div>
                                </RateSection>

                                {/* ─── Comisiones ─── */}
                                <RateSection
                                    title="Comisiones y Deducciones"
                                    icon={FiCreditCard}
                                    iconColor="#607d8b"
                                    defaultOpen={false}
                                    info="Estructura de cobros de la empresa hacia los conductores por usar la plataforma."
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '12px' }}>
                                        <RateInput
                                            label="Comisión plataforma"
                                            icon={FiPercent}
                                            unit="%"
                                            value={currentVehicle.comision_plataforma}
                                            onChange={e => ch('comision_plataforma', e.target.value)}
                                            hint="Deducción por uso de la app"
                                            info="Porcentaje del viaje que la empresa retiene por el servicio de conexión. Es la ganancia bruta de la empresa."
                                        />
                                        <RateInput
                                            label="Comisión método de pago"
                                            icon={FiCreditCard}
                                            unit="%"
                                            value={currentVehicle.comision_metodo_pago}
                                            onChange={e => ch('comision_metodo_pago', e.target.value)}
                                            hint="Adicional por pago electrónico"
                                            info="Porcentaje extra que se deduce si el pago es por tarjeta o billetera digital, para cubrir costos bancarios de pasarela."
                                        />
                                    </div>
                                    <div style={{
                                        padding: '12px 16px', borderRadius: '12px', fontSize: '0.82rem',
                                        background: 'rgba(33,150,243,0.06)', borderLeft: '4px solid #2196f3',
                                        color: 'var(--text-secondary, #64748b)', display: 'flex', alignItems: 'center', gap: '10px',
                                    }}>
                                        <FiInfo size={16} style={{ flexShrink: 0, color: '#2196f3' }} />
                                        <span>Estas comisiones se deducen del valor neto por viaje, adicional a la comisión general del administrador (<strong>{Number(empresaInfo?.comision_admin_porcentaje || 0).toFixed(1)}%</strong>).</span>
                                    </div>
                                </RateSection>

                                {/* ─── Simulator ─── */}
                                <TripSimulator pricing={currentVehicle} vehicleName={cfg.label} />


                            </div>
                        );
                    })()}

                    {/* Bottom save button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                        <button className="v-btn-primary" onClick={handleSave} disabled={saving} style={{ borderRadius: '10px', padding: '12px 28px' }}>
                            {saving ? <><FiRefreshCw className="v-spin" size={16} /> Guardando...</> : <><FiSave size={16} /> Guardar todos los cambios</>}
                        </button>
                    </div>
                </>
            )}

            <style>{`
                @keyframes tarifaFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default EmpresaTarifas;
