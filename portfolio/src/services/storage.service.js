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
const DB_VERSION = '4.0'; // v4.0: Guaranteed Smile Care Group canonical seeding and validation

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
      if (parsed !== null && parsed !== undefined) {
        if (Array.isArray(parsed) && parsed.length === 0) {
          // Empty array in storage — fall through to canonical seed fallback
        } else {
          // Check if domain arrays actually contain org-001 data
          if (
            (key === STORAGE_KEYS.PATIENTS ||
              key === STORAGE_KEYS.LEADS ||
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

      // Canonical fallbacks ensuring tables always receive data
      switch (key) {
        case STORAGE_KEYS.PATIENTS:
          this.set(STORAGE_KEYS.PATIENTS, SMILE_CARE_PATIENTS);
          return SMILE_CARE_PATIENTS;
        case STORAGE_KEYS.LEADS:
          this.set(STORAGE_KEYS.LEADS, SMILE_CARE_LEADS);
          return SMILE_CARE_LEADS;
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

    // Always ensure each dataset is populated with canonical seed data
    const currentLeads = this.get(STORAGE_KEYS.LEADS);
    if (!isSmileCareData(currentLeads)) {
      this.set(STORAGE_KEYS.LEADS, SMILE_CARE_LEADS);
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

    const currentUsers = this.get(STORAGE_KEYS.USERS);
    if (!currentUsers || !Array.isArray(currentUsers) || currentUsers.length === 0) {
      this.set(STORAGE_KEYS.USERS, SEED_USERS);
    }

    const currentOrgs = this.get(STORAGE_KEYS.ORGS);
    if (!currentOrgs || !Array.isArray(currentOrgs) || currentOrgs.length === 0) {
      this.set(STORAGE_KEYS.ORGS, [
        { id: ORG_001_ID, name: ORG_001_NAME, createdAt: new Date().toISOString() },
      ]);
    }

    const currentClinics = this.get(STORAGE_KEYS.CLINICS);
    if (!currentClinics || !Array.isArray(currentClinics) || currentClinics.length === 0) {
      this.set(STORAGE_KEYS.CLINICS, [
        { id: CLINIC_IDS.DOWNTOWN, orgId: ORG_001_ID, name: 'Downtown Dental Excellence', city: 'Riyadh' },
        { id: CLINIC_IDS.WEST,     orgId: ORG_001_ID, name: 'Westside Pediatric & Family', city: 'Riyadh' },
        { id: 'clinic-003',        orgId: ORG_001_ID, name: 'Gulberg Dental Studio',        city: 'Lahore' },
        { id: 'clinic-004',        orgId: ORG_001_ID, name: 'Clifton Oral Care',           city: 'Karachi' },
      ]);
    }

    const defaultUser = SEED_USERS.find((u) => u.role === ROLES.ORG_ADMIN) || SEED_USERS[1];
    const currentLoggedIn = window.localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentLoggedIn) {
      this.set(STORAGE_KEYS.CURRENT_USER, defaultUser);
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
