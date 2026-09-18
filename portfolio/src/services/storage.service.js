import { ROLES } from '../constants/permissions';
import {
  ORG_001_ID,
  ORG_001_NAME,
  SMILE_CARE_PATIENTS,
  SMILE_CARE_LEADS,
  SMILE_CARE_CALLS,
  SMILE_CARE_TASKS,
  SMILE_CARE_PAYMENTS,
} from '../constants/orgAdminSeedData';
import { SEED_USERS } from '../dashboard/super-admin/mock-data/usersData';

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
const DB_VERSION = '5.2'; // v5.2: Live API integration for leads, mock leads eliminated

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

const STORAGE_KEYS = {
  USERS:           'dental_crm_users',
  ORGS:            'dental_crm_orgs',
  CLINICS:         'dental_crm_clinics',
  PATIENTS:        'dental_crm_patients',
  APPOINTMENTS:    'dental_crm_appointments',
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

// ─────────────────────────────────────────────────────────────
// Fixed clinic IDs — predictable strings instead of UUIDs so
// roleAccess config and tests can reference them statically.
// ─────────────────────────────────────────────────────────────
const CLINIC_IDS = {
  DOWNTOWN: 'clinic-downtown',
  CENTRAL:  'clinic-central',
  WEST:     'clinic-west',
  EAST:     'clinic-east',
};

/**
 * Validates that an array contains active canonical data for Smile Care Group (org-001).
 * Prevents stale data from legacy versions from persisting in the user's browser.
 */
function isSmileCareData(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some((item) => {
    if (!item) return false;
    const org = item.orgId || item.organizationId;
    if (org === ORG_001_ID) return true;
    const cl = item.clinicId || item.id;
    return cl === 'clinic-downtown' || cl === 'clinic-west' || cl === 'clinic-003' || cl === 'clinic-004';
  });
}

class StorageService {
  /**
   * Retrieves parsed JSON from LocalStorage safely with canonical fallback.
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

      if (parsed !== null && parsed !== undefined) {
        if (Array.isArray(parsed) && parsed.length === 0) {
          // Empty array in storage — fall through to canonical seed fallback
        } else {
          // Check if domain arrays actually contain org-001 data
          if (
            (key === STORAGE_KEYS.PATIENTS ||
              key === STORAGE_KEYS.CALLS ||
              key === STORAGE_KEYS.TASKS ||
              key === STORAGE_KEYS.REVENUE) &&
            !isSmileCareData(parsed)
          ) {
            // Stale or non-org dataset — fall through to canonical overwrite
          } else {
            return parsed;
          }
        }
      }

      // Canonical fallbacks ensuring tables always receive data (excluding leads)
      switch (key) {
        case STORAGE_KEYS.PATIENTS:
          this.set(STORAGE_KEYS.PATIENTS, SMILE_CARE_PATIENTS);
          return SMILE_CARE_PATIENTS;
        case STORAGE_KEYS.LEADS:
          return [];
        case STORAGE_KEYS.CALLS:
          this.set(STORAGE_KEYS.CALLS, SMILE_CARE_CALLS);
          return SMILE_CARE_CALLS;
        case STORAGE_KEYS.TASKS:
          this.set(STORAGE_KEYS.TASKS, SMILE_CARE_TASKS);
          return SMILE_CARE_TASKS;
        case STORAGE_KEYS.REVENUE:
          this.set(STORAGE_KEYS.REVENUE, SMILE_CARE_PAYMENTS);
          return SMILE_CARE_PAYMENTS;
        case STORAGE_KEYS.USERS:
          this.set(STORAGE_KEYS.USERS, SEED_USERS);
          return SEED_USERS;
        case STORAGE_KEYS.CURRENT_USER: {
          const defaultUser = SEED_USERS.find((u) => u.role === ROLES.ORG_ADMIN) || SEED_USERS[1];
          this.set(STORAGE_KEYS.CURRENT_USER, defaultUser);
          return defaultUser;
        }
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
   * Seeds demo data if it doesn't already exist or when DB_VERSION updates.
   */
  seed() {
    const storedVersion = window.localStorage.getItem(STORAGE_KEYS.DB_VERSION)
      ? JSON.parse(window.localStorage.getItem(STORAGE_KEYS.DB_VERSION))
      : null;

    if (storedVersion !== DB_VERSION) {
      console.log(`DB schema changed (${storedVersion} → ${DB_VERSION}). Reseeding…`);
      const keysToWipe = [
        STORAGE_KEYS.USERS, STORAGE_KEYS.ORGS, STORAGE_KEYS.CLINICS,
        STORAGE_KEYS.PATIENTS, STORAGE_KEYS.APPOINTMENTS,
        STORAGE_KEYS.LEADS, STORAGE_KEYS.TASKS, STORAGE_KEYS.CALLS,
        STORAGE_KEYS.REVENUE, STORAGE_KEYS.CURRENT_USER,
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

    const currentPatients = this.get(STORAGE_KEYS.PATIENTS);
    if (!isSmileCareData(currentPatients)) {
      this.set(STORAGE_KEYS.PATIENTS, SMILE_CARE_PATIENTS);
    }

    const currentCalls = this.get(STORAGE_KEYS.CALLS);
    if (!isSmileCareData(currentCalls)) {
      this.set(STORAGE_KEYS.CALLS, SMILE_CARE_CALLS);
    }

    const currentTasks = this.get(STORAGE_KEYS.TASKS);
    if (!isSmileCareData(currentTasks)) {
      this.set(STORAGE_KEYS.TASKS, SMILE_CARE_TASKS);
    }

    const currentRevenue = this.get(STORAGE_KEYS.REVENUE);
    if (!isSmileCareData(currentRevenue)) {
      this.set(STORAGE_KEYS.REVENUE, SMILE_CARE_PAYMENTS);
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

    const currentAppointments = this.get(STORAGE_KEYS.APPOINTMENTS);
    if (!currentAppointments || !Array.isArray(currentAppointments) || currentAppointments.length === 0) {
      const appointments = [
        { id: crypto.randomUUID(), clinicId: CLINIC_IDS.DOWNTOWN, patientId: 'pat-001', date: new Date().toISOString(), status: 'scheduled' },
        { id: crypto.randomUUID(), clinicId: CLINIC_IDS.WEST,     patientId: 'pat-002', date: new Date().toISOString(), status: 'completed' },
        { id: crypto.randomUUID(), clinicId: 'clinic-003',        patientId: 'pat-007', date: new Date().toISOString(), status: 'scheduled' },
        { id: crypto.randomUUID(), clinicId: 'clinic-004',        patientId: 'pat-008', date: new Date().toISOString(), status: 'pending'   },
        { id: crypto.randomUUID(), clinicId: CLINIC_IDS.DOWNTOWN, patientId: 'pat-005', date: new Date().toISOString(), status: 'scheduled' },
      ];
      this.set(STORAGE_KEYS.APPOINTMENTS, appointments);
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
