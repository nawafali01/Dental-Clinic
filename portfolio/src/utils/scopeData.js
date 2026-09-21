import { SCOPE_TYPES, getResourceScope } from '@/dashboard/shared/config/permissions';
import { CLINICS, isSameClinic } from '@/constants/clinics';

/**
 * CENTRAL DATA SCOPING UTILITY (Row-Level Access Control)
 *
 * Filters raw mock records based on the current user's role and the active
 * selected clinic branch.
 *
 * This utility MUST be used by all pages, widgets, views, and domain services
 * before calculating summary metrics (cards), building tables, or rendering charts.
 *
 * Rules:
 *  - super_admin    ➔ GLOBAL (all orgs, all clinics, all records)
 *  - org_admin      ➔ ORGANIZATION (records in user's org / selected clinic)
 *  - clinic_manager ➔ CLINIC (records matching active selectedClinicId / clinicId)
 *  - agent          ➔ ASSIGNEE (records where assigneeId / assignedAgentId / agentId === currentUser.id)
 *  - receptionist   ➔ CLINIC (records matching clinicId for allowed resources, else empty)
 *  - finance        ➔ ORGANIZATION/CLINIC (revenue/payments for org/clinic, appointments read-only)
 *  - auditor        ➔ APPROVED (read-only records across clinic scope)
 *
 * @param {object} options
 * @param {string} options.resource           - Resource name (e.g. 'leads', 'tasks', 'appointments', 'calls', 'revenue', 'patients', 'reports')
 * @param {Array}  options.data               - Raw data array
 * @param {object} options.currentUser        - Current logged-in user object from AuthContext
 * @param {string} [options.selectedClinicId] - Optional selected clinic ID from ClinicContext
 * @returns {Array} Scoped dataset
 */
export function scopeData({ resource, data = [], currentUser, selectedClinicId }) {
  if (!Array.isArray(data)) return [];

  // Fallback to org_admin if currentUser is not yet loaded in context
  const user = (currentUser && currentUser.role)
    ? currentUser
    : {
        id: 'user-001',
        role: 'org_admin',
        organizationId: 'org-001',
        clinicId: 'clinic-downtown',
        clinicIds: ['clinic-downtown', 'clinic-west', 'clinic-003', 'clinic-004'],
      };

  const role = user.role;

  // Super Admin bypass — sees all data globally
  if (role === 'super_admin') return data;

  const scopeType = getResourceScope(role, resource);

  if (scopeType === SCOPE_TYPES.NONE) {
    if (resource === 'leads') return data;
    return [];
  }

  const userAssignedClinics = [
    ...(Array.isArray(user.assigned_clinics) ? user.assigned_clinics : []),
    ...(Array.isArray(user.assignedClinics) ? user.assignedClinics : []),
    ...(Array.isArray(user.clinicIds) ? user.clinicIds : []),
    ...(user.clinicId ? [user.clinicId] : []),
    ...(user.clinic_id ? [user.clinic_id] : []),
  ].filter(Boolean);

  // Active clinic scope: priority to selectedClinicId if set (and not 'all'), else user's primary clinic
  const activeClinicId =
    (selectedClinicId && selectedClinicId !== 'all')
      ? selectedClinicId
      : (userAssignedClinics[0] || user.clinicId || (user.clinicIds && user.clinicIds[0]));

  return data.filter((item) => {
    if (!item) return false;

    switch (scopeType) {
      case SCOPE_TYPES.GLOBAL:
        return true;

      case SCOPE_TYPES.ORGANIZATION: {
        const itemClinicId = item.clinicId || item.clinic_id;

        // Respect selected clinic filter if selected
        if (selectedClinicId && selectedClinicId !== 'all' && itemClinicId) {
          if (!isSameClinic(itemClinicId, selectedClinicId)) return false;
        }

        const userOrgId = user.organizationId || user.organization_id || (role === 'org_admin' || role === 'finance' || role === 'auditor' ? 'org-001' : null);

        // Resolve item's organization ID directly or from clinic registry
        let itemOrgId = item.orgId || item.organizationId || item.organization_id;
        if (!itemOrgId && itemClinicId) {
          const matchedClinic = CLINICS.find((c) => c.id === itemClinicId);
          if (matchedClinic) {
            itemOrgId = matchedClinic.orgId;
          }
        }

        if (userOrgId && itemOrgId) {
          return itemOrgId === userOrgId;
        }

        // If user belongs to an org, and item has clinicId that belongs to another org, reject
        if (userOrgId && itemClinicId) {
          const matchedClinic = CLINICS.find((c) => c.id === itemClinicId);
          if (matchedClinic && matchedClinic.orgId !== userOrgId) {
            return false;
          }
        }

        return true;
      }

      case SCOPE_TYPES.CLINIC: {
        const itemClinicId = item.clinicId || item.clinic_id || item.clinic;
        if (!itemClinicId) return false;

        // Clinic manager & Receptionist are strictly confined to their assigned clinic(s)
        if (userAssignedClinics.length > 0) {
          const matchesAssigned = userAssignedClinics.some((cId) =>
            itemClinicId === cId || isSameClinic(itemClinicId, cId)
          );
          if (!matchesAssigned) return false;
        }

        if (activeClinicId && activeClinicId !== 'all') {
          return itemClinicId === activeClinicId || isSameClinic(itemClinicId, activeClinicId);
        }

        return true;
      }

      case SCOPE_TYPES.ASSIGNEE: {
        // Agent MUST NEVER see another staff member's work.
        const userId = currentUser?.id || user?.id;
        if (!userId) return false;

        const matchesAssignee = Boolean(
          item.assignee_id === userId ||
          item.assigneeId === userId ||
          item.assignedAgentId === userId ||
          item.assigned_user_id === userId ||
          item.responsible_agent === userId ||
          item.agentId === userId ||
          item.doctorId === userId ||
          item.userId === userId ||
          item.assignedTo === userId ||
          item.assigned_to === userId
        );

        // If explicit clinic filter was selected (not 'all'), respect it
        const itemClinicId = item.clinicId || item.clinic_id;
        if (activeClinicId && activeClinicId !== 'all' && itemClinicId) {
          return matchesAssignee && isSameClinic(itemClinicId, activeClinicId);
        }

        return matchesAssignee;
      }

      case SCOPE_TYPES.APPROVED: {
        // Auditor read-only scope
        const itemClinicId = item.clinicId || item.clinic_id;
        if (activeClinicId && itemClinicId) {
          return itemClinicId === activeClinicId && item.status !== 'draft';
        }
        return item.status !== 'draft';
      }

      default:
        return true;
    }
  });
}
