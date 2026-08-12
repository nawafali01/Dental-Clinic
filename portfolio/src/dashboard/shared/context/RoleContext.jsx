import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ROLES, CLINICS_SCOPE } from '@/dashboard/shared/constants/adminConstants';
import { hasRolePermission, canDoAction, MULTI_CLINIC_ROLES } from '@/dashboard/shared/config/permissions';
import { useAuth } from '@/context/AuthContext';

const RoleContext = createContext(null);

export { ROLES, CLINICS_SCOPE };

export const RoleProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [activeClinic, setActiveClinic] = useState(CLINICS_SCOPE[0]);

  // Keep selectedRole in sync if currentUser changes (e.g., re-login)
  useEffect(() => {
    if (currentUser?.role) {
      const matched = ROLES.find((r) => r.id === currentUser.role);
      if (matched) setSelectedRole(matched);
    }
  }, [currentUser?.role]);

  const currentRole = useMemo(() => {
    if (selectedRole) return selectedRole;
    if (!currentUser?.role) return ROLES[0];
    return ROLES.find((r) => r.id === currentUser.role) || ROLES[0];
  }, [selectedRole, currentUser]);

  const setCurrentRole = (role) => {
    setSelectedRole(role);
  };

  const hasPermission = (permission) => hasRolePermission(currentRole.id, permission);

  const hasActionPermission = (resource, action) =>
    canDoAction(currentRole.id, resource, action);

  const canSwitchClinic = () => MULTI_CLINIC_ROLES.includes(currentRole.id);

  const userRole = currentRole.id;

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        userRole,
        roles: ROLES,
        activeClinic,
        setActiveClinic,
        clinicsScope: CLINICS_SCOPE,
        hasPermission,
        hasActionPermission,
        canSwitchClinic,
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
