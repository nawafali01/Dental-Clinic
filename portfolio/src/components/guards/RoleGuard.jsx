import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { hasRolePermission } from '@/dashboard/shared/config/permissions';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';

export const RoleGuard = ({ permission, children, fallback }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAllowed = permission ? hasRolePermission(currentUser.role, permission) : true;

  if (!isAllowed) {
    const defaultUrl = buildRoleUrl('/dashboard', currentUser?.role);
    return fallback !== undefined ? fallback : <Navigate to={defaultUrl} replace />;
  }

  return <>{children}</>;
};
