import React, { createContext, useContext, useMemo } from 'react';
import { ROLES, CLINICS_SCOPE } from '@/dashboard/shared/constants/adminConstants';
import { hasRolePermission } from '@/dashboard/shared/config/permissions';
import { useAuth } from '@/context/AuthContext';

const RoleContext = createContext(null);

export { ROLES, CLINICS_SCOPE };

export const RoleProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // Derive currentRole from the authenticated user's role field.
  // Falls back to the first role (Super Admin) if nothing matches.
  const currentRole = useMemo(() => {
    if (!currentUser?.role) return ROLES[0];
    return ROLES.find(r => r.id === currentUser.role) || ROLES[0];
  }, [currentUser]);

  const hasPermission = (permission) => {
    return hasRolePermission(currentRole.id, permission);
  };

  const userRole = currentRole.id;

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        userRole,
        roles: ROLES,
        activeClinic: CLINICS_SCOPE[0],
        clinicsScope: CLINICS_SCOPE,
        hasPermission,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
