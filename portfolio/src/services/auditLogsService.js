/**
 * AUDIT LOGS SERVICE
 * Dedicated domain service for audit trail and compliance verification.
 * Provides organization-scoped and clinic-scoped query filters, security categorization,
 * severity metrics, and CSV export capabilities.
 */

import { storageService } from './storage.service';

const AUDIT_LOGS_KEY = 'dental_audit_logs';

export const AUDIT_CATEGORIES = {
  AUTHENTICATION: 'Authentication',
  SECURITY: 'Security & Access',
  PATIENTS: 'Patients & Leads',
  APPOINTMENTS: 'Appointments & Scheduling',
  REVENUE: 'Revenue & Billing',
  CLINICS: 'Clinics & Facilities',
  SYSTEM: 'System & Platform',
};

export const AUDIT_SEVERITIES = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud-001',
    timestamp: '2026-09-08T16:45:00.000Z',
    actor: 'admin@dental.com',
    actorName: 'Dr. John Doe',
    role: 'org_admin',
    action: 'USER_ROLE_UPDATED',
    entity: 'User',
    entityId: 'usr-005',
    details: 'Changed role for staff member Sarah Jenkins to clinic_manager',
    category: AUDIT_CATEGORIES.SECURITY,
    severity: AUDIT_SEVERITIES.WARNING,
    orgId: 'org-001',
    clinicId: 'clinic-downtown',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-08T15:20:00.000Z',
    actor: 'finance@test.com',
    actorName: 'Emma Vance',
    role: 'finance',
    action: 'PAYMENT_RECORDED',
    entity: 'Revenue',
    entityId: 'rev-8092',
    details: 'Recorded recognized revenue payment of $1,850.00 for Dental Implants',
    category: AUDIT_CATEGORIES.REVENUE,
    severity: AUDIT_SEVERITIES.INFO,
    orgId: 'org-001',
    clinicId: 'clinic-downtown',
    ipAddress: '192.168.1.112',
  },
  {
    id: 'aud-003',
    timestamp: '2026-09-08T14:10:00.000Z',
    actor: 'manager@test.com',
    actorName: 'Marcus Reynolds',
    role: 'clinic_manager',
    action: 'APPOINTMENT_RESCHEDULED',
    entity: 'Appointment',
    entityId: 'apt-304',
    details: 'Rescheduled patient appointment from 10:00 AM to 02:30 PM (Dr. Emily White)',
    category: AUDIT_CATEGORIES.APPOINTMENTS,
    severity: AUDIT_SEVERITIES.INFO,
    orgId: 'org-001',
    clinicId: 'clinic-downtown',
    ipAddress: '192.168.1.108',
  },
  {
    id: 'aud-004',
    timestamp: '2026-09-08T12:05:00.000Z',
    actor: 'receptionist@test.com',
    actorName: 'Chloe Bennett',
    role: 'receptionist',
    action: 'PATIENT_CHECKED_IN',
    entity: 'Patient',
    entityId: 'apt-201',
    details: 'Checked in patient Michael Brown for Orthodontics Consultation',
    category: AUDIT_CATEGORIES.APPOINTMENTS,
    severity: AUDIT_SEVERITIES.INFO,
    orgId: 'org-001',
    clinicId: 'clinic-west',
    ipAddress: '192.168.1.115',
  },
  {
    id: 'aud-005',
    timestamp: '2026-09-08T10:30:00.000Z',
    actor: 'system@platform.security',
    actorName: 'Security Sentinel',
    role: 'system',
    action: 'FAILED_LOGIN_ATTEMPT',
    entity: 'Session',
    entityId: 'ses-unknown',
    details: 'Multiple failed password attempts detected from IP 45.33.32.156 for agent@test.com',
    category: AUDIT_CATEGORIES.SECURITY,
    severity: AUDIT_SEVERITIES.CRITICAL,
    orgId: 'org-001',
    clinicId: 'clinic-downtown',
    ipAddress: '45.33.32.156',
  },
  {
    id: 'aud-006',
    timestamp: '2026-09-08T09:15:00.000Z',
    actor: 'agent@test.com',
    actorName: 'Alex Morgan',
    role: 'agent',
    action: 'LEAD_STATUS_CHANGED',
    entity: 'Lead',
    entityId: 'lead-102',
    details: 'Lead status progressed from "contacted" to "qualified" after consultation call',
    category: AUDIT_CATEGORIES.PATIENTS,
    severity: AUDIT_SEVERITIES.INFO,
    orgId: 'org-001',
    clinicId: 'clinic-downtown',
    ipAddress: '192.168.1.120',
  },
  {
    id: 'aud-007',
    timestamp: '2026-09-07T18:00:00.000Z',
    actor: 'admin@dental.com',
    actorName: 'Dr. John Doe',
    role: 'org_admin',
    action: 'CLINIC_BRANCH_UPDATED',
    entity: 'Clinic',
    entityId: 'clinic-north',
    details: 'Operating hours updated to 08:00 AM - 08:00 PM',
    category: AUDIT_CATEGORIES.CLINICS,
    severity: AUDIT_SEVERITIES.INFO,
    orgId: 'org-001',
    clinicId: 'clinic-north',
    ipAddress: '192.168.1.104',
  },
  {
    id: 'aud-008',
    timestamp: '2026-09-07T14:22:00.000Z',
    actor: 'finance@test.com',
    actorName: 'Emma Vance',
    role: 'finance',
    action: 'REFUND_PROCESSED',
    entity: 'Revenue',
    entityId: 'rev-7041',
    details: 'Processed refund authorization of $350.00 for cancelled procedure',
    category: AUDIT_CATEGORIES.REVENUE,
    severity: AUDIT_SEVERITIES.WARNING,
    orgId: 'org-001',
    clinicId: 'clinic-south',
    ipAddress: '192.168.1.112',
  },
  {
    id: 'aud-009',
    timestamp: '2026-09-07T11:05:00.000Z',
    actor: 'auditor@test.com',
    actorName: 'Robert Vance',
    role: 'auditor',
    action: 'AUDIT_EXPORT_GENERATED',
    entity: 'Report',
    entityId: 'rep-compliance-01',
    details: 'Exported quarterly financial reconciliation report (CSV)',
    category: AUDIT_CATEGORIES.SECURITY,
    severity: AUDIT_SEVERITIES.INFO,
    orgId: 'org-001',
    clinicId: 'clinic-west',
    ipAddress: '192.168.1.130',
  },
  {
    id: 'aud-010',
    timestamp: '2026-09-06T16:50:00.000Z',
    actor: 'superadmin@system.com',
    actorName: 'Platform Root',
    role: 'super_admin',
    action: 'ORGANIZATION_CREATED',
    entity: 'Organization',
    entityId: 'org-002',
    details: 'Provisioned new tenant organization: Dental Care Partners (org-002)',
    category: AUDIT_CATEGORIES.SYSTEM,
    severity: AUDIT_SEVERITIES.WARNING,
    orgId: 'org-002',
    clinicId: 'clinic-005',
    ipAddress: '10.0.0.1',
  },
];

class AuditLogsService {
  _getStorage() {
    let logs = storageService.get(AUDIT_LOGS_KEY);
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      storageService.set(AUDIT_LOGS_KEY, INITIAL_AUDIT_LOGS);
      return INITIAL_AUDIT_LOGS;
    }
    return logs;
  }

  /**
   * Log a new event to the audit trail
   */
  logEvent(event) {
    const logs = this._getStorage();
    const newLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      severity: AUDIT_SEVERITIES.INFO,
      category: AUDIT_CATEGORIES.SYSTEM,
      ...event,
    };
    storageService.set(AUDIT_LOGS_KEY, [newLog, ...logs]);
    return newLog;
  }

  /**
   * Returns scoped audit logs based on user role and optional filter parameters.
   */
  getLogs({
    currentUser,
    searchQuery = '',
    category = 'all',
    severity = 'all',
    clinicId = 'all',
    orgId = null,
  } = {}) {
    const all = this._getStorage();
    const role = currentUser?.role || 'auditor';
    const isSuperAdmin = role === 'super_admin';
    const effectiveOrgId = orgId || currentUser?.organizationId || 'org-001';

    return all.filter((log) => {
      // Tenancy Scoping: Super Admin sees all; Auditor and Org Admin see only their own org
      if (!isSuperAdmin) {
        if (log.orgId && log.orgId !== effectiveOrgId) {
          return false;
        }
      } else if (orgId && orgId !== 'all') {
        if (log.orgId && log.orgId !== orgId) {
          return false;
        }
      }

      // Clinic Filter
      if (clinicId && clinicId !== 'all') {
        if (log.clinicId && log.clinicId !== clinicId) {
          return false;
        }
      }

      // Category Filter
      if (category && category !== 'all') {
        if (log.category !== category) return false;
      }

      // Severity Filter
      if (severity && severity !== 'all') {
        if (log.severity !== severity) return false;
      }

      // Search Query
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const actor = (log.actor || '').toLowerCase();
        const actorName = (log.actorName || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        const entity = (log.entity || '').toLowerCase();
        const details = (log.details || '').toLowerCase();
        const matches =
          actor.includes(q) ||
          actorName.includes(q) ||
          action.includes(q) ||
          entity.includes(q) ||
          details.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }

  /**
   * Returns summary counts for audit health KPI cards
   */
  getStats(currentUser) {
    const logs = this.getLogs({ currentUser });
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const totalEvents = logs.length;
    const criticalEvents = logs.filter((l) => l.severity === AUDIT_SEVERITIES.CRITICAL).length;
    const warningEvents = logs.filter((l) => l.severity === AUDIT_SEVERITIES.WARNING).length;
    const recent24hEvents = logs.filter((l) => {
      const time = new Date(l.timestamp).getTime();
      return time >= oneDayAgo;
    }).length;

    const actorsSet = new Set(logs.map((l) => l.actor).filter(Boolean));

    return {
      totalEvents,
      criticalEvents,
      warningEvents,
      recent24hEvents,
      uniqueActorsCount: actorsSet.size,
    };
  }

  /**
   * Generates a CSV file and triggers a browser download.
   */
  exportToCSV(logs, filename = 'audit_trail_export.csv') {
    if (!logs || logs.length === 0) {
      throw new Error('No audit records available for export.');
    }

    const headers = [
      'Log ID',
      'Timestamp',
      'Actor Name',
      'Actor Email',
      'Role',
      'Action',
      'Entity',
      'Severity',
      'Category',
      'Organization ID',
      'Clinic ID',
      'Details',
      'IP Address',
    ];

    const rows = logs.map((l) => [
      l.id,
      new Date(l.timestamp).toLocaleString(),
      `"${(l.actorName || '').replace(/"/g, '""')}"`,
      `"${(l.actor || '').replace(/"/g, '""')}"`,
      l.role || '',
      l.action || '',
      l.entity || '',
      l.severity || '',
      `"${(l.category || '').replace(/"/g, '""')}"`,
      l.orgId || '',
      l.clinicId || '',
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.ipAddress || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  }
}

export const auditLogsService = new AuditLogsService();
