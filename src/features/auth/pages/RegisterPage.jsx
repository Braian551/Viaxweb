import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthInput from '../components/AuthInput';
import './AuthPage.css';

const RegisterPage = () => {
    const { register } = useAuth();
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
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            icon="lock"
                        />
                        <AuthInput
                            label="Confirmar Contraseña"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            icon="lock_outline"
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
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
