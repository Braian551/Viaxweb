import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ClientesPage from './pages/ClientesPage';
import ConductoresPage from './pages/ConductoresPage';
import EmpresasPage from './pages/EmpresasPage';
import LegalPage from './pages/LegalPage';
import LocationSharePage from './features/locationShare/pages/LocationSharePage';
import { AuthProvider } from './features/auth/context/AuthContext';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage';
import CompanyRegisterPage from './features/auth/pages/CompanyRegisterPage';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('viax-theme');
    return stored ? stored === 'dark' : false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('viax-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <AuthProvider>
      <Routes>
        {/* ── Share location — standalone, no header/footer ── */}
        <Route path="/share/:token" element={<LocationSharePage />} />

        {/* ── Auth routes — standalone, but can include header if desired ── */}
        <Route path="/login" element={
          <>
            <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
            <LoginPage />
          </>
        } />
        <Route path="/register" element={
          <>
            <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
            <RegisterPage />
          </>
        } />
        <Route path="/forgot-password" element={
          <>
            <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
            <ForgotPasswordPage />
          </>
        } />
        <Route path="/register-company" element={
          <>
            <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
            <CompanyRegisterPage />
          </>
        } />

        {/* ── Main site ────────────────────────────────────── */}
        <Route
          path="*"
          element={
            <>
              <Header isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/conductores" element={<ConductoresPage />} />
                  <Route path="/empresas" element={<EmpresasPage />} />
                  <Route path="/legal" element={<LegalPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
