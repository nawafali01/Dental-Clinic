import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Route guard for Authentication logic.
 * Ensures the user is logged in, active, and redirects accordingly.
 */
export const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading, currentUser, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Disabled user -> Force logout and redirect
  if (currentUser.status === 'disabled') {
    // We call logout asynchronously, but immediately redirect.
    // In a real flow, you might want to show a message first.
    logout();
    return <Navigate to="/login" replace />;
  }

  // Invited user -> Must complete setup
  if (currentUser.status === 'invited') {
    // Check if they are already on the accept-invite page so we don't loop
    if (!location.pathname.includes('/accept-invite')) {
      return <Navigate to={`/accept-invite?token=${currentUser.inviteToken}`} replace />;
    }
  }

  // Active user -> Allow rendering children
  return children;
};
