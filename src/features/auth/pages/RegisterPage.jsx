import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import AuthInput from '../components/AuthInput';
import './AuthPage.css';

const RegisterPage = () => {
    const { register, loginWithGoogle, completeGooglePhone } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googlePendingUser, setGooglePendingUser] = useState(null);
    const [countryCode, setCountryCode] = useState('+57');
    const [requiredPhone, setRequiredPhone] = useState('');

    const countryCodes = [
        { code: '+57', label: '🇨🇴 +57' },
        { code: '+1', label: '🇺🇸 +1' },
        { code: '+52', label: '🇲🇽 +52' },
        { code: '+34', label: '🇪🇸 +34' },
        { code: '+54', label: '🇦🇷 +54' },
        { code: '+56', label: '🇨🇱 +56' },
        { code: '+51', label: '🇵🇪 +51' },
        { code: '+593', label: '🇪🇨 +593' },
        { code: '+58', label: '🇻🇪 +58' },
    ];

    const navigateByRole = (responseData) => {
        const role = responseData?.user?.tipo_usuario || responseData?.admin?.tipo_usuario;
        if (role === 'admin' || role === 'administrador') navigate('/admin');
        else if (role === 'cliente') navigate('/cliente');
        else if (role === 'conductor') navigate('/conductor');
        else if (role === 'empresa') navigate('/empresa');
        else navigate('/');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validations
        if (!formData.name || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        setError('');

        const res = await register({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            lastName: formData.lastName,
            phone: formData.phone,
            role: 'cliente'
        });

        if (res.success) {
            navigate('/'); // Redirect to home on success
        } else {
            // Support legacy response errors (when non-json returned or specific server formats)
            setError(res.message || 'Error al registrar la cuenta.');
        }

        setLoading(false);
    };

    const handleGoogleRegister = async () => {
        setLoading(true);
        setError('');

        const res = await loginWithGoogle();

        if (!res.success) {
            setError(res.message || 'No se pudo crear la cuenta con Google.');
            setLoading(false);
            return;
        }

        const requiresPhone = res?.data?.requires_phone ?? res?.data?.user?.requiere_telefono ?? false;
        const currentUser = res?.data?.user || null;

        if (requiresPhone && currentUser?.id) {
            setGooglePendingUser(currentUser);
            setLoading(false);
            return;
        }

        navigateByRole(res.data);
        setLoading(false);
    };

    const handleRequiredPhoneSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!googlePendingUser?.id) {
            setError('No se pudo identificar el usuario de Google.');
            return;
        }

        if (!requiredPhone.trim()) {
            setError('Ingresa tu número de teléfono para continuar.');
            return;
        }

        const fullPhone = `${countryCode}${requiredPhone.trim()}`;

        setLoading(true);
        const res = await completeGooglePhone({
            userId: googlePendingUser.id,
            phone: fullPhone,
        });

        if (!res.success) {
            setError(res.message || 'No se pudo guardar el teléfono.');
            setLoading(false);
            return;
        }

        navigateByRole({ user: res.user || googlePendingUser });
        setLoading(false);
    };

    if (googlePendingUser) {
        return (
            <div className="auth-page-container">
                <div className="auth-card register-card">
                    <h2 className="auth-title">Número de teléfono</h2>
                    <p className="auth-subtitle">
                        Completa tu teléfono para terminar tu registro con Google.
                    </p>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleRequiredPhoneSubmit} className="auth-form">
                        <div className="auth-select-wrapper">
                            <label className="auth-select-label">Código de país</label>
                            <select
                                className="auth-select"
                                value={countryCode}
                                onChange={(e) => setCountryCode(e.target.value)}
                            >
                                {countryCodes.map((item) => (
                                    <option key={item.code} value={item.code}>{item.label}</option>
                                ))}
                            </select>
                        </div>

                        <AuthInput
                            label="Teléfono"
                            type="tel"
                            placeholder="300 000 0000"
                            value={requiredPhone}
                            onChange={(e) => setRequiredPhone(e.target.value)}
                            icon="phone_iphone"
                        />

                        <button type="submit" className="auth-button" disabled={loading}>
                            {loading ? 'Guardando...' : 'Continuar'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page-container">
            <div className="auth-card register-card">
                <h2 className="auth-title">Crea tu cuenta</h2>
                <p className="auth-subtitle">Únete y comienza a viajar</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form-row">
                        <AuthInput
                            label="Nombre"
                            name="name"
                            placeholder="Juan"
                            value={formData.name}
                            onChange={handleChange}
                            icon="person"
                        />
                        <AuthInput
                            label="Apellido"
                            name="lastName"
                            placeholder="Pérez"
                            value={formData.lastName}
                            onChange={handleChange}
                            icon="badge"
                        />
                    </div>

                    <AuthInput
                        label="Correo Electrónico"
                        name="email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={handleChange}
                        icon="email"
                    />

                    <AuthInput
                        label="Teléfono Móvil"
                        name="phone"
                        type="tel"
                        placeholder="300 000 0000"
                        value={formData.phone}
                        onChange={handleChange}
                        icon="phone_iphone"
                    />

                    <div className="auth-form-row">
                        <AuthInput
                            label="Contraseña"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            icon="lock"
                        />
                        <AuthInput
                            label="Confirmar Contraseña"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            icon="lock_outline"
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>

                    <div className="auth-social-separator">
                        <span>o</span>
                    </div>

                    <button
                        type="button"
                        className="auth-button auth-button--secondary"
                        onClick={handleGoogleRegister}
                        disabled={loading}
                    >
                        <FcGoogle size={20} style={{ marginRight: '0.55rem' }} />
                        Crear cuenta con Google
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="auth-link">
                            Inicia Sesión
                        </Link>
                    </p>
                    <p className="auth-footer-divider">
                        ¿Deseas trabajar con nosotros?{' '}
                        <Link to="/register-company" className="auth-link">
                            Registrar Empresa
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
