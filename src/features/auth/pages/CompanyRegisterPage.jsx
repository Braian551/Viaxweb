import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FiBriefcase, FiHash, FiFileText, FiMail, FiPhone, FiMapPin,
    FiUser, FiLock, FiCamera, FiChevronRight, FiChevronLeft,
    FiCheck, FiAlertCircle, FiHome, FiMap, FiEye, FiEyeOff, FiShield
} from 'react-icons/fi';
import { FaMotorcycle, FaTaxi, FaCarSide } from 'react-icons/fa6';
import { MdOutlineElectricRickshaw } from 'react-icons/md';
import AuthInput from '../components/AuthInput';
import SearchableModal from '../../shared/components/SearchableModal';
import { AUTH_API_URL } from '../../../config/env';
import { getDepartments, getCitiesByDepartment } from '../../empresa/services/empresaService';
import './AuthPage.css';

/* ─── Validators ─── */
const V = {
    required: (label) => (v) => !v?.trim() ? `${label} es requerido` : null,
    email: (v) => {
        if (!v?.trim()) return 'El email es requerido';
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) ? null : 'Email inválido';
    },
    nit: (v) => {
        if (!v) return null; // optional
        return /^[0-9-]+$/.test(v) ? null : 'Solo números y guión';
    },
    phone: (v) => {
        if (!v?.trim()) return 'El teléfono es requerido';
        if (v.replace(/\D/g, '').length < 7) return 'Mínimo 7 dígitos';
        return null;
    },
    phoneOpt: (v) => {
        if (!v) return null;
        if (v.replace(/\D/g, '').length < 7) return 'Mínimo 7 dígitos';
        return null;
    },
    password: (v) => {
        if (!v) return 'La contraseña es requerida';
        if (v.length < 6) return 'Mínimo 6 caracteres';
        return null;
    },
    name: (label) => (v) => {
        if (!v?.trim()) return `${label} es requerido`;
        if (/[0-9]/.test(v)) return 'No se permiten números';
        return null;
    },
    emailOpt: (v) => {
        if (!v) return null;
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v) ? null : 'Email inválido';
    },
};

/* ─── Filters (restrict input characters) ─── */
const F = {
    nit: (v) => v.replace(/[^0-9-]/g, ''),
    phone: (v) => v.replace(/[^0-9 +]/g, ''),
    name: (v) => v.replace(/[0-9]/g, ''),
};

/* ─── Vehicle config (same as EmpresaSettings/Tarifas) ─── */
const VEHICLE_CONFIG = {
    moto: { label: 'Moto', icon: FaMotorcycle, color: '#2196f3', desc: 'Domicilios y mensajería' },
    mototaxi: { label: 'Mototaxi', icon: MdOutlineElectricRickshaw, color: '#ff9800', desc: 'Transporte de pasajeros' },
    taxi: { label: 'Taxi', icon: FaTaxi, color: '#ffc107', desc: 'Servicio de taxi urbano' },
    carro: { label: 'Carro', icon: FaCarSide, color: '#4caf50', desc: 'Vehículo particular' },
};

/* ─── Step labels ─── */
const STEPS = [
    { label: 'Empresa', icon: FiBriefcase },
    { label: 'Vehículos', icon: FaMotorcycle },
    { label: 'Contacto', icon: FiMail },
    { label: 'Representante', icon: FiUser },
    { label: 'Seguridad', icon: FiShield },
];

const CompanyRegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Form data — snake_case aligned with backend
    const [formData, setFormData] = useState({
        nombre_empresa: '',
        nit: '',
        razon_social: '',
        email: '',
        telefono: '',
        telefono_secundario: '',
        direccion: '',
        departamento: '',
        municipio: '',
        representante_nombre: '',
        representante_apellido: '',
        representante_telefono: '',
        representante_email: '',
        descripcion: '',
        password: '',
        confirmPassword: '',
        tipos_vehiculo: [],
    });

    // Logo
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Location data
    const [departments, setDepartments] = useState([]);
    const [cities, setCities] = useState([]);
    const [loadingDepts, setLoadingDepts] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);

    // Field-level errors
    const [fieldErrors, setFieldErrors] = useState({});

    // ─── Load departments on mount ───
    useEffect(() => {
        (async () => {
            setLoadingDepts(true);
            try {
                const d = await getDepartments();
                setDepartments(d);
            } catch { /* ignore */ }
            finally { setLoadingDepts(false); }
        })();
    }, []);

    // ─── Handlers ───
    const ch = (field, value) => {
        setFormData(p => ({ ...p, [field]: value }));
        setFieldErrors(p => ({ ...p, [field]: '' }));
        setError('');
    };

    const handleChange = (e) => ch(e.target.id, e.target.value);

    const handleDeptSelect = useCallback(async (dept) => {
        setSelectedDept(dept);
        setSelectedCity(null);
        ch('departamento', dept.name);
        ch('municipio', '');
        setCities([]);
        setLoadingCities(true);
        try {
            const c = await getCitiesByDepartment(dept.id);
            setCities(c);
        } catch { /* ignore */ }
        finally { setLoadingCities(false); }
    }, []);

    const handleCitySelect = useCallback((city) => {
        setSelectedCity(city);
        ch('municipio', city.name);
    }, []);

    const handleLogoSelect = (e) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                setError('El logo no debe superar 5MB');
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const toggleVehicle = (tipo) => {
        setFormData(prev => {
            const list = prev.tipos_vehiculo;
            return {
                ...prev,
                tipos_vehiculo: list.includes(tipo)
                    ? list.filter(t => t !== tipo)
                    : [...list, tipo]
            };
        });
        setFieldErrors(p => ({ ...p, tipos_vehiculo: '' }));
        setError('');
    };

    // ─── Validation ───
    const validateStep = () => {
        const errs = {};
        setError('');

        if (step === 0) {
            const e1 = V.required('El nombre')(formData.nombre_empresa);
            if (e1) errs.nombre_empresa = e1;

            const e2 = V.required('La razón social')(formData.razon_social);
            if (e2) errs.razon_social = e2;

            const eNit = V.nit(formData.nit);
            if (eNit) errs.nit = eNit;
        }
        if (step === 1) {
            if (formData.tipos_vehiculo.length === 0) {
                setError('Selecciona al menos un tipo de vehículo');
                return false;
            }
        }
        if (step === 2) {
            const eEmail = V.email(formData.email);
            if (eEmail) errs.email = eEmail;

            const eTel = V.phone(formData.telefono);
            if (eTel) errs.telefono = eTel;

            const eTel2 = V.phoneOpt(formData.telefono_secundario);
            if (eTel2) errs.telefono_secundario = eTel2;

            const eDir = V.required('La dirección')(formData.direccion);
            if (eDir) errs.direccion = eDir;

            if (!formData.departamento) errs.departamento = 'Selecciona un departamento';
            if (!formData.municipio) errs.municipio = 'Selecciona un municipio';
        }
        if (step === 3) {
            const eNom = V.name('El nombre')(formData.representante_nombre);
            if (eNom) errs.representante_nombre = eNom;

            const eApe = V.name('El apellido')(formData.representante_apellido);
            if (eApe) errs.representante_apellido = eApe;

            const eEmailP = V.email(formData.representante_email); // Now required
            if (eEmailP) errs.representante_email = eEmailP;

            const eTel = V.phoneOpt(formData.representante_telefono);
            if (eTel) errs.representante_telefono = eTel;
        }
        if (step === 4) {
            const ePass = V.password(formData.password);
            if (ePass) errs.password = ePass;

            if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
                errs.confirmPassword = 'Las contraseñas no coinciden';
            }
        }

        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            setError(Object.values(errs)[0]);
            return false;
        }
        return true;
    };

    const nextStep = (e) => {
        e?.preventDefault();
        if (!validateStep()) return;
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else handleSubmit(e);
    };

    const prevStep = () => { setStep(s => s - 1); setError(''); };

    // ─── Submit ───
    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!validateStep()) return;
        setLoading(true);
        setError('');

        try {
            const isMultipart = !!logoFile;
            let response;

            if (isMultipart) {
                const fd = new FormData();
                fd.append('action', 'register');
                fd.append('nombre_empresa', formData.nombre_empresa);
                fd.append('email', formData.email);
                fd.append('telefono', formData.telefono);
                fd.append('representante_nombre', formData.representante_nombre);
                fd.append('representante_apellido', formData.representante_apellido);
                fd.append('password', formData.password);
                fd.append('device_uuid', 'web-' + Date.now());

                // Optionals
                if (formData.nit) fd.append('nit', formData.nit);
                if (formData.razon_social) fd.append('razon_social', formData.razon_social);
                if (formData.telefono_secundario) fd.append('telefono_secundario', formData.telefono_secundario);
                if (formData.direccion) fd.append('direccion', formData.direccion);
                if (formData.municipio) fd.append('municipio', formData.municipio);
                if (formData.departamento) fd.append('departamento', formData.departamento);
                if (formData.representante_telefono) fd.append('representante_telefono', formData.representante_telefono);
                if (formData.representante_email) fd.append('representante_email', formData.representante_email);
                if (formData.descripcion) fd.append('descripcion', formData.descripcion);
                if (formData.tipos_vehiculo.length > 0) {
                    fd.append('tipos_vehiculo', JSON.stringify(formData.tipos_vehiculo));
                }
                fd.append('logo', logoFile);

                response = await fetch(`${AUTH_API_URL}/../empresa/register.php`, {
                    method: 'POST',
                    body: fd,
                });
            } else {
                const payload = {
                    action: 'register',
                    nombre_empresa: formData.nombre_empresa,
                    email: formData.email,
                    telefono: formData.telefono,
                    representante_nombre: formData.representante_nombre,
                    representante_apellido: formData.representante_apellido,
                    password: formData.password,
                    device_uuid: 'web-' + Date.now(),
                };
                if (formData.nit) payload.nit = formData.nit;
                if (formData.razon_social) payload.razon_social = formData.razon_social;
                if (formData.telefono_secundario) payload.telefono_secundario = formData.telefono_secundario;
                if (formData.direccion) payload.direccion = formData.direccion;
                if (formData.municipio) payload.municipio = formData.municipio;
                if (formData.departamento) payload.departamento = formData.departamento;
                if (formData.representante_telefono) payload.representante_telefono = formData.representante_telefono;
                if (formData.representante_email) payload.representante_email = formData.representante_email;
                if (formData.descripcion) payload.descripcion = formData.descripcion;
                if (formData.tipos_vehiculo.length > 0) payload.tipos_vehiculo = formData.tipos_vehiculo;

                response = await fetch(`${AUTH_API_URL}/../empresa/register.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
            }

            const data = await response.json();
            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || 'Error al registrar la empresa.');
            }
        } catch (err) {
            console.error(err);
            setError('Error de red. Verifica tu conexión.');
        } finally {
            setLoading(false);
        }
    };

    // ═══════ SUCCESS SCREEN ═══════
    if (success) {
        return (
            <div className="auth-page-container">
                <div className="auth-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
                        background: 'rgba(76,175,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FiCheck size={36} color="#4caf50" />
                    </div>
                    <h2 className="auth-title" style={{ color: '#4caf50' }}>¡Registro Exitoso!</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '12px 0 8px', fontSize: '0.92rem', lineHeight: 1.6 }}>
                        Hemos recibido la información de <strong style={{ color: 'var(--text)' }}>{formData.nombre_empresa}</strong>.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', margin: '0 0 28px', fontSize: '0.85rem', lineHeight: 1.6 }}>
                        Un administrador revisará tus datos. Recibirás un correo de confirmación en cuanto la empresa sea validada.
                    </p>
                    <button onClick={() => navigate('/login')} className="auth-button" style={{ width: '100%' }}>
                        Ir al Inicio de Sesión
                    </button>
                </div>
            </div>
        );
    }

    // ═══════ MAIN FORM ═══════
    return (
        <div className="auth-page-container">
            <div className="auth-card register-card" style={{ maxWidth: 540 }}>
                <h2 className="auth-title">Registrar Empresa</h2>

                {/* ─── Step Progress ─── */}
                <div className="cr-progress">
                    {STEPS.map((s, i) => {
                        const StepIcon = s.icon;
                        const isDone = i < step;
                        const isActive = i === step;
                        return (
                            <div key={i} className="cr-progress-item">
                                <div className={`cr-progress-dot ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                                    {isDone ? <FiCheck size={12} /> : <StepIcon size={12} />}
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`cr-progress-line ${isDone ? 'done' : ''}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
                <p className="auth-subtitle" style={{ marginBottom: 6 }}>
                    Paso {step + 1} de {STEPS.length} — {STEPS[step].label}
                </p>

                {/* ─── Error Toast ─── */}
                {error && (
                    <div className="auth-error" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FiAlertCircle size={16} /> {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={nextStep}>

                    {/* ═══ STEP 0: Info Empresa ═══ */}
                    {step === 0 && (
                        <div className="step-content cr-step-anim">
                            <div className="company-logo-upload" style={{ marginBottom: 8 }}>
                                <div onClick={() => fileInputRef.current.click()} className="company-logo-circle">
                                    {logoPreview
                                        ? <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        : <FiCamera size={30} color="var(--primary)" />
                                    }
                                </div>
                                <span className="company-logo-caption">
                                    {logoPreview ? 'Cambiar logo' : 'Subir logo (Opcional)'}
                                </span>
                                <input type="file" ref={fileInputRef} onChange={handleLogoSelect} accept="image/*" style={{ display: 'none' }} />
                            </div>
                            <AuthInput id="nombre_empresa" label="Nombre Comercial *" value={formData.nombre_empresa} onChange={handleChange} icon={<FiBriefcase />} placeholder="Ej. Transportes del Valle" validate={V.required('El nombre')} />
                            <AuthInput id="nit" label="NIT" value={formData.nit} onChange={handleChange} icon={<FiHash />} placeholder="123456789-0" validate={V.nit} filter={F.nit} hint="Solo números y guión (ej: 900123456-1)" />
                            <AuthInput id="razon_social" label="Razón Social *" value={formData.razon_social} onChange={handleChange} icon={<FiFileText />} placeholder="Transportes del Valle S.A.S" validate={V.required('La razón social')} />
                        </div>
                    )}

                    {/* ═══ STEP 1: Vehículos ═══ */}
                    {step === 1 && (
                        <div className="step-content cr-step-anim">
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
                                Selecciona los tipos de transporte que tu empresa ofrece.
                            </p>
                            <div className="cr-vehicle-grid">
                                {Object.entries(VEHICLE_CONFIG).map(([key, cfg]) => {
                                    const VIcon = cfg.icon;
                                    const sel = formData.tipos_vehiculo.includes(key);
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => toggleVehicle(key)}
                                            className={`cr-vehicle-card ${sel ? 'selected' : ''}`}
                                            style={{
                                                '--vc-color': cfg.color,
                                                '--vc-bg': `${cfg.color}12`,
                                                '--vc-border': sel ? cfg.color : 'var(--border, #e2e8f0)',
                                            }}
                                        >
                                            <div className="cr-vehicle-icon-wrap">
                                                <VIcon size={28} color={sel ? cfg.color : 'var(--text-secondary)'} />
                                            </div>
                                            <span className="cr-vehicle-label">{cfg.label}</span>
                                            <span className="cr-vehicle-desc">{cfg.desc}</span>
                                            {sel && (
                                                <div className="cr-vehicle-check" style={{ background: cfg.color }}>
                                                    <FiCheck size={12} color="#fff" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ═══ STEP 2: Contacto & Ubicación ═══ */}
                    {step === 2 && (
                        <div className="step-content cr-step-anim">
                            <AuthInput id="email" type="email" label="Correo Corporativo *" value={formData.email} onChange={handleChange} icon={<FiMail />} placeholder="contacto@empresa.com" validate={V.email} />
                            <div className="auth-form-row">
                                <AuthInput id="telefono" type="tel" label="Teléfono *" value={formData.telefono} onChange={handleChange} icon={<FiPhone />} placeholder="300 000 0000" validate={V.phone} filter={F.phone} />
                                <AuthInput id="telefono_secundario" type="tel" label="Tel. Secundario" value={formData.telefono_secundario} onChange={handleChange} icon={<FiPhone />} placeholder="Opcional" validate={V.phoneOpt} filter={F.phone} />
                            </div>
                            <div className="auth-form-row">
                                <SearchableModal
                                    label="Departamento"
                                    icon={FiMap}
                                    displayValue={selectedDept?.name || formData.departamento}
                                    options={departments}
                                    loading={loadingDepts}
                                    onSelect={handleDeptSelect}
                                    renderOption={d => d.name}
                                    placeholder="Seleccionar departamento..."
                                    required
                                    error={fieldErrors.departamento}
                                />
                                <SearchableModal
                                    label="Municipio"
                                    icon={FiMapPin}
                                    displayValue={selectedCity?.name || formData.municipio}
                                    options={cities}
                                    loading={loadingCities}
                                    onSelect={handleCitySelect}
                                    renderOption={c => c.name}
                                    placeholder={selectedDept ? 'Seleccionar municipio...' : 'Primero elige depto.'}
                                    disabled={!selectedDept}
                                    required
                                    error={fieldErrors.municipio}
                                />
                            </div>
                            <AuthInput id="direccion" label="Dirección de la Sede *" value={formData.direccion} onChange={handleChange} icon={<FiHome />} placeholder="Calle 123 # 45-67" validate={V.required('La dirección')} />
                        </div>
                    )}

                    {/* ═══ STEP 3: Representante ═══ */}
                    {step === 3 && (
                        <div className="step-content cr-step-anim">
                            <div className="auth-form-row">
                                <AuthInput id="representante_nombre" label="Nombre *" value={formData.representante_nombre} onChange={handleChange} icon={<FiUser />} placeholder="Juan" validate={V.name('El nombre')} filter={F.name} />
                                <AuthInput id="representante_apellido" label="Apellido *" value={formData.representante_apellido} onChange={handleChange} icon={<FiUser />} placeholder="Pérez" validate={V.name('El apellido')} filter={F.name} />
                            </div>
                            <AuthInput id="representante_telefono" label="Teléfono Directo" value={formData.representante_telefono} onChange={handleChange} icon={<FiPhone />} placeholder="Opcional" validate={V.phoneOpt} filter={F.phone} />
                            <AuthInput id="representante_email" label="Email Personal *" value={formData.representante_email} onChange={handleChange} icon={<FiMail />} placeholder="juan.perez@email.com" validate={V.email} />
                        </div>
                    )}

                    {/* ═══ STEP 4: Seguridad ═══ */}
                    {step === 4 && (
                        <div className="step-content cr-step-anim">
                            <div style={{ marginBottom: 16 }}>
                                <label className="auth-select-label" style={{ marginBottom: 8, display: 'block' }}>Descripción (Opcional)</label>
                                <textarea
                                    id="descripcion"
                                    className="auth-textarea"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Cuéntanos sobre los servicios que ofreces..."
                                    rows={3}
                                />
                            </div>
                            <AuthInput id="password" type="password" label="Contraseña *" value={formData.password} onChange={handleChange} icon={<FiLock />} placeholder="Mínimo 6 caracteres" validate={V.password} />
                            <AuthInput id="confirmPassword" type="password" label="Confirmar Contraseña *" value={formData.confirmPassword} onChange={handleChange} icon={<FiLock />} placeholder="Repetir contraseña" validate={(v) => {
                                if (!v) return 'Confirma tu contraseña';
                                if (v !== formData.password) return 'Las contraseñas no coinciden';
                                return null;
                            }} />
                        </div>
                    )}

                    {/* ─── Actions ─── */}
                    <div className="auth-step-actions" style={{ gap: 10 }}>
                        {step > 0 && (
                            <button type="button" onClick={prevStep} className="auth-button auth-button--secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <FiChevronLeft size={16} /> Atrás
                            </button>
                        )}
                        <button type="submit" className="auth-button" disabled={loading} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            {loading
                                ? 'Procesando...'
                                : step < STEPS.length - 1
                                    ? <>Siguiente <FiChevronRight size={16} /></>
                                    : <>Completar Registro <FiCheck size={16} /></>
                            }
                        </button>
                    </div>

                    <div className="auth-footer">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="auth-link">Iniciar Sesión</Link>
                        {' · '}
                        <Link to="/register" className="auth-link">Registro de Usuario</Link>
                    </div>
                </form>
            </div>

            {/* Inline styles for this page */}
            <style>{`
                .cr-progress {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0;
                    margin: 4px 0 12px;
                }
                .cr-progress-item {
                    display: flex;
                    align-items: center;
                }
                .cr-progress-dot {
                    width: 30px; height: 30px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    border: 2px solid var(--border, #e2e8f0);
                    color: var(--text-secondary);
                    background: transparent;
                    transition: all 0.3s ease;
                    flex-shrink: 0;
                }
                .cr-progress-dot.active {
                    border-color: #2196f3;
                    color: #2196f3;
                    background: rgba(33,150,243,0.08);
                    box-shadow: 0 0 0 4px rgba(33,150,243,0.1);
                }
                .cr-progress-dot.done {
                    border-color: #4caf50;
                    background: #4caf50;
                    color: #fff;
                }
                .cr-progress-line {
                    width: 28px; height: 2px;
                    background: var(--border, #e2e8f0);
                    transition: background 0.3s ease;
                    margin: 0 2px;
                }
                .cr-progress-line.done {
                    background: #4caf50;
                }

                .cr-step-anim {
                    animation: crFadeSlide 0.3s ease;
                }
                @keyframes crFadeSlide {
                    from { opacity: 0; transform: translateX(12px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Vehicle grid */
                .cr-vehicle-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                @media (max-width: 420px) {
                    .cr-vehicle-grid { grid-template-columns: 1fr; }
                }
                .cr-vehicle-card {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    padding: 20px 14px 16px;
                    border-radius: 14px;
                    border: 2px solid var(--vc-border);
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    text-align: center;
                    color: var(--text);
                    font-family: inherit;
                }
                .cr-vehicle-card:hover {
                    border-color: var(--vc-color);
                    background: var(--vc-bg);
                }
                .cr-vehicle-card.selected {
                    border-color: var(--vc-color);
                    background: var(--vc-bg);
                }
                .cr-vehicle-icon-wrap {
                    width: 52px; height: 52px; border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    background: var(--vc-bg);
                    transition: background 0.2s;
                }
                .cr-vehicle-label {
                    font-weight: 700; font-size: 0.92rem;
                }
                .cr-vehicle-desc {
                    font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3;
                }
                .cr-vehicle-check {
                    position: absolute; top: 8px; right: 8px;
                    width: 22px; height: 22px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    animation: crPop 0.2s ease;
                }
                @keyframes crPop {
                    from { transform: scale(0); }
                    to { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default CompanyRegisterPage;
