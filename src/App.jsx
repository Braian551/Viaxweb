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
    <Routes>
      {/* ── Share location — standalone, no header/footer ── */}
      <Route path="/share/:token" element={<LocationSharePage />} />

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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </>
        }
      />
    </Routes>
  );
}
