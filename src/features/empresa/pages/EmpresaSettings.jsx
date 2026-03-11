import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    FiSave, FiUser, FiMapPin, FiRefreshCw,
    FiMail, FiPhone, FiFileText, FiBriefcase, FiEdit2,
    FiChevronDown, FiChevronUp, FiCamera, FiCheck, FiInfo,
    FiHome, FiMap, FiShield, FiAlertCircle, FiLock,
    FiEye, FiEyeOff, FiCreditCard, FiHash, FiDollarSign,
    FiSearch, FiX, FiSend
} from 'react-icons/fi';
import { FaMotorcycle, FaTaxi, FaCarSide } from 'react-icons/fa6';
import { MdOutlineElectricRickshaw } from 'react-icons/md';
import { useAuth } from '../../auth/context/AuthContext';
import SearchableModal from '../../shared/components/SearchableModal';
import {
    getEmpresaProfile, getEmpresaSettings, updateEmpresaProfile,
    updateEmpresaSettings, checkPasswordStatus, requestPasswordCode,
    changePasswordWithCode, getColombianBanks, getDepartments, getCitiesByDepartment, toggleEmpresaVehicle
} from '../services/empresaService';
import PageHeader from '../../shared/components/PageHeader';
import ProfileAvatar from '../../shared/components/ProfileAvatar';
import OtpInput from '../../auth/components/OtpInput';
import { ShimmerDashboard } from '../../shared/components/ShimmerLoader';
import { V, F } from '../../shared/utils/validators';

/* ═══════════════════════════ REUSABLE COMPONENTS ═══════════════════════════ */

/* ─── Collapsible Section ─── */
const Section = ({ title, icon: Icon, iconColor = '#2196f3', defaultOpen = true, badge, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="glass-card v-section" style={{ overflow: 'hidden', marginBottom: '16px' }}>
            <button
                onClick={() => setOpen(p => !p)}
                style={{ width: '100%', padding: '16px 20px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.2s', color: 'var(--text)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(33,150,243,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${iconColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={17} color={iconColor} />
                </div>
                <span style={{ flex: 1, textAlign: 'left', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{title}</span>
                {badge && <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(76,175,80,0.12)', color: '#4caf50', fontWeight: 600 }}>{badge}</span>}
                {open ? <FiChevronUp size={18} style={{ opacity: 0.5 }} /> : <FiChevronDown size={18} style={{ opacity: 0.5 }} />}
            </button>
            <div style={{ maxHeight: open ? '3000px' : '0', overflow: 'hidden', transition: 'max-height 0.4s ease', padding: open ? '0 20px 20px' : '0 20px' }}>
                {children}
            </div>
        </div>
    );
};

/* ─── Input Field ─── */
const Field = ({ label, icon: Icon, value, onChange, type = 'text', placeholder = '', disabled = false, hint, validate, filter }) => {
    const [touched, setTouched] = useState(false);
    const err = touched && validate ? validate(value) : null;

    const hChange = (e) => {
        if (filter) e.target.value = filter(e.target.value);
        if (onChange) onChange(e);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
            {label && <label className="v-form-label" style={{ fontSize: '0.82rem', gap: 5, display: 'flex', alignItems: 'center' }}>{Icon && <Icon size={13} style={{ opacity: 0.7 }} />}{label}</label>}
            <input
                className="v-form-input"
                type={type}
                value={value || ''}
                onChange={hChange}
                onBlur={() => setTouched(true)}
                placeholder={placeholder}
                disabled={disabled}
                style={{ width: '100%', borderColor: err ? '#ef4444' : undefined, boxShadow: err ? '0 0 0 2px rgba(239, 68, 68, 0.12)' : undefined }}
            />
            {err && <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500, marginTop: '-2px' }}>{err}</span>}
            {hint && !err && <span style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{hint}</span>}
        </div>
    );
};

/* ─── Grid helper ─── */
const Grid = ({ cols = 2, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
        {children}
    </div>
);

/* ─── Vehicle config ─── */
const VEHICLE_MAP = {
    moto: { label: 'Moto', desc: 'Motocicletas', icon: FaMotorcycle, color: '#2196f3' },
    mototaxi: { label: 'Mototaxi', desc: 'Mototaxis de carga', icon: MdOutlineElectricRickshaw, color: '#ff9800' },
    taxi: { label: 'Taxi', desc: 'Taxis y transporte público', icon: FaTaxi, color: '#ffc107' },
    carro: { label: 'Carro', desc: 'Automóviles particulares', icon: FaCarSide, color: '#4caf50' },
};

/* ─── Toast ─── */
const Toast = ({ message, type = 'success' }) => {
    if (!message) return null;
    const isError = type === 'error';
    return (
        <div className={isError ? 'v-error-box' : 'v-success-box'} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            {isError ? <FiAlertCircle size={16} /> : <FiCheck size={16} />}
            {message}
        </div>
    );
};

/* ═══════════════════════════  MAIN COMPONENT ═══════════════════════════ */
const EmpresaSettings = () => {
    const { user } = useAuth();
    const empresaId = user?.empresa_id || user?.id;
    const userId = user?.id;

    // ─── State ───
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    // Profile
    const [profile, setProfile] = useState({});
    // Settings (bank)
    const [settings, setSettings] = useState({});
    // Location
    const [departments, setDepartments] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [loadingDepts, setLoadingDepts] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    // Banks
    const [banks, setBanks] = useState([]);
    const [selectedBank, setSelectedBank] = useState(null);
    const [loadingBanks, setLoadingBanks] = useState(false);
    // Password
    const [pwStep, setPwStep] = useState('idle'); // idle | sending | otp | newpw | saving
    const [pwOtp, setPwOtp] = useState('');
    const [pwNew, setPwNew] = useState('');
    const [pwConfirm, setPwConfirm] = useState('');
    const [showNewPw, setShowNewPw] = useState(false);
    const [pwMsg, setPwMsg] = useState({ text: '', type: 'success' });
    // Logo
    const [logoPreview, setLogoPreview] = useState(null);

    const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast({ message: '', type: 'success' }), 5000); };

    // ─── Load departments ───
    const loadDepts = useCallback(async () => {
        setLoadingDepts(true);
        try { const d = await getDepartments(); setDepartments(d); return d; } catch { return []; }
        finally { setLoadingDepts(false); }
    }, []);

    const loadCities = useCallback(async (deptId) => {
        setLoadingCities(true); setCities([]);
        try { const c = await getCitiesByDepartment(deptId); setCities(c); return c; } catch { return []; }
        finally { setLoadingCities(false); }
    }, []);

    // ─── Load all data ───
    useEffect(() => {
        if (!user) return;
        (async () => {
            setLoading(true);
            try {
                const [profileRes, settingsRes, deptsData, banksRes] = await Promise.all([
                    getEmpresaProfile(empresaId),
                    getEmpresaSettings(empresaId),
                    loadDepts(),
                    getColombianBanks(),
                ]);

                // Profile
                const p = profileRes?.data?.empresa || profileRes?.data || profileRes?.empresa || profileRes || {};
                const tv = (() => {
                    const v = p.tipos_vehiculo;
                    if (Array.isArray(v)) return v;
                    if (typeof v === 'string') {
                        if (v.startsWith('{') && v.endsWith('}')) {
                            // Convert PostgreSQL array literal "{moto,taxi}" to JS array
                            const trimmed = v.slice(1, -1).trim();
                            if (!trimmed) return [];
                            return trimmed.split(',').map(s => s.replace(/^"|"$/g, '').trim());
                        }
                        try { return JSON.parse(v); } catch { return []; }
                    }
                    return [];
                })();
                setProfile({
                    nombre: p.nombre_empresa || p.nombre || '',
                    nit: p.numero_documento || p.nit || '',
                    razon_social: p.razon_social || '',
                    email: p.email || '',
                    telefono: p.telefono || '',
                    telefono_secundario: p.telefono_secundario || '',
                    direccion: p.direccion || '',
                    municipio: p.municipio || '',
                    departamento: p.departamento || '',
                    representante_nombre: p.representante_nombre || '',
                    representante_telefono: p.representante_telefono || '',
                    representante_email: p.representante_email || '',
                    descripcion: p.descripcion || '',
                    tipos_vehiculo: tv,
                    logo_url: p.logo_url || '',
                    estado: p.estado || 'activo',
                    comision_admin_porcentaje: p.comision_admin_porcentaje || 0,
                });

                // Settings
                const s = settingsRes?.data || settingsRes || {};
                setSettings({
                    banco_nombre: s.banco_nombre || '',
                    banco_codigo: s.banco_codigo || '',
                    tipo_cuenta: s.tipo_cuenta || 'ahorros',
                    numero_cuenta: s.numero_cuenta || '',
                    titular_cuenta: s.titular_cuenta || '',
                    documento_titular: s.documento_titular || '',
                    referencia_transferencia: s.referencia_transferencia || '',
                });

                // Banks
                const bankList = banksRes?.data || [];
                const parsed = bankList.filter(b => b.nombre).map(b => ({ codigo: b.codigo || '', nombre: b.nombre || '' }));
                setBanks(parsed);
                if (s.banco_codigo) {
                    const match = parsed.find(b => b.codigo === s.banco_codigo);
                    if (match) setSelectedBank(match);
                    else if (s.banco_nombre) setSelectedBank({ codigo: s.banco_codigo || '', nombre: s.banco_nombre });
                }

                // Location matching
                if (p.departamento && deptsData.length) {
                    const dept = deptsData.find(d => d.name === p.departamento);
                    if (dept) {
                        setSelectedDept(dept);
                        const citiesData = await loadCities(dept.id);
                        if (p.municipio && citiesData.length) {
                            const city = citiesData.find(c => c.name === p.municipio);
                            if (city) setSelectedCity(city);
                        }
                    }
                }
            } catch (e) { console.error('Error loading config:', e); }
            setLoading(false);
        })();
    }, [user, empresaId, loadDepts, loadCities]);

    // ─── Handlers ───
    const ch = (field, v) => setProfile(p => ({ ...p, [field]: v }));
    const chS = (field, v) => setSettings(p => ({ ...p, [field]: v }));

    const toggleVehicle = async (tipo) => {
        const cur = profile.tipos_vehiculo || [];
        const isCurrentlyActive = cur.includes(tipo);
        const nextState = isCurrentlyActive ? cur.filter(t => t !== tipo) : [...cur, tipo];

        // Optimistic UI update
        setProfile(p => ({ ...p, tipos_vehiculo: nextState }));

        try {
            const res = await toggleEmpresaVehicle({
                empresa_id: empresaId,
                tipo_vehiculo: tipo,
                activo: !isCurrentlyActive,
                usuario_id: user.id
            });

            if (!res?.success) {
                // Revert on failure
                setProfile(p => ({ ...p, tipos_vehiculo: cur }));
                showToast(`Error al actualizar vehículo: ${res?.message || 'Error desconocido'}`, 'error');
            } else {
                showToast(res.message, 'success');
            }
        } catch (e) {
            // Revert on exception
            setProfile(p => ({ ...p, tipos_vehiculo: cur }));
            showToast('Error de conexión al actualizar tipo de vehículo.', 'error');
        }
    };

    const handleDeptSelect = async (dept) => {
        setSelectedDept(dept);
        setSelectedCity(null);
        ch('departamento', dept.name);
        ch('municipio', '');
        await loadCities(dept.id);
    };

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        ch('municipio', city.name);
    };

    const handleBankSelect = (bank) => {
        setSelectedBank(bank);
        chS('banco_nombre', bank.nombre);
        chS('banco_codigo', bank.codigo);
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) { const reader = new FileReader(); reader.onload = ev => setLogoPreview(ev.target.result); reader.readAsDataURL(file); }
    };

    const handleSaveProfile = async () => {
        // Pre-validate
        if (V.required('El nombre')(profile.nombre) || V.required('La razón social')(profile.razon_social) || V.nit(profile.nit) || V.email(profile.email) || V.phone(profile.telefono)) {
            showToast('Por favor, corrige los errores en el formulario antes de guardar.', 'error');
            return;
        }

        setSavingProfile(true);
        try {
            const payload = { ...profile };
            if (payload.nombre) { payload.nombre_empresa = payload.nombre; delete payload.nombre; }
            payload.municipio = selectedCity?.name || profile.municipio || '';
            payload.departamento = selectedDept?.name || profile.departamento || '';
            const res = await updateEmpresaProfile(empresaId, payload);
            showToast(res?.success ? 'Perfil actualizado exitosamente.' : `Error: ${res?.message || 'No se pudo guardar'}`, res?.success ? 'success' : 'error');
        } catch { showToast('Error al conectar con el servidor.', 'error'); }
        setSavingProfile(false);
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await updateEmpresaSettings({ empresa_id: empresaId, ...settings });
            showToast(res?.success ? 'Datos de pago actualizados.' : `Error: ${res?.message || 'No se pudo guardar'}`, res?.success ? 'success' : 'error');
        } catch { showToast('Error al conectar con el servidor.', 'error'); }
        setSavingSettings(false);
    };

    // ─── Password with OTP ───
    const handleRequestCode = async () => {
        setPwStep('sending');
        setPwMsg({ text: '', type: 'success' });
        try {
            const res = await requestPasswordCode(userId);
            if (res?.success) { setPwStep('otp'); setPwMsg({ text: 'Código enviado a tu correo electrónico', type: 'success' }); }
            else { setPwStep('idle'); setPwMsg({ text: res?.message || 'Error al enviar el código', type: 'error' }); }
        } catch { setPwStep('idle'); setPwMsg({ text: 'Error de conexión', type: 'error' }); }
    };

    const handleVerifyAndChange = async () => {
        if (pwNew.length < 6) { setPwMsg({ text: 'La contraseña debe tener al menos 6 caracteres', type: 'error' }); return; }
        if (pwNew !== pwConfirm) { setPwMsg({ text: 'Las contraseñas no coinciden', type: 'error' }); return; }
        if (pwOtp.length < 4) { setPwMsg({ text: 'Ingresa el código de verificación completo', type: 'error' }); return; }
        setPwStep('saving');
        try {
            const res = await changePasswordWithCode(userId, pwOtp, pwNew);
            if (res?.success) {
                setPwStep('idle'); setPwOtp(''); setPwNew(''); setPwConfirm('');
                setPwMsg({ text: 'Contraseña actualizada exitosamente', type: 'success' });
            } else {
                setPwStep('newpw');
                setPwMsg({ text: res?.message || 'Código inválido o expirado', type: 'error' });
            }
        } catch { setPwStep('newpw'); setPwMsg({ text: 'Error de conexión', type: 'error' }); }
    };

    // ─── Loading ───
    if (loading) return (
        <div className="v-dashboard">
            <PageHeader title="Configuración de Empresa" subtitle="Cargando..." />
            <ShimmerDashboard />
        </div>
    );

    return (
        <div className="v-dashboard">
            <PageHeader title="Configuración de Empresa" subtitle="Administra los detalles, datos de pago y seguridad de tu organización." />
            <Toast message={toast.message} type={toast.type} />

            {/* ═══════ LOGO & HEADER ═══════ */}
            <div className="glass-card v-section" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                    {logoPreview ? (
                        <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', border: '3px solid #2196f3' }}>
                            <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    ) : (
                        <ProfileAvatar src={profile.logo_url} name={profile.nombre || 'E'} size={72} borderRadius={999} bgColor="#2196f3" style={{ border: '3px solid #2196f3' }} />
                    )}
                    <label htmlFor="logo-upload" style={{
                        position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%',
                        background: '#2196f3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', border: '2px solid var(--bg, #fff)',
                    }}>
                        <FiCamera size={12} color="#fff" />
                    </label>
                    <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>{profile.nombre || 'Empresa'}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        NIT: {profile.nit || '—'} · {selectedCity?.name || profile.municipio || ''}{selectedDept ? `, ${selectedDept.name}` : profile.departamento ? `, ${profile.departamento}` : ''}
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 20, background: profile.estado === 'activo' ? 'rgba(76,175,80,0.12)' : 'rgba(255,152,0,0.12)', color: profile.estado === 'activo' ? '#4caf50' : '#ff9800', fontWeight: 600 }}>
                            {profile.estado === 'activo' ? 'Activa' : profile.estado}
                        </span>
                        <span style={{ fontSize: '0.72rem', padding: '3px 10px', borderRadius: 20, background: 'rgba(33,150,243,0.1)', color: '#2196f3', fontWeight: 600 }}>
                            Comisión: {Number(profile.comision_admin_porcentaje || 0).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* ═══════ 1. INFORMACIÓN BÁSICA ═══════ */}
            <Section title="Información Básica" icon={FiBriefcase} iconColor="#2196f3">
                <Grid cols={3}>
                    <Field label="Nombre de la Empresa" icon={FiBriefcase} value={profile.nombre} onChange={e => ch('nombre', e.target.value)} validate={V.required('El nombre')} />
                    <Field label="NIT / Documento" icon={FiFileText} value={profile.nit} onChange={e => ch('nit', e.target.value)} validate={V.nit} filter={F.nit} hint="Solo números y guión" />
                    <Field label="Razón Social" icon={FiShield} value={profile.razon_social} onChange={e => ch('razon_social', e.target.value)} validate={V.required('La razón social')} />
                </Grid>
            </Section>

            {/* ═══════ 2. CONTACTO ═══════ */}
            <Section title="Contacto" icon={FiPhone} iconColor="#9c27b0">
                <Grid cols={3}>
                    <Field label="Email Corporativo" icon={FiMail} type="email" value={profile.email} onChange={e => ch('email', e.target.value)} validate={V.email} />
                    <Field label="Teléfono Principal" icon={FiPhone} value={profile.telefono} onChange={e => ch('telefono', e.target.value)} validate={V.phone} filter={F.phone} />
                    <Field label="Teléfono Secundario" icon={FiPhone} value={profile.telefono_secundario} onChange={e => ch('telefono_secundario', e.target.value)} placeholder="Opcional" validate={V.phoneOpt} filter={F.phone} />
                </Grid>
            </Section>

            {/* ═══════ 3. UBICACIÓN ═══════ */}
            <Section title="Ubicación" icon={FiMapPin} iconColor="#ff5722" defaultOpen={false}>
                <Grid cols={3}>
                    <Field label="Dirección" icon={FiHome} value={profile.direccion} onChange={e => ch('direccion', e.target.value)} />
                    <SearchableModal
                        label="Departamento" icon={FiMap}
                        displayValue={selectedDept?.name || profile.departamento}
                        options={departments} loading={loadingDepts}
                        onSelect={handleDeptSelect}
                        renderOption={d => d.name}
                        placeholder="Seleccionar departamento..."
                    />
                    <SearchableModal
                        label="Municipio" icon={FiMapPin}
                        displayValue={selectedCity?.name || profile.municipio}
                        options={cities} loading={loadingCities}
                        onSelect={handleCitySelect}
                        renderOption={c => c.name}
                        placeholder={selectedDept ? 'Seleccionar municipio...' : 'Selecciona departamento primero'}
                        disabled={!selectedDept}
                    />
                </Grid>
            </Section>

            {/* ═══════ 4. REPRESENTANTE ═══════ */}
            <Section title="Representante Legal" icon={FiUser} iconColor="#4caf50" defaultOpen={false}>
                <Grid cols={3}>
                    <Field label="Nombre Completo" icon={FiUser} value={profile.representante_nombre} onChange={e => ch('representante_nombre', e.target.value)} validate={V.name('El representante')} filter={F.name} />
                    <Field label="Teléfono Directo" icon={FiPhone} value={profile.representante_telefono} onChange={e => ch('representante_telefono', e.target.value)} validate={V.phoneOpt} filter={F.phone} />
                    <Field label="Email Personal" icon={FiMail} value={profile.representante_email} onChange={e => ch('representante_email', e.target.value)} validate={V.emailOpt} />
                </Grid>
            </Section>

            {/* ═══════ 5. VEHÍCULOS ═══════ */}
            <Section title="Tipos de Vehículo" icon={FaMotorcycle} iconColor="#2196f3" defaultOpen={false}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>Habilita o deshabilita tipos</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Object.entries(VEHICLE_MAP).map(([key, cfg]) => {
                        const VIcon = cfg.icon;
                        const sel = (profile.tipos_vehiculo || []).includes(key);
                        return (
                            <div key={key} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 16,
                                border: sel ? `2px solid ${cfg.color}50` : '1px solid var(--border)',
                                background: sel ? `${cfg.color}10` : 'var(--v-glass-bg)',
                                transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: sel ? `${cfg.color}20` : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <VIcon size={22} color={sel ? cfg.color : 'var(--text-secondary)'} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', marginBottom: 2 }}>{cfg.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cfg.desc}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleVehicle(key)}
                                    type="button"
                                    style={{
                                        width: 52, height: 28, borderRadius: 14,
                                        background: sel ? '#2196f3' : 'transparent',
                                        border: sel ? 'none' : '2px solid var(--text-secondary)',
                                        cursor: 'pointer', position: 'relative',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute', top: sel ? 2 : 0, left: sel ? 26 : 0, width: sel ? 24 : 24, height: sel ? 24 : 24,
                                        borderRadius: '50%', background: sel ? '#fff' : 'var(--text-secondary)', transition: 'left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }} />
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 12, background: 'rgba(33,150,243,0.1)', border: '1px solid rgba(33,150,243,0.2)', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <FiInfo size={18} color="#2196f3" style={{ flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#2196f3' }}>
                        Al habilitar un tipo, se creará una configuración de tarifas para ese vehículo.
                    </p>
                </div>
            </Section>

            {/* ═══════ 6. DESCRIPCIÓN ═══════ */}
            <Section title="Descripción" icon={FiInfo} iconColor="#607d8b" defaultOpen={false}>
                <textarea className="v-form-input" rows={4} value={profile.descripcion || ''} onChange={e => ch('descripcion', e.target.value)}
                    placeholder="Breve descripción de tu empresa de transporte..." style={{ resize: 'vertical', width: '100%', minHeight: 80 }} />
            </Section>

            {/* ─── Guardar Perfil ─── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
                <button className="v-btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? <><FiRefreshCw className="v-spin" size={14} /> Guardando...</> : <><FiSave size={14} /> Guardar Perfil</>}
                </button>
            </div>

            {/* ═══════ 7. DATOS DE PAGO ═══════ */}
            <Section title="Datos de Pago / Bancarios" icon={FiCreditCard} iconColor="#e91e63" defaultOpen={false} badge="Financiero">
                <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: '0.8rem', marginBottom: 16, background: 'rgba(33,150,243,0.06)', borderLeft: '3px solid #2196f3', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiInfo size={14} style={{ flexShrink: 0 }} /> Estos datos se usan para las transferencias de liquidación. Cambios notifican al administrador.
                </div>
                <Grid cols={3}>
                    <SearchableModal
                        label="Banco" icon={FiCreditCard}
                        displayValue={selectedBank?.nombre || settings.banco_nombre}
                        options={banks} loading={loadingBanks}
                        onSelect={handleBankSelect}
                        renderOption={b => b.nombre}
                        placeholder="Seleccionar banco..."
                    />
                    <SearchableModal
                        label="Tipo de Cuenta" icon={FiCreditCard}
                        displayValue={settings.tipo_cuenta === 'corriente' ? 'Corriente' : settings.tipo_cuenta === 'ahorros' ? 'Ahorros' : settings.tipo_cuenta}
                        options={['ahorros', 'corriente']}
                        onSelect={v => chS('tipo_cuenta', v)}
                        renderOption={v => v === 'ahorros' ? 'Ahorros' : 'Corriente'}
                        placeholder="Seleccionar..."
                    />
                    <Field label="Número de Cuenta" icon={FiHash} value={settings.numero_cuenta} onChange={e => chS('numero_cuenta', e.target.value)} />
                </Grid>
                <div style={{ marginTop: 16 }}>
                    <Grid cols={3}>
                        <Field label="Titular de la Cuenta" icon={FiUser} value={settings.titular_cuenta} onChange={e => chS('titular_cuenta', e.target.value)} />
                        <Field label="Documento del Titular" icon={FiFileText} value={settings.documento_titular} onChange={e => chS('documento_titular', e.target.value)} />
                        <Field label="Referencia de Transferencia" icon={FiDollarSign} value={settings.referencia_transferencia} onChange={e => chS('referencia_transferencia', e.target.value)} placeholder="Opcional" />
                    </Grid>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <button className="v-btn-primary" onClick={handleSaveSettings} disabled={savingSettings}>
                        {savingSettings ? <><FiRefreshCw className="v-spin" size={14} /> Guardando...</> : <><FiSave size={14} /> Guardar Datos de Pago</>}
                    </button>
                </div>
            </Section>

            {/* ═══════ 8. SEGURIDAD — CAMBIO DE CONTRASEÑA CON OTP ═══════ */}
            <Section title="Seguridad — Cambiar Contraseña" icon={FiLock} iconColor="#f44336" defaultOpen={false}>
                {pwMsg.text && (
                    <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: '0.82rem', marginBottom: 16, background: pwMsg.type === 'error' ? 'rgba(244,67,54,0.08)' : 'rgba(76,175,80,0.08)', color: pwMsg.type === 'error' ? '#f44336' : '#4caf50', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {pwMsg.type === 'error' ? <FiAlertCircle size={14} /> : <FiCheck size={14} />}
                        {pwMsg.text}
                    </div>
                )}

                {pwStep === 'idle' && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                            Para cambiar tu contraseña, enviaremos un código de verificación a tu correo electrónico.
                        </p>
                        <button className="v-btn-primary" onClick={handleRequestCode}>
                            <FiSend size={14} /> Enviar Código de Verificación
                        </button>
                    </div>
                )}

                {pwStep === 'sending' && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                        <FiRefreshCw className="v-spin" size={24} />
                        <p style={{ marginTop: 12, fontSize: '0.85rem' }}>Enviando código de verificación...</p>
                    </div>
                )}

                {(pwStep === 'otp' || pwStep === 'newpw') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label className="v-form-label" style={{ fontSize: '0.82rem', marginBottom: 8, display: 'block' }}>
                                <FiMail size={13} style={{ opacity: 0.7, marginRight: 5 }} /> Código de Verificación
                            </label>
                            <OtpInput length={4} value={pwOtp} onChange={v => { setPwOtp(v); if (v.length === 4) setPwStep('newpw'); }} />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 8 }}>Ingresa el código de 4 dígitos enviado a tu correo.</p>
                        </div>

                        {pwStep === 'newpw' && (
                            <>
                                <Grid cols={2}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <label className="v-form-label" style={{ fontSize: '0.82rem', gap: 5, display: 'flex', alignItems: 'center' }}><FiLock size={13} style={{ opacity: 0.7 }} /> Nueva Contraseña</label>
                                        <div style={{ position: 'relative' }}>
                                            <input className="v-form-input" type={showNewPw ? 'text' : 'password'} value={pwNew} onChange={e => setPwNew(e.target.value)} placeholder="Mínimo 6 caracteres" style={{ width: '100%', paddingRight: 42 }} />
                                            <button onClick={() => setShowNewPw(p => !p)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}>
                                                {showNewPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <Field label="Confirmar Contraseña" icon={FiLock} type="password" value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} placeholder="Repite la nueva contraseña" />
                                </Grid>
                                {pwNew && pwConfirm && pwNew !== pwConfirm && (
                                    <p style={{ color: '#f44336', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}><FiAlertCircle size={14} /> Las contraseñas no coinciden</p>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                                    <button className="v-btn-primary" style={{ background: 'var(--text-secondary)', opacity: 0.7 }} onClick={() => { setPwStep('idle'); setPwOtp(''); setPwNew(''); setPwConfirm(''); setPwMsg({ text: '', type: 'success' }); }}>
                                        Cancelar
                                    </button>
                                    <button className="v-btn-primary" onClick={handleVerifyAndChange} disabled={!pwNew || pwNew !== pwConfirm || pwOtp.length < 4}>
                                        <FiLock size={14} /> Cambiar Contraseña
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {pwStep === 'saving' && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                        <FiRefreshCw className="v-spin" size={24} />
                        <p style={{ marginTop: 12, fontSize: '0.85rem' }}>Cambiando contraseña...</p>
                    </div>
                )}
            </Section>
        </div>
    );
};

export default EmpresaSettings;
