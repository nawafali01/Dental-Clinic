import { SCOPE_TYPES, getResourceScope } from '@/dashboard/shared/config/permissions';

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
  if (!currentUser || !currentUser.role) return [];

  const role = currentUser.role;

  // Super Admin bypass — sees all data globally
  if (role === 'super_admin') return data;

  const scopeType = getResourceScope(role, resource);

  if (scopeType === SCOPE_TYPES.NONE) {
    return [];
  }

  // Active clinic scope: priority to selectedClinicId if set (and not 'all'), else currentUser's primary clinic
  const activeClinicId =
    (selectedClinicId && selectedClinicId !== 'all')
      ? selectedClinicId
      : (currentUser.clinicId || (currentUser.clinicIds && currentUser.clinicIds[0]));

  return data.filter((item) => {
    if (!item) return false;

    switch (scopeType) {
      case SCOPE_TYPES.GLOBAL:
        return true;

      case SCOPE_TYPES.ORGANIZATION: {
        // Respect selected clinic filter if selected
        const itemClinicId = item.clinicId || item.clinic_id;
        if (selectedClinicId && selectedClinicId !== 'all' && itemClinicId) {
          if (itemClinicId !== selectedClinicId) return false;
        }
        // Match organizationId if present on record
        if (currentUser.organizationId && (item.orgId || item.organizationId || item.organization_id)) {
          const itemOrgId = item.orgId || item.organizationId || item.organization_id;
          return itemOrgId === currentUser.organizationId;
        }
        return true;
      }

      case SCOPE_TYPES.CLINIC: {
        if (!activeClinicId) return true;
        const itemClinicId = item.clinicId || item.clinic_id;
        if (itemClinicId) return itemClinicId === activeClinicId;
        if (item.clinic) return item.clinic === activeClinicId || item.clinic.includes(activeClinicId);
        return true;
      }

      case SCOPE_TYPES.ASSIGNEE: {
        // Agent MUST NEVER see another staff member's work.
        const userId = currentUser.id;
        const matchesAssignee = (
          item.assignee_id === userId ||
          item.assigneeId === userId ||
          item.assignedAgentId === userId ||
          item.agentId === userId ||
          item.doctorId === userId ||
          item.userId === userId ||
          item.assignedTo === userId
        );

        // Also respect clinic boundary if item has clinicId
        const itemClinicId = item.clinicId || item.clinic_id;
        if (activeClinicId && itemClinicId) {
          return matchesAssignee && itemClinicId === activeClinicId;
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
