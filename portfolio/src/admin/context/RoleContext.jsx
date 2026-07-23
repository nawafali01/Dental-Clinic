import React, { createContext, useContext, useState } from 'react';
import { ROLES, CLINICS_SCOPE } from '../constants/adminConstants';
import { hasRolePermission } from '../config/permissions';

const RoleContext = createContext(null);

export { ROLES, CLINICS_SCOPE };

export const RoleProvider = ({ children }) => {
  // Roles supported: 'super_admin' or 'org_admin'
  const [currentRole, setCurrentRole] = useState(ROLES[0]); // Default to Super Admin
  const [activeClinic, setActiveClinic] = useState(CLINICS_SCOPE[0]);

  const hasPermission = (permission) => {
    return hasRolePermission(currentRole.id, permission);
  };

  const userRole = currentRole.id; // 'super_admin' | 'org_admin'

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
