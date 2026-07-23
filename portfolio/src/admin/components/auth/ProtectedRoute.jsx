import React from 'react';
import { useRole } from '../../context/RoleContext';
import AccessRestrictedView from '../../views/AccessRestrictedView';

export const ProtectedRoute = ({ requiredPermission, children }) => {
  const { hasPermission } = useRole();

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessRestrictedView requiredPermission={requiredPermission} />;
  }

  return children;
};
