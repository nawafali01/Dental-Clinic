import React from 'react';
import { useRole } from '@/dashboard/shared/context/RoleContext';
import AccessRestrictedView from '@/dashboard/shared/components/feedback/AccessRestrictedView';

export const ProtectedRoute = ({ requiredPermission, children }) => {
  const { hasPermission } = useRole();

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessRestrictedView requiredPermission={requiredPermission} />;
  }

  return children;
};
