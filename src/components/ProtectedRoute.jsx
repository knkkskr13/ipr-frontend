import { Navigate } from 'react-router-dom';
import { isAuthenticated, getCurrentUser } from '../utils/jwtHelper';

/**
 * Blocks unauthenticated access.
 * If `allowedRole` is provided, also checks the user's role.
 */
export default function ProtectedRoute({ children, allowedRole }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole) {
    const user = getCurrentUser();
    if (!user || user.role !== allowedRole) {
      // Redirect to appropriate home based on actual role
      const home = user?.role === 'ADMIN' ? '/admin' : '/dashboard';
      return <Navigate to={home} replace />;
    }
  }

  return children;
}
