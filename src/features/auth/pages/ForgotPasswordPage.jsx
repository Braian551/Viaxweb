import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiKey } from 'react-icons/fi';
import { checkUserExists, getProfileByEmail, requestPasswordResetCodeReal, requestPasswordResetCode, verifyPasswordResetCode, changePasswordWithCode } from '../services/authService';
import AuthInput from '../components/AuthInput';
import OtpInput from '../components/OtpInput';
import { V } from '../../shared/utils/validators';
import './AuthPage.css';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState(null);
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleRequestCode = async (e) => {
        e.preventDefault();
        setError('');

        const emErr = V.email(email);
        if (emErr) return setError(emErr);

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
        let resp = await requestPasswordResetCodeReal(realUserId);
        if (!resp || !resp.success) {
            // Fallback (older phpmailer flow)
            resp = await requestPasswordResetCode(email);
        }

        if (resp && resp.success) {
            setSuccessMsg('Código enviado exitosamente a tu correo.');
            setStep(2);
        } else {
            // Extract a user-friendly message from the response
            let msg = resp?.message || 'Error al enviar el código de recuperación.';
            // Handle cases where message is a JSON string
            if (typeof msg === 'string' && msg.trim().startsWith('{')) {
                try { msg = JSON.parse(msg).message || msg; } catch { /* use as-is */ }
            }
            // Handle known error codes
            if (resp?.error_code === 'EMAIL_SEND_BLOCKED' || msg.includes('EMAIL_SEND_BLOCKED')) {
                msg = 'El servicio de correo está temporalmente limitado. Intenta de nuevo en unos minutos.';
            }
            // If msg still looks like raw JSON, use fallback
            if (typeof msg === 'object') {
                msg = msg.message || 'Error al enviar el código de recuperación.';
            }
            setError(msg);
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

        const passErr = V.password(newPassword);
        const confirmErr = V.confirmPassword(confirmPassword, newPassword);

        if (passErr) return setError(passErr);
        if (confirmErr) return setError(confirmErr);

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
                            validate={V.email}
                            required
                        />
                    )}

                    {step === 2 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text, #222)' }}>
                                Código de Verificación (4 dígitos)
                            </label>
                            <OtpInput value={code} onChange={setCode} length={4} />
                        </div>
                    )}

                    {step === 3 && (
                        <>
                            <AuthInput
                                label="Nueva Contraseña"
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                icon={<FiLock />}
                                validate={V.password}
                                required
                            />
                            <div style={{ marginTop: '1.25rem' }}>
                                <AuthInput
                                    label="Confirmar Contraseña"
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    icon={<FiLock />}
                                    validate={(v) => V.confirmPassword(v, newPassword)}
                                    required
                                />
                            </div>
                        </>
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
