/**
 * Helper to get URL base path prefix for a user role.
 *
 * @param {string} role - User role string (e.g. 'agent', 'receptionist', 'clinic_manager', 'super_admin')
 * @returns {string} Base path without slashes (e.g. 'agent', 'manager', 'receptionist', 'admin')
 */
export function getRoleBaseUrl(role) {
  if (!role) return 'admin';

  switch (role) {
    case 'agent':
      return 'agent';
    case 'receptionist':
      return 'receptionist';
    case 'clinic_manager':
    case 'manager':
      return 'manager';
    case 'super_admin':
    case 'org_admin':
    case 'finance':
    case 'auditor':
    default:
      return 'admin';
  }
}

/**
 * Returns full path prefixed with current role's base URL.
 *
 * @param {string} relativePath - Path without leading role prefix (e.g. '/leads', 'leads/101', '/dashboard')
 * @param {string} role - User role string
 * @returns {string} Formatted full URL path (e.g. '/agent/leads')
 */
export function buildRoleUrl(relativePath = '', role = 'admin') {
  const base = getRoleBaseUrl(role);
  const cleanPath = String(relativePath).replace(/^\/(admin|manager|agent|receptionist)\/?/, '').replace(/^\//, '');
  return `/${base}/${cleanPath}`;
}
