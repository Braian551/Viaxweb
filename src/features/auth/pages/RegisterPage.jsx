import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";
import { checkUserExists, sendVerificationCode } from "../services/authService";
import AuthInput from "../components/AuthInput";
import OtpInput from "../components/OtpInput";
import { V, F } from "../../shared/utils/validators";
import "./AuthPage.css";

const RegisterPage = () => {
  const { register, loginWithGoogle, completeGooglePhone } = useAuth();
  const navigate = useNavigate();

  // Multistep State
  // step 1: Basic Info (Name, LastName, Email, Phone)
  // step 2: OTP Verification
  // step 3: Password & Confirm
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [generatedCode, setGeneratedCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Google required phone state
  const [googlePendingUser, setGooglePendingUser] = useState(null);
  const [countryCode, setCountryCode] = useState("+57");
  const [requiredPhone, setRequiredPhone] = useState("");

  const countryCodes = [
    { code: "+57", label: "🇨🇴 +57" },
    { code: "+1", label: "🇺🇸 +1" },
    { code: "+52", label: "🇲🇽 +52" },
    { code: "+34", label: "🇪🇸 +34" },
    { code: "+54", label: "🇦🇷 +54" },
    { code: "+56", label: "🇨🇱 +56" },
    { code: "+51", label: "🇵🇪 +51" },
    { code: "+593", label: "🇪🇨 +593" },
    { code: "+58", label: "🇻🇪 +58" },
  ];

  const navigateByRole = (responseData) => {
    const role =
      responseData?.user?.tipo_usuario || responseData?.admin?.tipo_usuario;
    if (role === "admin" || role === "administrador") navigate("/admin");
    else if (role === "cliente") navigate("/cliente");
    else if (role === "conductor") navigate("/conductor");
    else if (role === "empresa") navigate("/empresa");
    else navigate("/");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STEP 1: Basic Data forms ---
  const handleBasicInfoSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    const nErr = V.name('El nombre')(formData.name);
    const lnErr = V.name('El apellido')(formData.lastName);
    const emErr = V.email(formData.email);
    const phErr = V.phone(formData.phone);

    if (nErr || lnErr || emErr || phErr) {
      setError(nErr || lnErr || emErr || phErr);
      return;
    }

    setLoading(true);

    try {
      // Check if user already exists
      const existingUserCheck = await checkUserExists(formData.email);
      if (existingUserCheck.exists) {
        setError("Ya existe una cuenta con este correo electónico.");
        setLoading(false);
        return;
      }

      // Generate OTP and Send
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedCode(newCode);

      const sendResult = await sendVerificationCode(
        formData.email,
        newCode,
        formData.name,
      );

      if (sendResult && sendResult.success) {
        setStep(2); // Go to OTP Step
      } else {
        setError(
          sendResult?.message ||
          "Error al enviar código de verificación. Intenta nuevamente.",
        );
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: Verify OTP code ---
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError("");

    if (!enteredCode || enteredCode.length !== 4) {
      setError("El código debe tener 4 dígitos.");
      return;
    }

    setLoading(true);
    // Simulate minor delay matching user experience
    setTimeout(() => {
      if (enteredCode === generatedCode) {
        setStep(3); // Go to Password Step
      } else {
        setError("El código ingresado es incorrecto.");
      }
      setLoading(false);
    }, 800);
  };

  // --- STEP 3: Complete Registration ---
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Por favor, ingresa tu contraseña.");
      return;
    }

    const passErr = V.password(formData.password);
    if (passErr) {
      setError(passErr);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const res = await register({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      lastName: formData.lastName,
      phone: formData.phone,
      role: "cliente",
    });

    if (res.success) {
      navigate("/"); // Redirect to home on success
    } else {
      setError(res.message || "Error al registrar la cuenta.");
    }

    setLoading(false);
  };

  // --- GOOGLE SIGN IN ---
  const handleGoogleRegister = async () => {
    setLoading(true);
    setError("");

    const res = await loginWithGoogle();

    if (!res.success) {
      setError(res.message || "No se pudo crear la cuenta con Google.");
      setLoading(false);
      return;
    }

    const requiresPhone =
      res?.data?.requires_phone ?? res?.data?.user?.requiere_telefono ?? false;
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
    setError("");

    if (!googlePendingUser?.id) {
      setError("No se pudo identificar el usuario de Google.");
      return;
    }

    if (!requiredPhone.trim()) {
      setError("Ingresa tu número de teléfono para continuar.");
      return;
    }

    const phErr = V.phone(requiredPhone);
    if (phErr) {
      setError(phErr);
      return;
    }

    const fullPhone = `${countryCode}${requiredPhone.trim()}`;

    setLoading(true);
    const res = await completeGooglePhone({
      userId: googlePendingUser.id,
      phone: fullPhone,
    });

    if (!res.success) {
      setError(res.message || "No se pudo guardar el teléfono.");
      setLoading(false);
      return;
    }

    navigateByRole({ user: res.user || googlePendingUser });
    setLoading(false);
  };

  // --- UI RENDER: Google Phone Pending ---
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
                  <option key={item.code} value={item.code}>
                    {item.label}
                  </option>
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
              validate={V.phone}
              filter={F.phone}
            />

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Guardando..." : "Continuar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- UI RENDER: Multi-step form ---
  return (
    <div className="auth-page-container">
      <div className="auth-card register-card">
        <h2 className="auth-title">Crea tu cuenta</h2>
        <p className="auth-subtitle">
          {step === 1 && "Únete y comienza a viajar"}
          {step === 2 && `Ingresa el código enviado a ${formData.email}`}
          {step === 3 && "Protege tu cuenta con una contraseña segura"}
        </p>

        {error && <div className="auth-error">{error}</div>}

        {/* --- Form Step 1: Basic Info --- */}
        {step === 1 && (
          <form onSubmit={handleBasicInfoSubmit} className="auth-form">
            <div className="auth-form-row">
              <AuthInput
                label="Nombre"
                name="name"
                placeholder="Juan"
                value={formData.name}
                onChange={handleChange}
                icon="person"
                validate={V.name('El nombre')}
                filter={F.name}
              />
              <AuthInput
                label="Apellido"
                name="lastName"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={handleChange}
                icon="badge"
                validate={V.name('El apellido')}
                filter={F.name}
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
              validate={V.email}
            />

            <AuthInput
              label="Teléfono Móvil"
              name="phone"
              type="tel"
              placeholder="300 000 0000"
              value={formData.phone}
              onChange={handleChange}
              icon="phone_iphone"
              validate={V.phone}
              filter={F.phone}
            />

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Verificando..." : "Continuar"}
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
              <FcGoogle size={20} style={{ marginRight: "0.55rem" }} />
              Crear cuenta con Google
            </button>
          </form>
        )}

        {/* --- Form Step 2: OTP Verification --- */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "var(--text, #222)",
                }}
              >
                Código de Verificación (4 dígitos)
              </label>
              <OtpInput
                value={enteredCode}
                onChange={setEnteredCode}
                length={4}
              />
            </div>

            <button
              type="submit"
              className="auth-button btn-primary"
              disabled={loading}
            >
              {loading ? "Verificando..." : "Verificar Código"}
            </button>

            <div
              className="auth-actions"
              style={{ marginTop: "1rem", justifyContent: "center" }}
            >
              <button
                type="button"
                className="auth-forgot-link"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "normal",
                }}
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
              >
                Cambiar correo
              </button>
            </div>
          </form>
        )}

        {/* --- Form Step 3: Password Configuration --- */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="auth-form">
            <div className="auth-form-row">
              <AuthInput
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                icon="lock"
                validate={V.password}
              />
              <AuthInput
                label="Confirmar Contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon="lock_outline"
                validate={(v) => {
                  if (!v) return "Confirma tu contraseña";
                  if (v !== formData.password) return "Las contraseñas no coinciden";
                  return null;
                }}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Registrando..." : "Finalizar Registro"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="auth-link">
              Inicia Sesión
            </Link>
          </p>
          <p className="auth-footer-divider">
            ¿Deseas trabajar con nosotros?{" "}
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
