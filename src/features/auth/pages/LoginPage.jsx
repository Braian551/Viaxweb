import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import AuthInput from '../components/AuthInput';
import { V } from '../../shared/utils/validators';
import './AuthPage.css';

const LoginPage = () => {
    const { login, loginWithGoogle } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigateByRole = (responseData) => {
        const role = responseData?.user?.tipo_usuario || responseData?.admin?.tipo_usuario;
        if (role === 'admin' || role === 'administrador') window.location.assign('/admin');
        else if (role === 'soporte_tecnico') window.location.assign('/soporte');
        else if (role === 'cliente') window.location.assign('/cliente');
        else if (role === 'conductor') window.location.assign('/conductor');
        else if (role === 'empresa') window.location.assign('/empresa');
        else window.location.assign('/');
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

    const handleGoogleLogin = async (credential) => {
        setLoading(true);
        setError('');
        const res = await loginWithGoogle(credential);
        setLoading(false);
        if (!res.success) {
            setError(res.message || 'Error al iniciar sesión con Google.');
            return false;
        }
        if (res.data.requires_phone && res.data.user.tipo_usuario === 'cliente') {
            window.location.assign('/register?completar=telefono');
        } else {
            navigateByRole(res.data);
        }
        return true;
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

                    <GoogleSignInButton onCredential={handleGoogleLogin} disabled={loading} />
                </form>

                <div className="auth-footer">
                    ¿No tienes una cuenta? <Link to="/register" className="auth-link">Regístrate</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
