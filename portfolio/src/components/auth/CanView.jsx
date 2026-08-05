import React from 'react';
import { hasPermission } from '../../utils/hasPermission';

/**
 * CanView
 * -------
 * Declarative, resource-based visibility guard for UI components.
 *
 * Checks permission via `hasPermission(permission)` directly
 * without requiring any role parameters.
 *
 * Usage:
 *   <CanView permission="users">
 *     <UsersWidget />
 *   </CanView>
 *
 * @param {string}      permission  - Resource or Action key (e.g. 'leads', 'audit_logs')
 * @param {ReactNode}   children    - Content to render when access is granted
 * @param {ReactNode}   [fallback]  - Optional element shown when access is denied (default: null)
 */
const CanView = ({ permission, children, fallback = null }) => {
  const isAllowed = hasPermission(permission);

  return isAllowed ? <>{children}</> : fallback;
};

export default CanView;
