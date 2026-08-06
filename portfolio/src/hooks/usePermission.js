import { useRole } from '@/dashboard/shared/context/RoleContext';
import { canDoAction, MULTI_CLINIC_ROLES } from '@/dashboard/shared/config/permissions';

/**
 * usePermission
 *
 * The single hook that every component should use to check what
 * the current user is allowed to do.
 *
 * Rules:
 *  - Never check raw role names (e.g. `role === 'finance'`) in components.
 *  - Always use these helpers: canView(), canCreate(), canEdit(), etc.
 *  - All checks delegate to the centralized ACTION_PERMISSIONS config in
 *    `src/dashboard/shared/config/permissions.js`.
 *
 * Backend-ready: When a real backend is available, replace `canDoAction`
 * with an API call (e.g. `useQuery(['can', resource, action])`).
 *
 * @example
 *   const { canCreate, canDelete } = usePermission();
 *   // In JSX:
 *   {canCreate('appointments') && <button>+ New Appointment</button>}
 *   {canDelete('appointments') && <button>Delete</button>}
 */
export const usePermission = () => {
  const { userRole } = useRole();

  /** Can the user view / read records of this resource? */
  const canView = (resource) => canDoAction(userRole, resource, 'view');

  /** Can the user create new records for this resource? */
  const canCreate = (resource) => canDoAction(userRole, resource, 'create');

  /** Can the user update existing records for this resource? */
  const canEdit = (resource) => canDoAction(userRole, resource, 'edit');

  /** Can the user permanently delete records of this resource? */
  const canDelete = (resource) => canDoAction(userRole, resource, 'delete');

  /** Can the user approve pending records for this resource? */
  const canApprove = (resource) => canDoAction(userRole, resource, 'approve');

  /** Can the user assign records of this resource to others? */
  const canAssign = (resource) => canDoAction(userRole, resource, 'assign');

  /** Can the user export (download) data for this resource? */
  const canExport = (resource) => canDoAction(userRole, resource, 'export');

  /** Can the user bulk-import data for this resource? */
  const canImport = (resource) => canDoAction(userRole, resource, 'import');

  /** Can the user switch between clinic branches? */
  const canSwitchClinic = () => Boolean(userRole && MULTI_CLINIC_ROLES.includes(userRole));

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    canApprove,
    canAssign,
    canExport,
    canImport,
    canSwitchClinic,
    /** Expose the raw role only for display/debug purposes — never for permission checks. */
    userRole,
  };
};
