import { ROLES } from '../constants/permissions';

/**
 * STORAGE SERVICE
 * 
 * STRICT RULE: This is the ONLY file allowed to interact with window.localStorage.
 * No UI components, contexts, hooks, or pages may access localStorage directly.
 */

const STORAGE_KEYS = {
  USERS: 'dental_crm_users',
  ORGS: 'dental_crm_orgs',
  CLINICS: 'dental_crm_clinics',
  PATIENTS: 'dental_crm_patients',
  APPOINTMENTS: 'dental_crm_appointments',
  CURRENT_USER: 'dental_crm_current_user'
};

class StorageService {
  /**
   * Retrieves parsed JSON from LocalStorage safely.
   */
  get(key) {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
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
   * Seeds demo data if it doesn't already exist.
   * Ensures the system is ready for testing out of the box.
   */
  seed() {
    const existingUsers = this.get(STORAGE_KEYS.USERS);
    if (existingUsers && existingUsers.length > 0) {
      return; // Already seeded
    }

    console.log("Seeding Database...");

    const orgId = crypto.randomUUID();
    const clinicId1 = crypto.randomUUID();
    const clinicId2 = crypto.randomUUID();

    // 1. Seed Organizations
    const orgs = [
      { id: orgId, name: 'Aurea Dental Group', createdAt: new Date().toISOString() }
    ];
    this.set(STORAGE_KEYS.ORGS, orgs);

    // 2. Seed Clinics
    const clinics = [
      { id: clinicId1, orgId, name: 'Downtown Dental', city: 'New York' },
      { id: clinicId2, orgId, name: 'Uptown Smiles', city: 'New York' }
    ];
    this.set(STORAGE_KEYS.CLINICS, clinics);

    // 3. Seed Users (Matching Exact Structure for Future Supabase Migration)
    const baseUser = {
      password: 'Admin123', // Demo password
      status: 'active',
      phone: '+1-555-0100',
      avatar: null,
      timezone: 'America/New_York',
      inviteToken: null,
      invitedAt: null,
      acceptedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const users = [
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'System Administrator',
        email: 'superadmin@test.com',
        role: ROLES.SUPER_ADMIN,
        organizationId: null,
        clinicIds: []
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'Organization Admin',
        email: 'orgadmin@test.com',
        role: ROLES.ORG_ADMIN,
        organizationId: orgId,
        clinicIds: [clinicId1, clinicId2]
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'Clinic Manager',
        email: 'manager@test.com',
        role: ROLES.CLINIC_MANAGER,
        organizationId: orgId,
        clinicIds: [clinicId1]
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'Sales Agent',
        email: 'agent@test.com',
        role: ROLES.AGENT,
        organizationId: orgId,
        clinicIds: [clinicId1, clinicId2]
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'Front Desk Receptionist',
        email: 'reception@test.com',
        role: ROLES.RECEPTIONIST,
        organizationId: orgId,
        clinicIds: [clinicId1]
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'Finance Controller',
        email: 'finance@test.com',
        role: ROLES.FINANCE,
        organizationId: orgId,
        clinicIds: [clinicId1, clinicId2]
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'External Auditor',
        email: 'auditor@test.com',
        role: ROLES.AUDITOR,
        organizationId: orgId,
        clinicIds: []
      }
    ];
    this.set(STORAGE_KEYS.USERS, users);

    // 4. Seed Patients
    const patientId1 = crypto.randomUUID();
    const patientId2 = crypto.randomUUID();
    const patients = [
      { id: patientId1, clinicId: clinicId1, fullName: 'John Doe', phone: '+1-555-1234' },
      { id: patientId2, clinicId: clinicId2, fullName: 'Jane Smith', phone: '+1-555-5678' }
    ];
    this.set(STORAGE_KEYS.PATIENTS, patients);

    // 5. Seed Appointments
    const appointments = [
      { 
        id: crypto.randomUUID(), 
        clinicId: clinicId1, 
        patientId: patientId1, 
        date: new Date().toISOString(), 
        status: 'scheduled' 
      },
      { 
        id: crypto.randomUUID(), 
        clinicId: clinicId2, 
        patientId: patientId2, 
        date: new Date().toISOString(), 
        status: 'completed' 
      }
    ];
    this.set(STORAGE_KEYS.APPOINTMENTS, appointments);
  }

  // Expose Keys for strict usage
  KEYS = STORAGE_KEYS;
}

// Export a singleton instance
export const storageService = new StorageService();
