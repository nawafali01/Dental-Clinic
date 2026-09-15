/**
 * Normalizes user objects from both the mock seed data and the real FastAPI backend.
 * Ensures consistent camelCase properties and standardized role names.
 */

export function normalizeRole(role) {
  if (!role) return 'receptionist'; // safe default
  const r = String(role).trim().toLowerCase();
  
  if (r === 'reception' || r === 'receptionist' || r === 'front_desk' || r === 'frontdesk') {
    return 'receptionist';
  }
  if (r === 'superadmin' || r === 'super_admin') {
    return 'super_admin';
  }
  if (r === 'orgadmin' || r === 'org_admin' || r === 'admin') {
    return 'org_admin';
  }
  if (r === 'clinicmanager' || r === 'clinic_manager' || r === 'manager') {
    return 'clinic_manager';
  }
  if (r === 'agent' || r === 'ai_agent') {
    return 'agent';
  }
  if (r === 'finance' || r === 'accountant') {
    return 'finance';
  }
  if (r === 'auditor' || r === 'audit') {
    return 'auditor';
  }
  return r;
}

export function normalizeUser(rawUser) {
  if (!rawUser) return null;

  const role = normalizeRole(rawUser.role);
  const clinicIds = rawUser.clinicIds || rawUser.assigned_clinics || [];
  const clinicId = rawUser.clinicId || (clinicIds.length > 0 ? clinicIds[0] : null);
  const organizationId = rawUser.organizationId || rawUser.organization_id || null;
  const name = rawUser.name || rawUser.full_name || rawUser.fullName || rawUser.email?.split('@')[0] || 'User';

  return {
    ...rawUser,
    role,
    name,
    fullName: name,
    organizationId,
    clinicId,
    clinicIds,
  };
}
