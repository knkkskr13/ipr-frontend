import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import IprForm from './pages/IprForm';
import MySubmissions from './pages/MySubmissions';
import PreviousReturns from './pages/PreviousReturns';
import AdminDashboard from './pages/AdminDashboard';
import AdminEmployees from './pages/AdminEmployees';
import AdminIprView from './pages/AdminIprView';
import MyProfile from './pages/MyProfile';
import HelpSupport from './pages/HelpSupport';
import AdminNotifications from './pages/AdminNotifications'; // ← NEW

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Employee routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <HelpSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ipr/new"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <IprForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ipr/:id"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <IprForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissions"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <MySubmissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/previous-returns"
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <PreviousReturns />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminEmployees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ipr-returns"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ipr/:id"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminIprView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminNotifications />
            </ProtectedRoute>
          }
        />  {/* ← NEW */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
