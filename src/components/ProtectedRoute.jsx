import { Navigate } from 'react-router-dom';
import { isAuthenticated, getStoredRole } from '../utils/jwtHelper';

export default function ProtectedRoute({ children, allowedRole }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (allowedRole) {
    const role = getStoredRole();
    if (!role || role !== allowedRole) {
      const home = role === 'ADMIN' ? '/admin' : '/dashboard';
      return <Navigate to={home} replace />;
    }
  }
  return children;
}
