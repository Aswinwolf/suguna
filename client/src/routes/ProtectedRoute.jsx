import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/Loader.jsx';

/**
 * Route guard.
 * - adminOnly: shorthand for roles={['admin']} redirecting to /admin/login.
 * - roles: array of allowed roles (e.g. ['technician']). If the user is
 *   authenticated but lacks the role, they are sent to their own home.
 */
const ProtectedRoute = ({ children, adminOnly = false, roles = null }) => {
  const { isAuthenticated, isAdmin, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;

  const allowedRoles = roles || (adminOnly ? ['admin'] : null);

  if (!isAuthenticated) {
    const redirect = adminOnly ? '/admin/login' : '/login';
    return <Navigate to={redirect} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Send each role to a sensible landing page instead of a dead end.
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (role === 'technician') return <Navigate to="/technician" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
