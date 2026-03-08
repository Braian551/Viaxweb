import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import AuthInput from '../components/AuthInput';
import { V } from '../../shared/utils/validators';
import './AuthPage.css';

const LoginPage = () => {
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigateByRole = (responseData) => {
        const role = responseData?.user?.tipo_usuario || responseData?.admin?.tipo_usuario;
        if (role === 'admin' || role === 'administrador') navigate('/admin');
        else if (role === 'cliente') navigate('/cliente');
        else if (role === 'conductor') navigate('/conductor');
        else if (role === 'empresa') navigate('/empresa');
        else navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emErr = V.email(email);
        const passErr = V.required('La contraseña')(password);

        if (emErr || passErr) {
            setError(emErr || passErr);
            return;
        }

        setLoading(true);
        setError('');

        const res = await login(email, password);

        if (res.success) {
            navigateByRole(res.data);
        } else {
            setError(res.message || 'Error al iniciar sesión.');
        }

        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');

        const res = await loginWithGoogle();

        if (res.success) {
            navigateByRole(res.data);
        } else {
            setError(res.message || 'Error al iniciar sesión con Google.');
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
                        validate={V.email}
                    />
                    <AuthInput
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon="lock"
                        validate={V.required('La contraseña')}
                    />

                    <div className="auth-actions">
                        <Link to="/forgot-password" className="auth-forgot-link">¿Olvidaste tu contraseña?</Link>
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>

                    <div className="auth-social-separator">
                        <span>o</span>
                    </div>

                    <button
                        type="button"
                        className="auth-button auth-button--secondary"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                    >
                        <FcGoogle size={20} style={{ marginRight: '0.55rem' }} />
                        Continuar con Google
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
