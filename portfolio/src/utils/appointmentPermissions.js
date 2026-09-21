import { toast } from 'sonner';
import { normalizeRole } from './normalizeUser.js';
import { isSameClinic } from '../constants/clinics.js';

/**
 * Checks if a specific clinic ID is in user's assigned clinics.
 *
 * @param {object} user - User object
 * @param {string} clinicId - Clinic ID to test
 * @returns {boolean}
 */
export function isClinicAssigned(user, clinicId) {
  if (!user || !clinicId) return false;
  const role = normalizeRole(user.role);

  // Super Admin & Org Admin have global clinic scope
  if (role === 'super_admin' || role === 'org_admin') {
    return true;
  }

  const rawAssigned = [
    ...(Array.isArray(user.assigned_clinics) ? user.assigned_clinics : []),
    ...(Array.isArray(user.assignedClinics) ? user.assignedClinics : []),
    ...(Array.isArray(user.clinicIds) ? user.clinicIds : []),
    user.clinicId,
    user.clinic_id,
  ].filter(Boolean);

  const assignedIds = rawAssigned.map((c) =>
    typeof c === 'object' ? c.id || c._id || c.clinic_id : String(c)
  );

  return assignedIds.some((id) => isSameClinic(id, clinicId));
}

/**
 * Checks if user possesses an explicit permission flag.
 * Checks user.permissions array and falls back to role default policies.
 *
 * @param {object} user - User object
 * @param {string} permissionName - e.g. 'APPOINTMENT_CREATE', 'APPOINTMENT_MANAGE', 'APPOINTMENT_CANCEL'
 * @returns {boolean}
 */
export function hasAppointmentPermission(user, permissionName) {
  if (!user) return false;
  const role = normalizeRole(user.role);

  if (role === 'super_admin' || role === 'org_admin') return true;

  const targetPerm = String(permissionName).trim().toUpperCase();

  // Check explicit permissions array on user
  if (Array.isArray(user.permissions)) {
    const hasExplicit = user.permissions.some((p) => {
      const pNorm = String(p).trim().toUpperCase();
      return (
        pNorm === targetPerm ||
        pNorm === `APPOINTMENT_${targetPerm}` ||
        pNorm === targetPerm.replace('APPOINTMENT_', '')
      );
    });
    if (hasExplicit) return true;
  }

  // Role default policies
  switch (role) {
    case 'clinic_manager':
      return true;
    case 'receptionist':
      return [
        'APPOINTMENT_VIEW',
        'APPOINTMENT_CREATE',
        'APPOINTMENT_MANAGE',
        'APPOINTMENT_CHECKIN',
        'APPOINTMENT_CANCEL',
      ].includes(targetPerm);
    case 'agent':
      if (targetPerm === 'APPOINTMENT_VIEW') return true;
      // In FastAPI backend, Agent requires explicit APPOINTMENT_CREATE or APPOINTMENT_MANAGE
      return Boolean(
        user.canCreateAppointments ||
        user.hasAppointmentManage ||
        (Array.isArray(user.permissions) &&
          user.permissions.map((p) => String(p).toUpperCase()).includes(targetPerm))
      );
    case 'finance':
    case 'auditor':
      return targetPerm === 'APPOINTMENT_VIEW';
    default:
      return false;
  }
}

/**
 * Validates if the current user is authorized to perform a specific action
 * on an appointment based on strict RBAC and data-scoping rules.
 *
 * @param {object} user - Current user object
 * @param {string} action - 'create' | 'view' | 'update' | 'edit' | 'cancel' | 'delete' | 'checkin' | 'list'
 * @param {object} [appointmentData] - Target appointment object or creation payload
 * @returns {boolean}
 */
export function canUserPerformAction(user, action, appointmentData = null) {
  if (!user) return false;
  const role = normalizeRole(user.role);
  const act = String(action || '').toLowerCase().trim();

  // Extract relevant IDs from appointmentData if provided
  const clinicId =
    appointmentData?.clinic_id ||
    appointmentData?.clinicId ||
    appointmentData?.clinic?.id;

  const assignedTo =
    appointmentData?.assigned_to ||
    appointmentData?.assignedTo ||
    appointmentData?.assignedAgentId ||
    appointmentData?.assignedUserId ||
    appointmentData?.doctorId;

  const currentUserId = user.id || user._id;

  // ── 1. SUPER_ADMIN & ORG_ADMIN ─────────────────────────────────
  // Unrestricted full access across all clinics and actions.
  if (role === 'super_admin' || role === 'org_admin') {
    return true;
  }

  // ── 2. FINANCE & AUDITOR ───────────────────────────────────────
  // Read-only access to view appointments for reconciliation / auditing.
  // Cannot create, update, check-in, or cancel appointments.
  if (role === 'finance' || role === 'auditor') {
    if (act === 'view' || act === 'list' || act === 'upcoming') {
      return true;
    }
    return false;
  }

  // ── 3. CLINIC_MANAGER ──────────────────────────────────────────
  // Strictly restricted to clinics present in user.assigned_clinics.
  if (role === 'clinic_manager') {
    if (!clinicId) {
      // General capability check without target appointment
      return true;
    }
    return isClinicAssigned(user, clinicId);
  }

  // ── 4. RECEPTION / RECEPTIONIST ────────────────────────────────
  // Restricted to appointments where appointment.clinic_id matches user.assigned_clinics.
  // Primary role for patient check-in.
  if (role === 'receptionist') {
    if (act === 'checkin' || act === 'check_in') {
      if (!clinicId) return true;
      return isClinicAssigned(user, clinicId);
    }
    if (!clinicId) {
      return true;
    }
    return isClinicAssigned(user, clinicId);
  }

  // ── 5. AGENT ───────────────────────────────────────────────────
  if (role === 'agent') {
    // Check-in Restrictions: Cannot check-in patients.
    if (act === 'checkin' || act === 'check_in') {
      return false;
    }

    // Creation Scope: Allowed only if appointment.clinic_id is in assigned_clinics
    // AND user possesses the APPOINTMENT_CREATE permission.
    if (act === 'create') {
      const hasCreatePerm = hasAppointmentPermission(user, 'APPOINTMENT_CREATE');
      if (!hasCreatePerm) return false;
      if (clinicId && !isClinicAssigned(user, clinicId)) return false;
      return true;
    }

    // View Scope: Can ONLY view individual appointments assigned directly to them.
    if (act === 'view') {
      if (!appointmentData || !assignedTo) {
        // Can view the list view scoped to their own records
        return true;
      }
      return String(assignedTo) === String(currentUserId);
    }

    // Update Scope: Requires APPOINTMENT_MANAGE permission AND belongs to assigned scope.
    if (act === 'update' || act === 'edit') {
      const hasManagePerm = hasAppointmentPermission(user, 'APPOINTMENT_MANAGE');
      if (!hasManagePerm) return false;
      if (assignedTo && String(assignedTo) !== String(currentUserId)) {
        return false;
      }
      return true;
    }

    // Cancel Scope: Requires cancel permission and direct assignment.
    if (act === 'cancel' || act === 'delete') {
      const hasCancelPerm =
        hasAppointmentPermission(user, 'APPOINTMENT_CANCEL') ||
        hasAppointmentPermission(user, 'APPOINTMENT_MANAGE');
      if (!hasCancelPerm) return false;
      if (assignedTo && String(assignedTo) !== String(currentUserId)) {
        return false;
      }
      return true;
    }

    // List Scope: Cannot list all clinic appointments unless clinic is assigned and policies allow.
    if (act === 'list' || act === 'upcoming') {
      if (clinicId && !isClinicAssigned(user, clinicId)) {
        return false;
      }
      return true;
    }

    return false;
  }

  return false;
}

/**
 * Formats detailed, user-friendly error messages from backend HTTP exceptions.
 * Specifically captures and categorizes HTTP 403 Forbidden and HTTP 404 Not Found.
 *
 * @param {Error|object} err - Axios error object
 * @param {object} [context] - Contextual metadata (action, clinicId, appointmentId)
 * @returns {{ status: number, code: string, message: string, details: any }}
 */
export function parseAppointmentError(err, context = {}) {
  const status = err?.response?.status || err?.status || 0;
  const data = err?.response?.data || err?.data;
  const rawDetail = data?.detail || data?.message || err?.message || '';

  // ── HTTP 403 FORBIDDEN ──────────────────────────────────────────
  if (status === 403) {
    let message = 'Access Denied: You do not have permission to perform this appointment action.';

    if (typeof rawDetail === 'string' && rawDetail.trim()) {
      message = rawDetail;
    } else if (context.action === 'checkin' || context.action === 'check_in') {
      message = 'Forbidden: Your user role is not authorized to check in patients.';
    } else if (context.action === 'create') {
      message = 'Forbidden: You do not have permission to schedule appointments for this clinic.';
    } else if (context.action === 'update' || context.action === 'edit') {
      message = 'Forbidden: You can only modify appointments assigned to you within your designated clinic.';
    } else if (context.action === 'cancel' || context.action === 'delete') {
      message = 'Forbidden: You do not have permission to cancel this appointment.';
    }

    return {
      status: 403,
      code: 'FORBIDDEN',
      message,
      details: rawDetail,
    };
  }

  // ── HTTP 404 NOT FOUND ──────────────────────────────────────────
  if (status === 404) {
    let message = 'The requested appointment was not found or has been permanently removed.';
    if (typeof rawDetail === 'string' && rawDetail.trim()) {
      message = rawDetail;
    }
    return {
      status: 404,
      code: 'NOT_FOUND',
      message,
      details: rawDetail,
    };
  }

  // ── HTTP 422 UNPROCESSABLE ENTITY (Validation Error) ─────────────
  if (status === 422) {
    let message = 'Validation Failed: Please verify appointment date, time, and patient information.';
    if (Array.isArray(rawDetail) && rawDetail.length > 0) {
      const issues = rawDetail
        .map((issue) => {
          const field = issue.loc ? issue.loc[issue.loc.length - 1] : 'field';
          return `${field}: ${issue.msg}`;
        })
        .join(', ');
      message = `Validation Error (${issues})`;
    } else if (typeof rawDetail === 'string') {
      message = rawDetail;
    }
    return {
      status: 422,
      code: 'VALIDATION_ERROR',
      message,
      details: rawDetail,
    };
  }

  // ── HTTP 400 BAD REQUEST ────────────────────────────────────────
  if (status === 400) {
    return {
      status: 400,
      code: 'BAD_REQUEST',
      message: typeof rawDetail === 'string' && rawDetail ? rawDetail : 'Invalid appointment request data.',
      details: rawDetail,
    };
  }

  // ── NETWORK OR SERVER ERROR ─────────────────────────────────────
  if (!err?.response && (err?.message?.includes('Network') || err?.code === 'ECONNABORTED')) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Network error: Backend server is unreachable. Please verify connection.',
      details: err.message,
    };
  }

  return {
    status: status || 500,
    code: 'SERVER_ERROR',
    message: typeof rawDetail === 'string' && rawDetail ? rawDetail : 'An unexpected server error occurred.',
    details: rawDetail,
  };
}

/**
 * Parses and triggers a toast notification for appointment errors.
 *
 * @param {Error|object} err - Error object
 * @param {string} [fallbackMessage] - Fallback message
 * @param {object} [context] - Contextual metadata
 * @returns {object} Parsed error object
 */
export function notifyAppointmentError(err, fallbackMessage = null, context = {}) {
  const parsed = parseAppointmentError(err, context);
  const displayMsg = fallbackMessage && parsed.status >= 500 ? fallbackMessage : parsed.message;

  if (parsed.status === 403) {
    toast.error('Permission Denied', {
      description: displayMsg,
    });
  } else if (parsed.status === 404) {
    toast.error('Not Found', {
      description: displayMsg,
    });
  } else {
    toast.error(displayMsg);
  }

  return parsed;
}

export default {
  canUserPerformAction,
  isClinicAssigned,
  hasAppointmentPermission,
  parseAppointmentError,
  notifyAppointmentError,
};
