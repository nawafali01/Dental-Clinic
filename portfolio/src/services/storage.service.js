import { ROLES } from '../constants/permissions';
import { ORG_001_ID, ORG_001_NAME } from '../constants/orgAdminSeedData';

/**
 * STORAGE SERVICE
 *
 * STRICT RULE: This is the ONLY file allowed to interact with window.localStorage.
 * No UI components, contexts, hooks, or pages may access localStorage directly.
 *
 * This service is responsible for mock data persistence and initialization ONLY.
 * All querying, filtering, sorting, searching, pagination, aggregation, and
 * business rules must remain inside dedicated domain services.
 */

// ─────────────────────────────────────────────────────────────
// Database version — bump this string when the schema changes
// so that existing localStorage sessions are cleared and re-seeded
// with the updated data structure.
// ─────────────────────────────────────────────────────────────
const DB_VERSION = '6.0'; // v6.0: Purged all legacy seed mock datasets across storage

export const LEGACY_MOCK_LEAD_IDS = new Set([
  'lead-001', 'lead-002', 'lead-003', 'lead-004', 'lead-005', 'lead-006',
  'lead-007', 'lead-008', 'lead-009', 'lead-010', 'lead-011', 'lead-012',
]);

export const LEGACY_MOCK_LEAD_EMAILS = new Set([
  'emma.watson@example.com',
  'david.miller@example.com',
  'sarah.connor@example.com',
  'm.chang@example.com',
  'layla.hassan@example.com',
  'james.wilson@example.com',
  'sophia.alvarez@example.com',
  'robert.chen@example.com',
  'aisha.malik@example.com',
  'thomas.anderson@example.com',
  'fatima.zahra@example.com',
  'lucas.silva@example.com',
]);

export function isLegacyMockLead(lead) {
  if (!lead) return true;
  if (LEGACY_MOCK_LEAD_IDS.has(lead.id) || LEGACY_MOCK_LEAD_IDS.has(lead._id)) return true;
  if (lead.email && LEGACY_MOCK_LEAD_EMAILS.has(lead.email.toLowerCase())) return true;
  return false;
}

const LEGACY_MOCK_APPOINTMENT_IDS = new Set([
  'apt-1', 'apt-2', 'apt-3', 'apt-4', 'apt-5',
  'apt-6', 'apt-7', 'apt-8', 'apt-9', 'apt-10',
  'apt-001', 'apt-002', 'apt-003', 'apt-004', 'apt-005',
  'apt-006', 'apt-007', 'apt-008', 'apt-009', 'apt-010',
]);

export function isLegacyMockAppointment(appt) {
  if (!appt) return true;
  const id = String(appt.id || appt._id || '');
  if (LEGACY_MOCK_APPOINTMENT_IDS.has(id) || /^apt-0*\d+$/.test(id)) return true;
  if (appt.patientId && String(appt.patientId).startsWith('pat-00')) return true;
  const name = String(appt.patientName || appt.patient_name || '').toLowerCase();
  if (['sarah mitchell', 'james thornton', 'priya kapoor', 'michael chang'].includes(name)) return true;
  return false;
}

const STORAGE_KEYS = {
  USERS:           'dental_crm_users',
  ORGS:            'dental_crm_orgs',
  CLINICS:         'dental_crm_clinics',
  PATIENTS:        'dental_crm_patients',
  APPOINTMENTS:    'dental_crm_appointments',
  CANCELLED_APPOINTMENTS: 'dental_crm_cancelled_appointments',
  CURRENT_USER:    'dental_crm_current_user',
  LEADS:           'dental_crm_leads',
  TASKS:           'dental_crm_tasks',
  CALLS:           'dental_crm_calls',
  REVENUE:         'dental_crm_revenue',
  REPORTS:         'dental_crm_reports',
  TREATMENTS_CONFIG: 'dental_crm_treatments_config',
  LEAD_SOURCES:     'dental_crm_lead_sources',
  LEAD_STATUSES:    'dental_crm_lead_statuses',
  SETTINGS:         'dental_crm_settings',
  CATALOGS:         'dental_crm_catalogs',
  NOTIFICATIONS:    'dental_crm_notifications',
  SELECTED_BRANCH: 'selectedBranch',          // persisted clinic switcher selection
  DB_VERSION:      'dental_crm_db_version',   // schema version check
};

class StorageService {
  /**
   * Retrieves parsed JSON from LocalStorage safely without mock data fallbacks.
   */
  get(key) {
    try {
      const item = window.localStorage.getItem(key);
      const parsed = item ? JSON.parse(item) : null;

      // LEADS: Must only contain real backend data, never fallback to mock seed
      if (key === STORAGE_KEYS.LEADS) {
        if (Array.isArray(parsed)) {
          return parsed.filter((l) => !isLegacyMockLead(l));
        }
        return [];
      }

      // APPOINTMENTS: Must only contain real backend data, never fallback to mock seed
      if (key === STORAGE_KEYS.APPOINTMENTS) {
        if (Array.isArray(parsed)) {
          return parsed.filter((a) => !isLegacyMockAppointment(a));
        }
        return [];
      }

      if (parsed !== null && parsed !== undefined) {
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return parsed;
      }

      // Strict real data default (empty array or null)
      switch (key) {
        case STORAGE_KEYS.PATIENTS:
        case STORAGE_KEYS.LEADS:
        case STORAGE_KEYS.CALLS:
        case STORAGE_KEYS.TASKS:
        case STORAGE_KEYS.REVENUE:
        case STORAGE_KEYS.APPOINTMENTS:
        case STORAGE_KEYS.REPORTS:
          return [];
        case STORAGE_KEYS.USERS:
          return [];
        case STORAGE_KEYS.CURRENT_USER:
          return null;
        default:
          return parsed;
      }
    } catch (error) {
      console.error(`Error reading from localStorage [${key}]:`, error);
      return null;
    }
  }

  /**
   * Sets stringified JSON to LocalStorage.
   */
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage [${key}]:`, error);
    }
  }

  /**
   * Removes an item from LocalStorage.
   */
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage [${key}]:`, error);
    }
  }

  /**
   * Cleans stale mock data if DB_VERSION updates or legacy mock datasets exist.
   */
  seed() {
    const storedVersion = window.localStorage.getItem(STORAGE_KEYS.DB_VERSION)
      ? JSON.parse(window.localStorage.getItem(STORAGE_KEYS.DB_VERSION))
      : null;

    if (storedVersion !== DB_VERSION) {
      console.log(`DB schema changed (${storedVersion} → ${DB_VERSION}). Purging legacy mock datasets…`);
      const keysToWipe = [
        STORAGE_KEYS.USERS, STORAGE_KEYS.ORGS, STORAGE_KEYS.CLINICS,
        STORAGE_KEYS.PATIENTS, STORAGE_KEYS.APPOINTMENTS,
        STORAGE_KEYS.LEADS, STORAGE_KEYS.TASKS, STORAGE_KEYS.CALLS,
        STORAGE_KEYS.REVENUE, STORAGE_KEYS.CURRENT_USER, STORAGE_KEYS.REPORTS,
      ];
      keysToWipe.forEach((k) => this.remove(k));
      this.set(STORAGE_KEYS.DB_VERSION, DB_VERSION);
    }

    // Purge mock leads so only real backend leads exist
    const rawLeads = window.localStorage.getItem(STORAGE_KEYS.LEADS);
    if (rawLeads) {
      try {
        const parsed = JSON.parse(rawLeads);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((l) => !isLegacyMockLead(l));
          this.set(STORAGE_KEYS.LEADS, cleaned);
        }
      } catch {
        this.set(STORAGE_KEYS.LEADS, []);
      }
    }


    let currentUsers = this.get(STORAGE_KEYS.USERS);
    const LEGACY_MOCK_EMAILS = new Set([
      'superadmin@test.com', 'orgadmin@test.com', 'manager@test.com',
      'agent@test.com', 'reception@test.com', 'finance@test.com', 'auditor@test.com',
      'edward@brightdental.co.uk', 'emma@brightdental.co.uk', 'dr.arjun@test.com',
      'dr.layla@test.com', 'dr.faisal@test.com'
    ]);
    const LEGACY_MOCK_IDS = new Set([
      'user-000', 'user-001', 'user-002', 'user-003', 'user-004', 'user-005', 'user-006'
    ]);
    if (Array.isArray(currentUsers)) {
      const filtered = currentUsers.filter(
        (u) => !LEGACY_MOCK_EMAILS.has(u.email?.toLowerCase()) && !LEGACY_MOCK_IDS.has(u.id)
      );
      if (filtered.length !== currentUsers.length) {
        this.set(STORAGE_KEYS.USERS, filtered);
      }
    } else {
      this.set(STORAGE_KEYS.USERS, []);
    }
  }

  // Expose Keys for strict usage
  KEYS = STORAGE_KEYS;
}

// Export a singleton instance
export const storageService = new StorageService();

// Self-seed immediately upon script evaluation
if (typeof window !== 'undefined') {
  storageService.seed();
}
