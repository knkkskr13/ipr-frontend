import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { FullPageSpinner } from '@/components/Spinner';

import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { EmployeeDashboardPage } from '@/pages/EmployeeDashboardPage';
import { MyReturnsPage } from '@/pages/MyReturnsPage';
import { IprReturnFormPage } from '@/pages/IprReturnFormPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { AdminReturnsPage } from '@/pages/AdminReturnsPage';
import { AdminReturnDetailPage } from '@/pages/AdminReturnDetailPage';
import { AdminEmployeesPage } from '@/pages/AdminEmployeesPage';
import { AdminNotificationsPage } from '@/pages/AdminNotificationsPage';

/** Sends an already-authenticated user to the dashboard for their role,
 *  used on "/" and to keep logged-in users away from /login and /register. */
function RoleHome() {
  const { role, isLoading } = useAuth();
  if (isLoading) return <FullPageSpinner />;
  return <Navigate to={role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} replace />;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <FullPageSpinner />;
  if (isAuthenticated) return <RoleHome />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* Employee */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <EmployeeDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-returns"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <MyReturnsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-returns/new"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <IprReturnFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-returns/:id"
        element={
          <ProtectedRoute allowedRoles={['EMPLOYEE']}>
            <IprReturnFormPage />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/returns"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminReturnsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/returns/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminReturnDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminEmployeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminNotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* Root + fallback */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <RoleHome />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
