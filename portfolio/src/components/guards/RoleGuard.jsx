import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { hasRolePermission } from '@/dashboard/shared/config/permissions';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';
import { normalizeRole } from '@/utils/normalizeUser';

export const RoleGuard = ({ permission, children, fallback }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = normalizeRole(currentUser.role);
  const isAllowed = permission ? hasRolePermission(role, permission) : true;

  if (!isAllowed) {
    const defaultUrl = buildRoleUrl('/dashboard', role);
    return fallback !== undefined ? fallback : <Navigate to={defaultUrl} replace />;
  }

  return <>{children}</>;
};
