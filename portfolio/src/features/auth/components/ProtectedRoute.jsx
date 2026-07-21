import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { ROLES } from "../constants/authConstants";

/**
 * Route protection guard for authenticated views.
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-3">
        <LoadingSpinner size="lg" classNameColor="text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Verifying credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    let redirectPath = "/login";
    if (location.pathname.startsWith("/super-admin")) {
      redirectPath = "/super-admin-login";
    } else if (location.pathname.startsWith("/admin")) {
      redirectPath = "/admin-login";
    }
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    let fallbackPath = "/dashboard";
    if (user.role === ROLES.SUPER_ADMIN) {
      fallbackPath = "/super-admin/dashboard";
    } else if (user.role === ROLES.ADMIN) {
      fallbackPath = "/admin/dashboard";
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

export default ProtectedRoute;
