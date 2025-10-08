import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to appropriate login page
  if (!isAuthenticated || !user) {
    // Determine which login page to redirect to based on the attempted route
    let loginPath = '/student-login'; // Default to student login
    
    if (location.pathname.startsWith('/admin')) {
      loginPath = '/admin-login';
    } else if (location.pathname.startsWith('/teacher')) {
      loginPath = '/teacher-login';
    } else if (location.pathname.startsWith('/parent')) {
      loginPath = '/parent-login';
    } else if (location.pathname.startsWith('/student')) {
      loginPath = '/student-login';
    }

    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check if user's role is allowed
  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on their actual role
    switch (user.role) {
      case UserRole.ADMIN:
        return <Navigate to="/admin/dashboard" replace />;
      case UserRole.TEACHER:
        return <Navigate to="/teacher/dashboard" replace />;
      case UserRole.STUDENT:
        return <Navigate to="/student/dashboard" replace />;
      case UserRole.PARENT:
        return <Navigate to="/parent/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // User is authenticated and has the correct role
  return <>{children}</>;
};

export default ProtectedRoute;
