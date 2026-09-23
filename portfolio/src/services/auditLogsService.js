/**
 * AUDIT LOGS SERVICE
 * Dedicated domain service for audit trail and compliance verification.
 * Provides organization-scoped and clinic-scoped query filters, security categorization,
 * severity metrics, and CSV export capabilities.
 */

import apiClient from '@/lib/api';
import { storageService, isLegacyMockAuditLog } from './storage.service';

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

export function normalizeAuditLog(raw) {
  if (!raw) return null;
  const id = raw.id || raw._id || `aud-${Date.now()}`;
  const timestamp = raw.created_at || raw.timestamp || new Date().toISOString();
  const actor = raw.user_email || raw.email || raw.actor || 'system@platform.security';
  const actorName = raw.user_name || raw.actorName || raw.user_email?.split('@')[0] || 'System Operator';
  const role = raw.user_role || raw.role || 'system';
  const action = raw.action || 'ACTION_LOGGED';
  const entity = raw.entity_type || raw.entity || 'System';
  const entityId = raw.entity_id || raw.entityId || 'general';
  const details = raw.description || raw.details || (raw.changes ? JSON.stringify(raw.changes) : 'System activity logged.');
  const category = raw.category || (action.includes('SECURITY') || action.includes('LOGIN') ? AUDIT_CATEGORIES.SECURITY : AUDIT_CATEGORIES.SYSTEM);
  const severity = raw.severity || (action.includes('FAILED') || action.includes('CRITICAL') ? AUDIT_SEVERITIES.CRITICAL : (action.includes('UPDATE') ? AUDIT_SEVERITIES.WARNING : AUDIT_SEVERITIES.INFO));
  const orgId = raw.organization_id || raw.orgId || 'org-001';
  const clinicId = raw.clinic_id || raw.clinicId || 'clinic-downtown';
  const ipAddress = raw.ip_address || raw.ipAddress || '127.0.0.1';

  return {
    ...raw,
    id,
    timestamp,
    actor,
    actorName,
    role,
    action,
    entity,
    entityId,
    details,
    category,
    severity,
    orgId,
    clinicId,
    ipAddress,
  };
}

export const INITIAL_AUDIT_LOGS = [];

class AuditLogsService {
  _getStorage() {
    let logs = storageService.get(AUDIT_LOGS_KEY);
    if (!logs || !Array.isArray(logs)) {
      return [];
    }
    return logs.filter((l) => !isLegacyMockAuditLog(l));
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
   * API Method: Fetch audit logs for a specific entity
   * GET /api/v1/audit/entity/{entity_type}/{entity_id}
   */
  async getEntityLogs(entityType, entityId, limit = 100) {
    try {
      const response = await apiClient.get(`/api/v1/audit/entity/${entityType}/${entityId}`, {
        params: { limit },
      });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data.map(normalizeAuditLog) : [];
    } catch (error) {
      console.warn(`[AuditLogsService] API getEntityLogs failed for ${entityType}:${entityId}, falling back:`, error);
      const all = this._getStorage();
      return all
        .filter((l) => (l.entity_type || l.entity || '').toLowerCase() === entityType.toLowerCase() && (l.entity_id || l.entityId) === entityId)
        .slice(0, limit)
        .map(normalizeAuditLog);
    }
  }

  /**
   * API Method: Fetch audit logs for a specific user
   * GET /api/v1/audit/user/{user_id}
   */
  async getUserLogs(userId, limit = 100) {
    try {
      const response = await apiClient.get(`/api/v1/audit/user/${userId}`, {
        params: { limit },
      });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data.map(normalizeAuditLog) : [];
    } catch (error) {
      console.warn(`[AuditLogsService] API getUserLogs failed for user ${userId}, falling back:`, error);
      const all = this._getStorage();
      return all
        .filter((l) => (l.user_id || l.actor || '').includes(userId))
        .slice(0, limit)
        .map(normalizeAuditLog);
    }
  }

  /**
   * API Method: Fetch organization-wide audit logs
   * GET /api/v1/audit/organization/{org_id}
   */
  async getOrganizationLogs(orgId, limit = 100) {
    try {
      const targetOrg = orgId || 'all';
      const response = await apiClient.get(`/api/v1/audit/organization/${targetOrg}`, {
        params: { limit },
      });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data.map(normalizeAuditLog) : [];
    } catch (error) {
      console.warn(`[AuditLogsService] API getOrganizationLogs failed for org ${orgId}, falling back:`, error);
      const all = this._getStorage();
      return all
        .filter((l) => (l.organization_id || l.orgId) === orgId)
        .slice(0, limit)
        .map(normalizeAuditLog);
    }
  }

  /**
   * API Method: Fetch security audit logs (Super Admin restricted)
   * GET /api/v1/audit/security
   */
  async getSecurityLogs(limit = 100) {
    try {
      const response = await apiClient.get('/api/v1/audit/security', {
        params: { limit },
      });
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data.map(normalizeAuditLog) : [];
    } catch (error) {
      console.warn('[AuditLogsService] API getSecurityLogs failed, falling back:', error);
      const all = this._getStorage();
      return all
        .filter((l) => {
          const act = (l.action || '').toUpperCase();
          const cat = (l.category || '').toUpperCase();
          return act.includes('SECURITY') || act.includes('LOGIN') || act.includes('ROLE') || cat.includes('SECURITY');
        })
        .slice(0, limit)
        .map(normalizeAuditLog);
    }
  }

  /**
   * API Method: Fetch all system audit logs from real-time database API
   * GET /api/v1/audit/organization/all or GET /api/v1/audit/logs or GET /api/v1/audit/
   */
  async getAllLogs(limit = 100) {
    try {
      const response = await apiClient.get('/api/v1/audit/organization/all', {
        params: { limit },
      });
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data.map(normalizeAuditLog);
      }
    } catch (err1) {
      // Fallback
    }

    try {
      const response = await apiClient.get('/api/v1/audit/logs', {
        params: { limit },
      });
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data.map(normalizeAuditLog);
      }
    } catch (err2) {
      // Fallback
    }

    try {
      const response = await apiClient.get('/api/v1/audit/', {
        params: { limit },
      });
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data.map(normalizeAuditLog);
      }
    } catch (err3) {
      console.warn('[AuditLogsService] API getAllLogs failed:', err3);
    }

    return null;
  }

  /**
   * Comprehensive fetch function with live API integration and local storage fallback
   */
  async fetchLogs(options = {}) {
    const {
      currentUser,
      searchQuery = '',
      category = 'all',
      severity = 'all',
      clinicId = 'all',
      orgId = null,
      securityOnly = false,
      limit = 100,
    } = options;

    try {
      let remoteLogs = null;
      if (securityOnly) {
        remoteLogs = await this.getSecurityLogs(limit);
      } else if (orgId && orgId !== 'all') {
        remoteLogs = await this.getOrganizationLogs(orgId, limit);
      } else {
        remoteLogs = await this.getAllLogs(limit);
      }

      if (remoteLogs && Array.isArray(remoteLogs)) {
        // Apply client filters over remote results
        return remoteLogs.filter((log) => {
          const targetClinic = log.clinicId || log.clinic_id;
          if (clinicId && clinicId !== 'all' && targetClinic && targetClinic !== clinicId) return false;
          if (category && category !== 'all' && log.category !== category) return false;
          if (severity && severity !== 'all' && log.severity !== severity) return false;
          if (searchQuery && searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const text = `${log.actor} ${log.actorName} ${log.action} ${log.entity} ${log.details}`.toLowerCase();
            if (!text.includes(q)) return false;
          }
          return true;
        });
      }
    } catch (err) {
      console.warn('[AuditLogsService] Remote fetch error, defaulting to local logs:', err);
    }

    return this.getLogs({ currentUser, searchQuery, category, severity, clinicId, orgId });
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

