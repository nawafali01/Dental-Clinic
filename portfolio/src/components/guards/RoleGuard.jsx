import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { hasRolePermission } from '@/dashboard/shared/config/permissions';

/**
 * Route & Component guard for Role-Based Access Control.
 * Checks abstract permissions against the centralized ROLE_PERMISSIONS configuration.
 *
 * If a user manually enters a URL they are not allowed to access, this guard
 * redirects them to the main dashboard (or renders a custom fallback element).
 *
 * @param {string} permission - The required permission key from PERMISSIONS
 * @param {ReactNode} children - Component to render if allowed
 * @param {ReactNode} [fallback] - Fallback element when denied (defaults to redirecting to /admin/dashboard)
 */
export const RoleGuard = ({ permission, children, fallback }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAllowed = permission ? hasRolePermission(currentUser.role, permission) : true;

  if (!isAllowed) {
    return fallback !== undefined ? fallback : <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};
