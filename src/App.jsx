import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import RoleRoute from './components/routing/RoleRoute';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { ThemeProvider } from './features/shared/context/ThemeContext';
import GlobalScrollbar from './features/shared/components/GlobalScrollbar';
import { SnackbarProvider } from './features/shared/components/AppSnackbar';
import CookieConsentBanner from './features/shared/components/CookieConsentBanner';

const HomePage = lazy(() => import('./pages/HomePage'));
const ClientesPage = lazy(() => import('./pages/ClientesPage'));
const ConductoresPage = lazy(() => import('./pages/ConductoresPage'));
const EmpresasPage = lazy(() => import('./pages/EmpresasPage'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const EliminarCuentaPage = lazy(() => import('./pages/EliminarCuentaPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const LocationSharePage = lazy(() => import('./features/locationShare/pages/LocationSharePage'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage'));
const CompanyRegisterPage = lazy(() => import('./features/auth/pages/CompanyRegisterPage'));

const AdminLayout = lazy(() => import('./features/admin/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('./features/admin/pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./features/admin/pages/AdminUsers'));
const AdminCompanies = lazy(() => import('./features/admin/pages/AdminCompanies'));
const AdminFinances = lazy(() => import('./features/admin/pages/AdminFinances'));
const AdminCompanyPayments = lazy(() => import('./features/admin/pages/AdminCompanyPayments'));
const AdminAudit = lazy(() => import('./features/admin/pages/AdminAudit'));

const ClienteLayout = lazy(() => import('./features/cliente/layout/ClienteLayout'));
const ClienteDashboard = lazy(() => import('./features/cliente/pages/ClienteDashboard'));
const ClienteProfile = lazy(() => import('./features/cliente/pages/ClienteProfile'));

const ConductorLayout = lazy(() => import('./features/conductor/layout/ConductorLayout'));
const ConductorDashboard = lazy(() => import('./features/conductor/pages/ConductorDashboard'));
const ConductorEarnings = lazy(() => import('./features/conductor/pages/ConductorEarnings'));
const ConductorProfile = lazy(() => import('./features/conductor/pages/ConductorProfile'));

const EmpresaLayout = lazy(() => import('./features/empresa/layout/EmpresaLayout'));
const EmpresaDashboard = lazy(() => import('./features/empresa/pages/EmpresaDashboard'));
const EmpresaConductors = lazy(() => import('./features/empresa/pages/EmpresaConductors'));
const EmpresaFinances = lazy(() => import('./features/empresa/pages/EmpresaFinances'));
const EmpresaSettings = lazy(() => import('./features/empresa/pages/EmpresaSettings'));
const EmpresaTarifas = lazy(() => import('./features/empresa/pages/EmpresaTarifas'));
const EmpresaReports = lazy(() => import('./features/empresa/pages/EmpresaReports'));
const EmpresaCommissions = lazy(() => import('./features/empresa/pages/EmpresaCommissions'));
const EmpresaPlatformPayment = lazy(() => import('./features/empresa/pages/EmpresaPlatformPayment'));

const DashboardNotificationsPage = lazy(() => import('./features/shared/pages/DashboardNotificationsPage'));
const DashboardSupportPage = lazy(() => import('./features/shared/pages/DashboardSupportPage'));

function RouteLoader() {
  return (
    <main className="page-shell">
      <section className="page-hero">
        <span className="section__badge">Viax</span>
        <h1 className="page-hero__title">Cargando contenido...</h1>
        <p className="page-hero__subtitle">Estamos preparando la vista solicitada.</p>
      </section>
    </main>
  );
}

function withSuspense(node) {
  return <Suspense fallback={<RouteLoader />}>{node}</Suspense>;
}

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <RouteLoader />;

  if (user) {
    switch (user.tipo_usuario) {
      case 'admin':
      case 'administrador':
        return <Navigate to="/admin" replace />;
      case 'soporte_tecnico':
        return <Navigate to="/soporte" replace />;
      case 'cliente':
        return <Navigate to="/cliente" replace />;
      case 'conductor':
        return <Navigate to="/conductor" replace />;
      case 'empresa':
        return <Navigate to="/empresa" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <PublicLayout>{withSuspense(<HomePage />)}</PublicLayout>;
}

export default function App() {
  return (
    <ThemeProvider>
      <GlobalScrollbar />
      <SnackbarProvider>
        <AuthProvider>
          <CookieConsentBanner />
          <Routes>
            <Route path="/share/:token" element={withSuspense(<LocationSharePage />)} />

            <Route path="/login" element={<PublicLayout>{withSuspense(<LoginPage />)}</PublicLayout>} />
            <Route path="/register" element={<PublicLayout>{withSuspense(<RegisterPage />)}</PublicLayout>} />
            <Route path="/forgot-password" element={<PublicLayout>{withSuspense(<ForgotPasswordPage />)}</PublicLayout>} />
            <Route path="/register-company" element={<PublicLayout>{withSuspense(<CompanyRegisterPage />)}</PublicLayout>} />

            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={withSuspense(<AdminLayout />)}>
                <Route index element={withSuspense(<AdminDashboard />)} />
                <Route path="users" element={withSuspense(<AdminUsers />)} />
                <Route path="companies" element={withSuspense(<AdminCompanies />)} />
                <Route path="finances" element={withSuspense(<AdminFinances />)} />
                <Route path="company-payments" element={withSuspense(<AdminCompanyPayments />)} />
                <Route path="audit" element={withSuspense(<AdminAudit />)} />
                <Route path="notifications" element={withSuspense(<DashboardNotificationsPage roleType="admin" />)} />
                <Route path="support" element={withSuspense(<DashboardSupportPage roleType="admin" />)} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={['soporte_tecnico']} />}>
              <Route path="/soporte" element={withSuspense(<AdminLayout />)}>
                <Route index element={withSuspense(<DashboardSupportPage roleType="soporte_tecnico" />)} />
                <Route path="notifications" element={withSuspense(<DashboardNotificationsPage roleType="soporte_tecnico" />)} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={['cliente']} />}>
              <Route path="/cliente" element={withSuspense(<ClienteLayout />)}>
                <Route index element={withSuspense(<ClienteDashboard />)} />
                <Route path="profile" element={withSuspense(<ClienteProfile />)} />
                <Route path="notifications" element={withSuspense(<DashboardNotificationsPage roleType="cliente" />)} />
                <Route path="support" element={withSuspense(<DashboardSupportPage roleType="cliente" />)} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={['conductor']} />}>
              <Route path="/conductor" element={withSuspense(<ConductorLayout />)}>
                <Route index element={withSuspense(<ConductorDashboard />)} />
                <Route path="earnings" element={withSuspense(<ConductorEarnings />)} />
                <Route path="profile" element={withSuspense(<ConductorProfile />)} />
                <Route path="notifications" element={withSuspense(<DashboardNotificationsPage roleType="conductor" />)} />
                <Route path="support" element={withSuspense(<DashboardSupportPage roleType="conductor" />)} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={['empresa']} />}>
              <Route path="/empresa" element={withSuspense(<EmpresaLayout />)}>
                <Route index element={withSuspense(<EmpresaDashboard />)} />
                <Route path="conductors" element={withSuspense(<EmpresaConductors />)} />
                <Route path="finances" element={withSuspense(<EmpresaFinances />)} />
                <Route path="reports" element={withSuspense(<EmpresaReports />)} />
                <Route path="commissions" element={withSuspense(<EmpresaCommissions />)} />
                <Route path="platform-payment" element={withSuspense(<EmpresaPlatformPayment />)} />
                <Route path="tarifas" element={withSuspense(<EmpresaTarifas />)} />
                <Route path="settings" element={withSuspense(<EmpresaSettings />)} />
                <Route path="notifications" element={withSuspense(<DashboardNotificationsPage roleType="empresa" />)} />
                <Route path="support" element={withSuspense(<DashboardSupportPage roleType="empresa" />)} />
              </Route>
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="/clientes" element={<PublicLayout>{withSuspense(<ClientesPage />)}</PublicLayout>} />
            <Route path="/conductores" element={<PublicLayout>{withSuspense(<ConductoresPage />)}</PublicLayout>} />
            <Route path="/empresas" element={<PublicLayout>{withSuspense(<EmpresasPage />)}</PublicLayout>} />
            <Route path="/legal" element={<PublicLayout>{withSuspense(<LegalPage />)}</PublicLayout>} />
            <Route path="/eliminar-cuenta" element={<PublicLayout>{withSuspense(<EliminarCuentaPage />)}</PublicLayout>} />

            <Route path="*" element={<PublicLayout>{withSuspense(<NotFoundPage />)}</PublicLayout>} />
          </Routes>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
