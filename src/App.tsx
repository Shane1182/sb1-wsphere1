import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { LoginForm } from './components/auth/LoginForm';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { TenantAdminDashboard } from './components/dashboard/TenantAdminDashboard';
import { StaffDashboard } from './components/dashboard/StaffDashboard';
import { NEDDashboard } from './components/dashboard/NEDDashboard';
import { PlatformDashboard } from './pages/platform/PlatformDashboard';
import { TenantManager } from './pages/platform/TenantManager';
import { ModulePage } from './pages/ModulePage';
import { useAuthStore } from './store/authStore';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function DashboardRouter() {
  const user = useAuthStore((state) => state.user);

  switch (user?.role) {
    case 'platform_admin':
      return <PlatformDashboard />;
    case 'tenant_admin':
      return <TenantAdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'ned':
      return <NEDDashboard />;
    default:
      return <Navigate to="/login" />;
  }
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route
              path="/login"
              element={
                <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
                  <LoginForm />
                </div>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardRouter />
                </PrivateRoute>
              }
            />
            <Route
              path="/platform/tenants/:tenantId"
              element={
                <PrivateRoute>
                  <TenantManager />
                </PrivateRoute>
              }
            />
            <Route
              path="/module/:moduleId"
              element={
                <PrivateRoute>
                  <ModulePage />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}