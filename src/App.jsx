import React from 'react';
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
import RoleRoute from './components/routing/RoleRoute';
import { useAuth } from './features/auth/context/AuthContext';
import AdminLayout from './features/admin/layout/AdminLayout';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import AdminUsers from './features/admin/pages/AdminUsers';
import AdminCompanies from './features/admin/pages/AdminCompanies';
import AdminFinances from './features/admin/pages/AdminFinances';
import AdminCompanyPayments from './features/admin/pages/AdminCompanyPayments';
import AdminAudit from './features/admin/pages/AdminAudit';

// Cliente Dashboard
import ClienteLayout from './features/cliente/layout/ClienteLayout';
import ClienteDashboard from './features/cliente/pages/ClienteDashboard';
import ClienteProfile from './features/cliente/pages/ClienteProfile';
// Conductor Dashboard
import ConductorLayout from './features/conductor/layout/ConductorLayout';
import ConductorDashboard from './features/conductor/pages/ConductorDashboard';
import ConductorEarnings from './features/conductor/pages/ConductorEarnings';
import ConductorProfile from './features/conductor/pages/ConductorProfile';
// Empresa Dashboard
import EmpresaLayout from './features/empresa/layout/EmpresaLayout';
import EmpresaDashboard from './features/empresa/pages/EmpresaDashboard';
import EmpresaConductors from './features/empresa/pages/EmpresaConductors';
import EmpresaFinances from './features/empresa/pages/EmpresaFinances';
import EmpresaSettings from './features/empresa/pages/EmpresaSettings';
import EmpresaTarifas from './features/empresa/pages/EmpresaTarifas';
import EmpresaReports from './features/empresa/pages/EmpresaReports';
import EmpresaCommissions from './features/empresa/pages/EmpresaCommissions';
import EmpresaPlatformPayment from './features/empresa/pages/EmpresaPlatformPayment';
import { ThemeProvider } from './features/shared/context/ThemeContext';
import GlobalScrollbar from './features/shared/components/GlobalScrollbar';
import { SnackbarProvider } from './features/shared/components/AppSnackbar';
import DashboardNotificationsPage from './features/shared/pages/DashboardNotificationsPage';
import DashboardSupportPage from './features/shared/pages/DashboardSupportPage';

// Component to handle root redirection based on role
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    switch (user.tipo_usuario) {
      case 'admin':
      case 'administrador': return <Navigate to="/admin" replace />;
      case 'soporte_tecnico': return <Navigate to="/soporte" replace />;
      case 'cliente': return <Navigate to="/cliente" replace />;
      case 'conductor': return <Navigate to="/conductor" replace />;
      case 'empresa': return <Navigate to="/empresa" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  // Si no hay usuario, mostrar el home page público
  return (
    <>
      <Header />
      <main>
        <HomePage />
      </main>
      <Footer />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <GlobalScrollbar />
      <SnackbarProvider>
        <AuthProvider>
          <Routes>
          {/* ── Share location — standalone, no header/footer ── */}
          <Route path="/share/:token" element={<LocationSharePage />} />

          {/* ── Auth routes — standalone ── */}
          <Route path="/login" element={
            <>
              <Header />
              <LoginPage />
            </>
          } />
          <Route path="/register" element={
            <>
              <Header />
              <RegisterPage />
            </>
          } />
          <Route path="/forgot-password" element={
            <>
              <Header />
              <ForgotPasswordPage />
            </>
          } />
          <Route path="/register-company" element={
            <>
              <Header />
              <CompanyRegisterPage />
            </>
          } />

          {/* ── Protected Dashboards ────────────────────────────── */}

          {/* Admin */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="companies" element={<AdminCompanies />} />
              <Route path="finances" element={<AdminFinances />} />
              <Route path="company-payments" element={<AdminCompanyPayments />} />
              <Route path="audit" element={<AdminAudit />} />
              <Route path="notifications" element={<DashboardNotificationsPage roleType="admin" />} />
              <Route path="support" element={<DashboardSupportPage roleType="admin" />} />
            </Route>
          </Route>

          {/* Soporte Tecnico */}
          <Route element={<RoleRoute allowedRoles={['soporte_tecnico']} />}>
            <Route path="/soporte" element={<AdminLayout />}>
              <Route index element={<DashboardSupportPage roleType="soporte_tecnico" />} />
              <Route path="notifications" element={<DashboardNotificationsPage roleType="soporte_tecnico" />} />
            </Route>
          </Route>

          {/* Cliente */}
          <Route element={<RoleRoute allowedRoles={['cliente']} />}>
            <Route path="/cliente" element={<ClienteLayout />}>
              <Route index element={<ClienteDashboard />} />
              <Route path="profile" element={<ClienteProfile />} />
              <Route path="notifications" element={<DashboardNotificationsPage roleType="cliente" />} />
              <Route path="support" element={<DashboardSupportPage roleType="cliente" />} />
            </Route>
          </Route>

          {/* Conductor */}
          <Route element={<RoleRoute allowedRoles={['conductor']} />}>
            <Route path="/conductor" element={<ConductorLayout />}>
              <Route index element={<ConductorDashboard />} />
              <Route path="earnings" element={<ConductorEarnings />} />
              <Route path="profile" element={<ConductorProfile />} />
              <Route path="notifications" element={<DashboardNotificationsPage roleType="conductor" />} />
              <Route path="support" element={<DashboardSupportPage roleType="conductor" />} />
            </Route>
          </Route>

          {/* Empresa */}
          <Route element={<RoleRoute allowedRoles={['empresa']} />}>
            <Route path="/empresa" element={<EmpresaLayout />}>
              <Route index element={<EmpresaDashboard />} />
              <Route path="conductors" element={<EmpresaConductors />} />
              <Route path="finances" element={<EmpresaFinances />} />
              <Route path="reports" element={<EmpresaReports />} />
              <Route path="commissions" element={<EmpresaCommissions />} />
              <Route path="platform-payment" element={<EmpresaPlatformPayment />} />
              <Route path="tarifas" element={<EmpresaTarifas />} />
              <Route path="settings" element={<EmpresaSettings />} />
              <Route path="notifications" element={<DashboardNotificationsPage roleType="empresa" />} />
              <Route path="support" element={<DashboardSupportPage roleType="empresa" />} />
            </Route>
          </Route>

          {/* ── Main public site ────────────────────────────────────── */}
          <Route path="/" element={<RootRedirect />} />

          <Route
            path="*"
            element={
              <>
                <Header />
                <main>
                  <Routes>
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
      </SnackbarProvider>
    </ThemeProvider>
  );
}
