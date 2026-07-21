import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { ROLES } from "../constants/authConstants";

/**
 * Route filter for anonymous access (e.g. login screens).
 * Automatically redirects signed-in accounts to their home destinations.
 */
export function PublicRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-3">
        <LoadingSpinner size="lg" classNameColor="text-primary" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Synchronizing session status...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    let dashboardPath = "/dashboard";
    if (user.role === ROLES.SUPER_ADMIN) {
      dashboardPath = "/super-admin/dashboard";
    } else if (user.role === ROLES.ADMIN) {
      dashboardPath = "/admin/dashboard";
    }
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}

export default PublicRoute;
