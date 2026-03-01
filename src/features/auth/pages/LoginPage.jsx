import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthInput from '../components/AuthInput';
import './AuthPage.css';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Por favor, completa todos los campos.');
            return;
        }

        setLoading(true);
        setError('');

        const res = await login(email, password);

        if (res.success) {
            navigate('/'); // Redirect to home on success
        } else {
            setError(res.message || 'Error al iniciar sesión.');
        }

        setLoading(false);
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <h2 className="auth-title">Bienvenido de nuevo</h2>
                <p className="auth-subtitle">Ingresa a tu cuenta para continuar</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <AuthInput
                        label="Correo Electrónico"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon="email"
                    />
                    <AuthInput
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon="lock"
                    />

                    <div className="auth-actions">
                        <Link to="/forgot-password" className="auth-forgot-link">¿Olvidaste tu contraseña?</Link>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="auth-footer">
                    ¿No tienes una cuenta? <Link to="/register" className="auth-link">Regístrate</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
