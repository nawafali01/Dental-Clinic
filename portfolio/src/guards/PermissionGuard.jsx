import React from 'react';
import { usePermission } from '@/hooks/usePermission';

/**
 * PermissionGuard — action-level UI guard.
 *
 * Renders `children` only if the current user can perform `action` on
 * `resource`. Unauthorized content is removed from the DOM entirely
 * (not hidden via CSS visibility or display:none).
 *
 * This guard must be the authoritative way to conditionally render
 * write-action controls (Add, Edit, Delete, Approve, Assign, Export,
 * Import buttons/forms). Never replicate this logic in page components.
 *
 * @param {string}      resource  - e.g. 'appointments', 'leads', 'revenue'
 * @param {string}      action    - 'view' | 'create' | 'edit' | 'delete' |
 *                                  'approve' | 'assign' | 'export' | 'import'
 * @param {ReactNode}   children  - Content to render when allowed
 * @param {ReactNode}   [fallback=null] - Content to render when denied
 *
 * @example
 *   <PermissionGuard resource="appointments" action="create">
 *     <button>+ New Appointment</button>
 *   </PermissionGuard>
 *
 *   <PermissionGuard resource="revenue" action="export" fallback={<span>No export access</span>}>
 *     <ExportButton />
 *   </PermissionGuard>
 */
export const PermissionGuard = ({ resource, action, children, fallback = null }) => {
  const {
    canView,
    canCreate,
    canEdit,
    canDelete,
    canApprove,
    canAssign,
    canExport,
    canImport,
  } = usePermission();

  const ACTION_MAP = {
    view:    canView,
    create:  canCreate,
    edit:    canEdit,
    delete:  canDelete,
    approve: canApprove,
    assign:  canAssign,
    export:  canExport,
    import:  canImport,
  };

  const checkFn = ACTION_MAP[action];

  // Unknown action key — fail closed (safe default)
  if (!checkFn) {
    console.warn(`[PermissionGuard] Unknown action "${action}" for resource "${resource}".`);
    return fallback;
  }

  return checkFn(resource) ? <>{children}</> : fallback;
};
