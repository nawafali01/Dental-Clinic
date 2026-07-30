import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../constants/permissions';

/**
 * Route & Component guard for Role-Based Access Control.
 * Instead of checking raw roles, this checks abstract permissions.
 * 
 * Usage:
 * <RoleGuard permission="invite_user">
 *   <Button>Invite</Button>
 * </RoleGuard>
 */
export const RoleGuard = ({ permission, children, fallback = null }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return fallback;
  }

  const isAllowed = hasPermission(currentUser.role, permission);

  if (!isAllowed) {
    return fallback;
  }

  return <>{children}</>;
};
