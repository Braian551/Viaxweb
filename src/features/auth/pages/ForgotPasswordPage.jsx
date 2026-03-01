import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiKey } from 'react-icons/fi';
import { checkUserExists, getProfileByEmail, requestPasswordResetCodeReal, requestPasswordResetCode, verifyPasswordResetCode, changePasswordWithCode } from '../services/authService';
import AuthInput from '../components/AuthInput';
import './AuthPage.css';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState(null);
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) return setError('Ingresa tu correo electrónico.');

        setLoading(true);
        // 1. Check if user exists
        const userCheck = await checkUserExists(email);
        if (!userCheck.exists) {
            setError('No existe una cuenta con ese correo electrónico.');
            setLoading(false);
            return;
        }

        // 1.5 Get profile to get user id
        const profileResponse = await getProfileByEmail(email);
        if (!profileResponse.success || !profileResponse.user || !profileResponse.user.id) {
            setError('No se pudo obtener el perfil del usuario.');
            setLoading(false);
            return;
        }

        const realUserId = profileResponse.user.id;
        setUserId(realUserId);

        // 2. Request OTP Code
        // Attempt using backend's real endpoint or fallback to email_service
        let resp = await requestPasswordResetCodeReal(realUserId);
        if (!resp || !resp.success) {
            // Fallback (older phpmailer flow)
            resp = await requestPasswordResetCode(email);
        }

        if (resp && resp.success) {
            setSuccessMsg('Código enviado exitosamente a tu correo.');
            setStep(2);
        } else {
            setError(resp?.message || 'Error al enviar el código de recuperación.');
        }
        setLoading(false);
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        if (!code || code.length !== 4) return setError('El código debe tener 4 dígitos.');

        setLoading(true);
        const resp = await verifyPasswordResetCode(userId, code);
        if (resp && resp.success) {
            setStep(3);
        } else {
            setError(resp?.message || 'Código inválido o ha expirado.');
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (!newPassword || newPassword.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');

        setLoading(true);
        const resp = await changePasswordWithCode(userId, newPassword, code);
        if (resp && resp.success) {
            setSuccessMsg('Contraseña actualizada con éxito. Redirigiendo...');
            setTimeout(() => navigate('/login'), 2500);
        } else {
            setError(resp?.message || 'No se pudo actualizar la contraseña.');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <h2 className="auth-title">Recuperar Contraseña</h2>
                <p className="auth-subtitle">
                    {step === 1 && 'Ingresa tu correo para recibir un código de verificación.'}
                    {step === 2 && 'Ingresa el código de 4 dígitos enviado a tu correo.'}
                    {step === 3 && 'Crea una nueva contraseña segura.'}
                </p>

                {error && <div className="auth-error">{error}</div>}
                {successMsg && <div className="auth-error" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#2e7d32', borderColor: 'rgba(76, 175, 80, 0.2)' }}>{successMsg}</div>}

                <form className="auth-form" onSubmit={step === 1 ? handleRequestCode : step === 2 ? handleVerifyCode : handleResetPassword}>
                    {step === 1 && (
                        <AuthInput
                            label="Correo Electrónico"
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            icon={<FiMail />}
                            required
                        />
                    )}

                    {step === 2 && (
                        <AuthInput
                            label="Código de Verificación (4 dígitos)"
                            type="number"
                            id="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value.slice(0, 4))}
                            placeholder="1234"
                            icon={<FiKey />}
                            required
                        />
                    )}

                    {step === 3 && (
                        <AuthInput
                            label="Nueva Contraseña"
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="********"
                            icon={<FiLock />}
                            required
                        />
                    )}

                    <button type="submit" className="auth-button btn-primary" disabled={loading}>
                        {loading ? 'Procesando...' : step === 1 ? 'Enviar Código' : step === 2 ? 'Verificar Código' : 'Actualizar Contraseña'}
                    </button>

                    {step === 1 && (
                        <div className="auth-actions" style={{ marginTop: '1rem', justifyContent: 'center' }}>
                            <Link to="/login" className="auth-forgot-link" style={{ fontWeight: 'normal' }}>
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
