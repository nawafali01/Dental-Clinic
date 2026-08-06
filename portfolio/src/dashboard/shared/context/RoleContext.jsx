import React, { createContext, useContext, useMemo } from 'react';
import { ROLES, CLINICS_SCOPE } from '@/dashboard/shared/constants/adminConstants';
import { hasRolePermission, canDoAction, MULTI_CLINIC_ROLES } from '@/dashboard/shared/config/permissions';
import { useAuth } from '@/context/AuthContext';

const RoleContext = createContext(null);

export { ROLES, CLINICS_SCOPE };

export const RoleProvider = ({ children }) => {
  const { currentUser } = useAuth();

  /**
   * Derive currentRole from the authenticated user's role field.
   * The ROLES array now includes all 7 roles including 'auditor'.
   * Falls back to the first role (Super Admin) if nothing matches —
   * this should only happen in development/misconfiguration scenarios.
   */
  const currentRole = useMemo(() => {
    if (!currentUser?.role) return ROLES[0];
    return ROLES.find((r) => r.id === currentUser.role) || ROLES[0];
  }, [currentUser]);

  /**
   * Check if the current role has a coarse-grained permission key.
   * Use this for route guards (RoleGuard) and sidebar filtering.
   *
   * @param {string} permission - e.g. PERMISSIONS.VIEW_REVENUE
   */
  const hasPermission = (permission) => hasRolePermission(currentRole.id, permission);

  /**
   * Check if the current role can perform a specific action on a resource.
   * Use this for action-level UI controls (add/edit/delete buttons).
   * Prefer the usePermission() hook in components — this is exposed here
   * for convenience when already inside a RoleContext consumer.
   *
   * @param {string} resource - e.g. 'appointments'
   * @param {string} action   - e.g. 'create'
   */
  const hasActionPermission = (resource, action) =>
    canDoAction(currentRole.id, resource, action);

  /** True when the current role is allowed to switch clinic branches. */
  const canSwitchClinic = () => MULTI_CLINIC_ROLES.includes(currentRole.id);

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
