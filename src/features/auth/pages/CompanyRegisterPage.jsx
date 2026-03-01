import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiBriefcase, FiHash, FiFileText, FiMail, FiPhone, FiMapPin, FiUser, FiLock, FiTruck, FiCamera } from 'react-icons/fi';
import AuthInput from '../components/AuthInput';
import { AUTH_API_URL } from '../../../config/env';
import './AuthPage.css';

const CompanyRegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Multi-step form state
    const [step, setStep] = useState(1);

    // Form data modeled after Flutter's EmpresaFormData
    const [formData, setFormData] = useState({
        nombre: '',
        nit: '',
        razonSocial: '',
        email: '',
        telefono: '',
        telefonoSecundario: '',
        direccion: '',
        departamento: '',
        municipio: '',
        representanteNombre: '',
        representanteApellido: '',
        descripcion: '',
        password: '',
        confirmPassword: '',
        tiposVehiculo: []
    });

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [departments, setDepartments] = useState([]);
    const [municipalities, setMunicipalities] = useState([]);

    useEffect(() => {
        fetch('https://api-colombia.com/api/v1/Department')
            .then(res => res.json())
            .then(data => {
                const deps = data.sort((a, b) => a.name.localeCompare(b.name));
                setDepartments(deps);
            })
            .catch(err => console.error("Error fetching departments", err));
    }, []);

    const handleDepartmentChange = (e) => {
        const depName = e.target.value;
        const depInfo = departments.find(d => d.name === depName);

        setFormData({ ...formData, departamento: depName, municipio: '' });

        if (depInfo) {
            fetch(`https://api-colombia.com/api/v1/Department/${depInfo.id}/cities`)
                .then(res => res.json())
                .then(data => {
                    const muns = data.sort((a, b) => a.name.localeCompare(b.name));
                    setMunicipalities(muns);
                })
                .catch(err => console.error("Error fetching cities", err));
        } else {
            setMunicipalities([]);
        }
    };

    const handleLogoSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const vehicleOptions = ['moto', 'mototaxi', 'taxi', 'carro'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleVehicleToggle = (tipo) => {
        setFormData(prev => {
            const list = prev.tiposVehiculo;
            if (list.includes(tipo)) {
                return { ...prev, tiposVehiculo: list.filter(t => t !== tipo) };
            } else {
                return { ...prev, tiposVehiculo: [...list, tipo] };
            }
        });
    };

    const nextStep = (e) => {
        e.preventDefault();
        setError('');

        // Validation per step
        if (step === 1) {
            if (!formData.nombre || !formData.nit || !formData.razonSocial) {
                return setError('Completa los campos obligatorios de la empresa.');
            }
        } else if (step === 2) {
            if (!formData.email || !formData.telefono || !formData.direccion || !formData.departamento || !formData.municipio) {
                return setError('Completa los campos obligatorios de contacto y ubicación.');
            }
        } else if (step === 3) {
            if (!formData.representanteNombre || !formData.representanteApellido) {
                return setError('Ingresa los datos del representante.');
            }
            if (formData.password.length < 6) {
                return setError('La contraseña debe tener al menos 6 caracteres.');
            }
            if (formData.password !== formData.confirmPassword) {
                return setError('Las contraseñas no coinciden.');
            }
            if (formData.tiposVehiculo.length === 0) {
                return setError('Selecciona al menos un tipo de vehículo.');
            }
        }

        if (step < 3) setStep(step + 1);
        else handleSubmit(e);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let response;
            if (logoFile) {
                const formPayload = new FormData();
                Object.keys(formData).forEach(key => {
                    if (key === 'tiposVehiculo') {
                        formData[key].forEach(v => formPayload.append('tiposVehiculo[]', v));
                    } else if (formData[key] !== null && formData[key] !== '') {
                        formPayload.append(key, formData[key]);
                    }
                });
                formPayload.append('logo', logoFile);

                response = await fetch(`${AUTH_API_URL}/../empresa/register.php`, {
                    method: 'POST',
                    body: formPayload
                });
            } else {
                const payload = { ...formData };
                response = await fetch(`${AUTH_API_URL}/../empresa/register.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
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

    if (success) {
        return (
            <div className="auth-page-container">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <h2 className="auth-title" style={{ color: '#2e7d32' }}>¡Registro Exitoso!</h2>
                    <p className="auth-subtitle" style={{ marginTop: '1rem' }}>
                        Hemos recibido la información de <strong>{formData.nombre}</strong>.
                    </p>
                    <p style={{ marginBottom: '2rem', color: '#555' }}>
                        Un administrador revisará tus datos. Recibirás un correo de confirmación de PHPMailer en cuanto la empresa sea validada.
                    </p>
                    <button onClick={() => navigate('/login')} className="auth-button" style={{ width: '100%' }}>
                        Ir al Inicio de Sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page-container">
            <div className="auth-card register-card">
                <h2 className="auth-title">Registrar Empresa</h2>
                <p className="auth-subtitle">Paso {step} de 3 - Únete a la red Viax</p>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={step === 3 ? handleSubmit : nextStep}>

                    {step === 1 && (
                        <div className="step-content">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div
                                    onClick={() => fileInputRef.current.click()}
                                    style={{
                                        width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.03)',
                                        border: '2px dashed var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', overflow: 'hidden', position: 'relative'
                                    }}>
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FiCamera size={32} color="var(--primary)" />
                                    )}
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>Subir logo (Opcional)</span>
                                <input type="file" ref={fileInputRef} onChange={handleLogoSelect} accept="image/*" style={{ display: 'none' }} />
                            </div>

                            <AuthInput id="nombre" label="Nombre Comercial *" value={formData.nombre} onChange={handleChange} icon={<FiBriefcase />} placeholder="Ej. Transportes del Valle" required />
                            <AuthInput id="nit" label="NIT *" value={formData.nit} onChange={handleChange} icon={<FiHash />} placeholder="123456789-0" required />
                            <AuthInput id="razonSocial" label="Razón Social *" value={formData.razonSocial} onChange={handleChange} icon={<FiFileText />} placeholder="Transportes del Valle S.A.S" required />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="step-content">
                            <AuthInput id="email" type="email" label="Correo Corporativo *" value={formData.email} onChange={handleChange} icon={<FiMail />} placeholder="contacto@empresa.com" required />
                            <div className="auth-form-row">
                                <AuthInput id="telefono" type="tel" label="Teléfono (Principal) *" value={formData.telefono} onChange={handleChange} icon={<FiPhone />} placeholder="300 000 0000" required />
                                <AuthInput id="telefonoSecundario" type="tel" label="Teléfono Sec." value={formData.telefonoSecundario} onChange={handleChange} icon={<FiPhone />} placeholder="Opcional" />
                            </div>
                            <div className="auth-form-row" style={{ marginTop: '0.5rem' }}>
                                <div className="auth-input-wrapper" style={{ flex: 1, marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>Departamento *</label>
                                    <select id="departamento" className="auth-input-field" value={formData.departamento} onChange={handleDepartmentChange} required style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)', outline: 'none' }}>
                                        <option value="">Seleccionar</option>
                                        {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="auth-input-wrapper" style={{ flex: 1, marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>Municipio *</label>
                                    <select id="municipio" className="auth-input-field" value={formData.municipio} onChange={handleChange} required disabled={!formData.departamento} style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)', outline: 'none' }}>
                                        <option value="">Seleccionar</option>
                                        {municipalities.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <AuthInput id="direccion" label="Dirección de la Sede *" value={formData.direccion} onChange={handleChange} icon={<FiMapPin />} placeholder="Calle Falsa 123" required />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="step-content">
                            <div className="auth-input-wrapper" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '0.5rem' }}>Descripción (Opcional)</label>
                                <textarea id="descripcion" className="auth-input-field" value={formData.descripcion} onChange={handleChange} placeholder="Cuéntanos sobre los servicios que ofreces, sedes o historia de la empresa..." style={{ width: '100%', padding: '1rem', minHeight: '80px', resize: 'vertical', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.03)' }}></textarea>
                            </div>
                            <div className="auth-form-row">
                                <AuthInput id="representanteNombre" label="Nombre Representante *" value={formData.representanteNombre} onChange={handleChange} icon={<FiUser />} required />
                                <AuthInput id="representanteApellido" label="Apellido Representante *" value={formData.representanteApellido} onChange={handleChange} icon={<FiUser />} required />
                            </div>

                            <div className="auth-form-row">
                                <AuthInput id="password" type="password" label="Contraseña *" value={formData.password} onChange={handleChange} icon={<FiLock />} required />
                                <AuthInput id="confirmPassword" type="password" label="Confirmar *" value={formData.confirmPassword} onChange={handleChange} icon={<FiLock />} required />
                            </div>

                            <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#333' }}>
                                    Tipos de Vehículo Soportados *
                                </label>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {vehicleOptions.map(tipo => (
                                        <div
                                            key={tipo}
                                            onClick={() => handleVehicleToggle(tipo)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '20px',
                                                border: `2px solid ${formData.tiposVehiculo.includes(tipo) ? 'var(--primary)' : 'rgba(0,0,0,0.1)'}`,
                                                background: formData.tiposVehiculo.includes(tipo) ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                color: formData.tiposVehiculo.includes(tipo) ? 'var(--primary)' : '#555',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}
                                        >
                                            <FiTruck />
                                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="auth-button" style={{ flex: 1, backgroundColor: 'transparent', color: 'var(--primary)', border: '2px solid var(--primary)' }}>
                                Atrás
                            </button>
                        )}
                        <button type="button" onClick={nextStep} className="auth-button" disabled={loading} style={{ flex: 2 }}>
                            {loading ? 'Procesando...' : step < 3 ? 'Siguiente' : 'Completar Registro'}
                        </button>
                    </div>

                    <div className="auth-footer">
                        ¿Trabajas como cliente?{' '}
                        <Link to="/register" className="auth-link">
                            Registro de Usuario
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyRegisterPage;
