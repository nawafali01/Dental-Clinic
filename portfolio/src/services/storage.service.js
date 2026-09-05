import { ROLES } from '../constants/permissions';

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
const DB_VERSION = '3.1'; // v3.1: enhanced tasks model with queues, assignees, priorities, and notes

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
   * When DB_VERSION changes, clears all data and reseeds from scratch
   * to ensure a consistent data structure across schema updates.
   */
  seed() {
    // ── Version check: wipe + reseed on schema change ──────────
    const storedVersion = this.get(STORAGE_KEYS.DB_VERSION);
    if (storedVersion !== DB_VERSION) {
      console.log(`DB schema changed (${storedVersion} → ${DB_VERSION}). Reseeding…`);
      // Clear all data keys (preserve selectedBranch if already set)
      const keysToWipe = [
        STORAGE_KEYS.USERS, STORAGE_KEYS.ORGS, STORAGE_KEYS.CLINICS,
        STORAGE_KEYS.PATIENTS, STORAGE_KEYS.APPOINTMENTS,
        STORAGE_KEYS.LEADS, STORAGE_KEYS.TASKS, STORAGE_KEYS.CALLS,
        STORAGE_KEYS.REVENUE, STORAGE_KEYS.CURRENT_USER,
      ];
      keysToWipe.forEach((k) => this.remove(k));
      this.set(STORAGE_KEYS.DB_VERSION, DB_VERSION);
    }

    const existingUsers = this.get(STORAGE_KEYS.USERS);
    if (existingUsers && existingUsers.length > 0) {
      // Re-seed CRM data if missing (e.g. after partial clear)
      if (!this.get(STORAGE_KEYS.LEADS)) this._seedCRMData(existingUsers);
      return;
    }

    console.log('Seeding Database…');

    const orgId = crypto.randomUUID();

    // 1. Seed Organizations
    const orgs = [
      { id: orgId, name: 'Aurea Dental Group', createdAt: new Date().toISOString() },
    ];
    this.set(STORAGE_KEYS.ORGS, orgs);

    // 2. Seed Clinics (fixed IDs)
    const clinics = [
      { id: CLINIC_IDS.DOWNTOWN, orgId, name: 'Downtown Dental Excellence', city: 'Riyadh' },
      { id: CLINIC_IDS.CENTRAL,  orgId, name: 'Apex Orthodontics & Smiles',  city: 'Jeddah' },
      { id: CLINIC_IDS.WEST,     orgId, name: 'Westside Pediatric & Family', city: 'Riyadh' },
      { id: CLINIC_IDS.EAST,     orgId, name: 'Metro Cosmetic Care',          city: 'Dammam' },
    ];
    this.set(STORAGE_KEYS.CLINICS, clinics);

    // 3. Seed Users
    // clinicId  — the primary clinic for single-clinic roles (used by ClinicContext)
    // clinicIds — the full list of clinic memberships
    const baseUser = {
      password:    'Admin123',
      status:      'active',
      phone:       '+1-555-0100',
      avatar:      null,
      timezone:    'America/New_York',
      inviteToken: null,
      invitedAt:   null,
      acceptedAt:  new Date().toISOString(),
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    };

    const users = [
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'System Administrator',
        email: 'superadmin@test.com',
        role: ROLES.SUPER_ADMIN,
        organizationId: null,
        clinicId: null,                                                   // access all
        clinicIds: [],
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'Organization Admin',
        email: 'orgadmin@test.com',
        role: ROLES.ORG_ADMIN,
        organizationId: orgId,
        clinicId: CLINIC_IDS.DOWNTOWN,
        clinicIds: [CLINIC_IDS.DOWNTOWN, CLINIC_IDS.CENTRAL, CLINIC_IDS.WEST, CLINIC_IDS.EAST],
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'Clinic Manager',
        email: 'manager@test.com',
        role: ROLES.CLINIC_MANAGER,
        organizationId: orgId,
        clinicId: CLINIC_IDS.DOWNTOWN,
        clinicIds: [CLINIC_IDS.DOWNTOWN],
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'Sales Agent',
        email: 'agent@test.com',
        role: ROLES.AGENT,
        organizationId: orgId,
        clinicId: CLINIC_IDS.DOWNTOWN,
        clinicIds: [CLINIC_IDS.DOWNTOWN, CLINIC_IDS.CENTRAL],
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'Front Desk Receptionist',
        email: 'reception@test.com',
        role: ROLES.RECEPTIONIST,
        organizationId: orgId,
        clinicId: CLINIC_IDS.DOWNTOWN,
        clinicIds: [CLINIC_IDS.DOWNTOWN],
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'Finance Controller',
        email: 'finance@test.com',
        role: ROLES.FINANCE,
        organizationId: orgId,
        clinicId: CLINIC_IDS.DOWNTOWN,
        clinicIds: [CLINIC_IDS.DOWNTOWN, CLINIC_IDS.CENTRAL],
      },
      {
        ...baseUser,
        id: crypto.randomUUID(),
        fullName: 'External Auditor',
        email: 'auditor@test.com',
        role: ROLES.AUDITOR,
        organizationId: orgId,
        clinicId: CLINIC_IDS.DOWNTOWN,  // default view clinic
        clinicIds: [],                  // auditor sees all in read-only
      },
    ];
    this.set(STORAGE_KEYS.USERS, users);

    // 4. Seed Patients (with clinicId)
    const patientId1 = crypto.randomUUID();
    const patientId2 = crypto.randomUUID();
    const patientId3 = crypto.randomUUID();
    const patientId4 = crypto.randomUUID();
    const patients = [
      { id: patientId1, clinicId: CLINIC_IDS.DOWNTOWN, fullName: 'John Doe',      phone: '+1-555-1234' },
      { id: patientId2, clinicId: CLINIC_IDS.CENTRAL,  fullName: 'Jane Smith',    phone: '+1-555-5678' },
      { id: patientId3, clinicId: CLINIC_IDS.WEST,     fullName: 'Ali Hassan',    phone: '+966-55-1111' },
      { id: patientId4, clinicId: CLINIC_IDS.EAST,     fullName: 'Nour El-Masry', phone: '+20-10-2222' },
    ];
    this.set(STORAGE_KEYS.PATIENTS, patients);

    // 5. Seed Appointments (with clinicId)
    const appointments = [
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.DOWNTOWN, patientId: patientId1, date: new Date().toISOString(), status: 'scheduled' },
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.CENTRAL,  patientId: patientId2, date: new Date().toISOString(), status: 'completed' },
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.WEST,     patientId: patientId3, date: new Date().toISOString(), status: 'scheduled' },
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.EAST,     patientId: patientId4, date: new Date().toISOString(), status: 'pending'   },
    ];
    this.set(STORAGE_KEYS.APPOINTMENTS, appointments);

    // 6. Seed CRM Data (Leads, Tasks, Calls, Revenue)
    this._seedCRMData(users);
  }

  /**
   * Seeds Leads, Tasks, Calls, and Revenue for the Agent user.
   * Every entity includes a clinicId so dashboard views can filter by branch.
   * @param {Array} users - The seeded users array to extract the agent ID.
   */
  _seedCRMData(users) {
    const agent = users.find((u) => u.email === 'agent@test.com');
    if (!agent) return;

    const agentId = agent.id;
    const now     = new Date();

    const daysAgo = (n) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d.toISOString();
    };

    const todayAt = (hhmm) => {
      const [h, m] = hhmm.split(':').map(Number);
      const d = new Date(now);
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    };

    // Rotate leads across all four clinics for realistic demo data
    const clinicCycle = [
      CLINIC_IDS.DOWNTOWN,
      CLINIC_IDS.CENTRAL,
      CLINIC_IDS.WEST,
      CLINIC_IDS.EAST,
    ];

    // ── Leads ─────────────────────────────────────────────────
    const leads = [
      { id: crypto.randomUUID(), clinicId: clinicCycle[0], assignedAgentId: agentId, patientName: 'Ahmed Al-Rashidi',  treatment: 'Dental Implant',   status: 'qualified', priority: 'high',   lastActivity: 'Called — interested',       lastActivityDate: daysAgo(0), phone: '+971-50-1234567', email: 'ahmed@example.com',  source: 'Google Ads', createdAt: daysAgo(12) },
      { id: crypto.randomUUID(), clinicId: clinicCycle[1], assignedAgentId: agentId, patientName: 'Sara Johnson',      treatment: 'Teeth Whitening',  status: 'new',       priority: 'medium', lastActivity: 'Form submitted',            lastActivityDate: daysAgo(0), phone: '+1-555-2345',    email: 'sara@example.com',   source: 'Instagram',  createdAt: daysAgo(1)  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[2], assignedAgentId: agentId, patientName: 'Mohammed Hassan',   treatment: 'Root Canal',       status: 'contacted', priority: 'high',   lastActivity: 'Left voicemail',            lastActivityDate: daysAgo(1), phone: '+966-55-9876543', email: 'moh@example.com',    source: 'Website',    createdAt: daysAgo(5)  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[3], assignedAgentId: agentId, patientName: 'Fatima Al-Zaidi',   treatment: 'Orthodontics',     status: 'proposal',  priority: 'medium', lastActivity: 'Sent treatment plan PDF',   lastActivityDate: daysAgo(1), phone: '+971-55-3456789', email: 'fatima@example.com', source: 'Referral',   createdAt: daysAgo(8)  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[0], assignedAgentId: agentId, patientName: 'Khalid Mansour',    treatment: 'Veneers',          status: 'converted', priority: 'low',    lastActivity: 'Booked appointment',        lastActivityDate: daysAgo(2), phone: '+966-50-7654321', email: 'khalid@example.com', source: 'WhatsApp',   createdAt: daysAgo(15) },
      { id: crypto.randomUUID(), clinicId: clinicCycle[1], assignedAgentId: agentId, patientName: 'Nour El-Masry',     treatment: 'Dental Cleaning',  status: 'new',       priority: 'low',    lastActivity: 'Assigned to agent',         lastActivityDate: daysAgo(0), phone: '+20-10-1234567',  email: 'nour@example.com',   source: 'Google Ads', createdAt: daysAgo(0)  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[2], assignedAgentId: agentId, patientName: 'Rania Haddad',      treatment: 'Teeth Whitening',  status: 'contacted', priority: 'medium', lastActivity: 'WhatsApp message sent',     lastActivityDate: daysAgo(2), phone: '+961-70-9876543', email: 'rania@example.com',  source: 'Instagram',  createdAt: daysAgo(3)  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[3], assignedAgentId: agentId, patientName: 'Omar Tariq',        treatment: 'Dental Implant',   status: 'qualified', priority: 'high',   lastActivity: 'Video call completed',      lastActivityDate: daysAgo(3), phone: '+92-300-1234567', email: 'omar@example.com',   source: 'Google Ads', createdAt: daysAgo(6)  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[0], assignedAgentId: agentId, patientName: 'Lina Khalil',       treatment: 'Invisalign',       status: 'proposal',  priority: 'high',   lastActivity: 'Proposal sent via email',   lastActivityDate: daysAgo(3), phone: '+961-71-5432109', email: 'lina@example.com',   source: 'Referral',   createdAt: daysAgo(9)  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[1], assignedAgentId: agentId, patientName: 'Tariq Al-Fahad',    treatment: 'Root Canal',       status: 'lost',      priority: 'low',    lastActivity: 'No response after 3 tries', lastActivityDate: daysAgo(5), phone: '+966-54-3210987', email: 'tariq@example.com',  source: 'TV Ad',      createdAt: daysAgo(20) },
      { id: crypto.randomUUID(), clinicId: clinicCycle[2], assignedAgentId: agentId, patientName: 'Hana Yousef',       treatment: 'Crown & Bridge',   status: 'converted', priority: 'medium', lastActivity: 'Appointment confirmed',     lastActivityDate: daysAgo(4), phone: '+962-79-8765432', email: 'hana@example.com',   source: 'Website',    createdAt: daysAgo(11) },
      { id: crypto.randomUUID(), clinicId: clinicCycle[3], assignedAgentId: agentId, patientName: 'Samir Boutros',     treatment: 'Teeth Whitening',  status: 'contacted', priority: 'low',    lastActivity: 'Called — no answer',        lastActivityDate: daysAgo(1), phone: '+20-12-9876543',  email: 'samir@example.com',  source: 'Instagram',  createdAt: daysAgo(2)  },
    ];
    this.set(STORAGE_KEYS.LEADS, leads);

    const manager = users.find((u) => u.email === 'manager@test.com') || agent;
    const orgAdmin = users.find((u) => u.email === 'orgadmin@test.com') || agent;
    const managerId = manager.id;
    const orgAdminId = orgAdmin.id;
    const orgId = agent.organizationId;

    const daysFromNow = (n) => {
      const d = new Date(now);
      d.setDate(d.getDate() + n);
      return d.toISOString().split('T')[0];
    };

    const daysAgoDate = (n) => {
      const d = new Date(now);
      d.setDate(d.getDate() - n);
      return d.toISOString().split('T')[0];
    };

    const todayDateStr = now.toISOString().split('T')[0];

    // ── Tasks ──────────────────────────────────────────────────
    const tasks = [
      // TODAY'S TASKS
      {
        id: crypto.randomUUID(),
        title: 'Call Ahmed Al-Rashidi for Implant Consultation',
        type: 'Call',
        taskType: 'Call',
        linked_lead_id: leads[0].id,
        leadId: leads[0].id,
        leadName: 'Ahmed Al-Rashidi',
        assignee_id: agentId,
        assigneeId: agentId,
        assignedAgentId: agentId,
        due_date: todayDateStr,
        dueDate: `${todayDateStr}T09:00:00`,
        due_time: '09:00',
        dueTime: '09:00',
        priority: 'High',
        status: 'Pending',
        completion_notes: '',
        created_at: daysAgo(1),
        createdAt: daysAgo(1),
        created_by: agentId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[0],
        clinicId: clinicCycle[0],
      },
      {
        id: crypto.randomUUID(),
        title: 'Send WhatsApp Follow-up to Rania Haddad',
        type: 'WhatsApp',
        taskType: 'WhatsApp',
        linked_lead_id: leads[6].id,
        leadId: leads[6].id,
        leadName: 'Rania Haddad',
        assignee_id: agentId,
        assigneeId: agentId,
        assignedAgentId: agentId,
        due_date: todayDateStr,
        dueDate: `${todayDateStr}T13:00:00`,
        due_time: '13:00',
        dueTime: '13:00',
        priority: 'Normal',
        status: 'In Progress',
        completion_notes: '',
        created_at: daysAgo(0),
        createdAt: daysAgo(0),
        created_by: agentId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[3],
        clinicId: clinicCycle[3],
      },
      {
        id: crypto.randomUUID(),
        title: 'Urgent Smile Assessment Demo Call with Omar',
        type: 'Call',
        taskType: 'Call',
        linked_lead_id: leads[7].id,
        leadId: leads[7].id,
        leadName: 'Omar Tariq',
        assignee_id: agentId,
        assigneeId: agentId,
        assignedAgentId: agentId,
        due_date: todayDateStr,
        dueDate: `${todayDateStr}T15:00:00`,
        due_time: '15:00',
        dueTime: '15:00',
        priority: 'Urgent',
        status: 'Pending',
        completion_notes: '',
        created_at: daysAgo(0),
        createdAt: daysAgo(0),
        created_by: agentId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[0],
        clinicId: clinicCycle[0],
      },
      {
        id: crypto.randomUUID(),
        title: 'Review Staff Shift Schedule & Chair Availability',
        type: 'Custom',
        taskType: 'Custom',
        linked_lead_id: null,
        leadId: null,
        leadName: '',
        assignee_id: managerId,
        assigneeId: managerId,
        assignedAgentId: managerId,
        due_date: todayDateStr,
        dueDate: `${todayDateStr}T16:30:00`,
        due_time: '16:30',
        dueTime: '16:30',
        priority: 'Normal',
        status: 'Pending',
        completion_notes: '',
        created_at: daysAgo(1),
        createdAt: daysAgo(1),
        created_by: managerId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[0],
        clinicId: clinicCycle[0],
      },

      // OVERDUE TASKS (Past due date & not completed)
      {
        id: crypto.randomUUID(),
        title: 'Overdue Treatment Proposal Email to Mohammed Hassan',
        type: 'Email',
        taskType: 'Email',
        linked_lead_id: leads[2].id,
        leadId: leads[2].id,
        leadName: 'Mohammed Hassan',
        assignee_id: agentId,
        assigneeId: agentId,
        assignedAgentId: agentId,
        due_date: daysAgoDate(2),
        dueDate: `${daysAgoDate(2)}T08:00:00`,
        due_time: '08:00',
        dueTime: '08:00',
        priority: 'High',
        status: 'Pending',
        completion_notes: '',
        created_at: daysAgo(3),
        createdAt: daysAgo(3),
        created_by: agentId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[2],
        clinicId: clinicCycle[2],
      },
      {
        id: crypto.randomUUID(),
        title: 'Follow-up on Whitening Inquiry with Sara Johnson',
        type: 'SMS',
        taskType: 'SMS',
        linked_lead_id: leads[1].id,
        leadId: leads[1].id,
        leadName: 'Sara Johnson',
        assignee_id: agentId,
        assigneeId: agentId,
        assignedAgentId: agentId,
        due_date: daysAgoDate(1),
        dueDate: `${daysAgoDate(1)}T10:30:00`,
        due_time: '10:30',
        dueTime: '10:30',
        priority: 'Normal',
        status: 'Pending',
        completion_notes: '',
        created_at: daysAgo(2),
        createdAt: daysAgo(2),
        created_by: agentId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[1],
        clinicId: clinicCycle[1],
      },

      // UPCOMING TASKS (Future due date)
      {
        id: crypto.randomUUID(),
        title: 'Appointment Confirmation Call for Fatima Al-Zaidi',
        type: 'Appointment-Confirmation',
        taskType: 'Appointment-Confirmation',
        linked_lead_id: leads[3].id,
        leadId: leads[3].id,
        leadName: 'Fatima Al-Zaidi',
        assignee_id: agentId,
        assigneeId: agentId,
        assignedAgentId: agentId,
        due_date: daysFromNow(1),
        dueDate: `${daysFromNow(1)}T11:00:00`,
        due_time: '11:00',
        dueTime: '11:00',
        priority: 'Normal',
        status: 'Pending',
        completion_notes: '',
        created_at: daysAgo(0),
        createdAt: daysAgo(0),
        created_by: agentId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[3],
        clinicId: clinicCycle[3],
      },
      {
        id: crypto.randomUUID(),
        title: 'Send Invisalign Financing Options to Lina Khalil',
        type: 'Email',
        taskType: 'Email',
        linked_lead_id: leads[8].id,
        leadId: leads[8].id,
        leadName: 'Lina Khalil',
        assignee_id: agentId,
        assigneeId: agentId,
        assignedAgentId: agentId,
        due_date: daysFromNow(2),
        dueDate: `${daysFromNow(2)}T14:00:00`,
        due_time: '14:00',
        dueTime: '14:00',
        priority: 'High',
        status: 'Pending',
        completion_notes: '',
        created_at: daysAgo(0),
        createdAt: daysAgo(0),
        created_by: agentId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[0],
        clinicId: clinicCycle[0],
      },
      {
        id: crypto.randomUUID(),
        title: 'Quarterly Clinic Branch Equipment Audit',
        type: 'Custom',
        taskType: 'Custom',
        linked_lead_id: null,
        leadId: null,
        leadName: '',
        assignee_id: orgAdminId,
        assigneeId: orgAdminId,
        assignedAgentId: orgAdminId,
        due_date: daysFromNow(4),
        dueDate: `${daysFromNow(4)}T10:00:00`,
        due_time: '10:00',
        dueTime: '10:00',
        priority: 'Low',
        status: 'Pending',
        completion_notes: '',
        created_at: daysAgo(1),
        createdAt: daysAgo(1),
        created_by: orgAdminId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[0],
        clinicId: clinicCycle[0],
      },

      // COMPLETED TASKS
      {
        id: crypto.randomUUID(),
        title: 'Confirm Cosmetic Consultation with Lina Khalil',
        type: 'Call',
        taskType: 'Call',
        linked_lead_id: leads[8].id,
        leadId: leads[8].id,
        leadName: 'Lina Khalil',
        assignee_id: agentId,
        assigneeId: agentId,
        assignedAgentId: agentId,
        due_date: todayDateStr,
        dueDate: `${todayDateStr}T11:00:00`,
        due_time: '11:00',
        dueTime: '11:00',
        priority: 'High',
        status: 'Completed',
        completion_notes: 'Patient confirmed attendance for tomorrow morning at Downtown branch.',
        completed_at: daysAgo(0),
        completedAt: daysAgo(0),
        created_at: daysAgo(1),
        createdAt: daysAgo(1),
        created_by: agentId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[0],
        clinicId: clinicCycle[0],
      },
      {
        id: crypto.randomUUID(),
        title: 'Initial Intake Call with Khalid Mansour',
        type: 'Call',
        taskType: 'Call',
        linked_lead_id: leads[4].id,
        leadId: leads[4].id,
        leadName: 'Khalid Mansour',
        assignee_id: agentId,
        assigneeId: agentId,
        assignedAgentId: agentId,
        due_date: daysAgoDate(2),
        dueDate: `${daysAgoDate(2)}T14:30:00`,
        due_time: '14:30',
        dueTime: '14:30',
        priority: 'Normal',
        status: 'Completed',
        completion_notes: 'Discussed veneer pricing options and scheduled in-clinic 3D scan.',
        completed_at: daysAgo(2),
        completedAt: daysAgo(2),
        created_at: daysAgo(3),
        createdAt: daysAgo(3),
        created_by: agentId,
        organization_id: orgId,
        orgId: orgId,
        clinic_id: clinicCycle[0],
        clinicId: clinicCycle[0],
      },
    ];
    this.set(STORAGE_KEYS.TASKS, tasks);

    // ── Calls (last 7 days) ───────────────────────────────────
    const calls = [
      { id: crypto.randomUUID(), clinicId: clinicCycle[0], agentId, date: daysAgo(6), duration: 180, outcome: 'contacted',  leadName: 'Khalid Mansour',  leadId: leads[4].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[1], agentId, date: daysAgo(6), duration: 0,   outcome: 'no-answer',  leadName: 'Tariq Al-Fahad',  leadId: leads[9].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[2], agentId, date: daysAgo(5), duration: 240, outcome: 'booked',     leadName: 'Hana Yousef',     leadId: leads[10].id },
      { id: crypto.randomUUID(), clinicId: clinicCycle[3], agentId, date: daysAgo(5), duration: 310, outcome: 'contacted',  leadName: 'Omar Tariq',      leadId: leads[7].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[0], agentId, date: daysAgo(5), duration: 0,   outcome: 'missed',     leadName: 'Tariq Al-Fahad',  leadId: leads[9].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[1], agentId, date: daysAgo(4), duration: 420, outcome: 'booked',     leadName: 'Fatima Al-Zaidi', leadId: leads[3].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[2], agentId, date: daysAgo(4), duration: 195, outcome: 'contacted',  leadName: 'Lina Khalil',     leadId: leads[8].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[3], agentId, date: daysAgo(3), duration: 275, outcome: 'booked',     leadName: 'Ahmed Al-Rashidi',leadId: leads[0].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[0], agentId, date: daysAgo(3), duration: 0,   outcome: 'no-answer',  leadName: 'Samir Boutros',   leadId: leads[11].id },
      { id: crypto.randomUUID(), clinicId: clinicCycle[1], agentId, date: daysAgo(3), duration: 120, outcome: 'contacted',  leadName: 'Nour El-Masry',   leadId: leads[5].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[2], agentId, date: daysAgo(2), duration: 530, outcome: 'booked',     leadName: 'Sara Johnson',    leadId: leads[1].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[3], agentId, date: daysAgo(2), duration: 210, outcome: 'contacted',  leadName: 'Rania Haddad',    leadId: leads[6].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[0], agentId, date: daysAgo(2), duration: 0,   outcome: 'missed',     leadName: 'Khalid Mansour',  leadId: leads[4].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[1], agentId, date: daysAgo(1), duration: 380, outcome: 'booked',     leadName: 'Mohammed Hassan', leadId: leads[2].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[2], agentId, date: daysAgo(1), duration: 145, outcome: 'contacted',  leadName: 'Omar Tariq',      leadId: leads[7].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[3], agentId, date: daysAgo(0), duration: 290, outcome: 'contacted',  leadName: 'Ahmed Al-Rashidi',leadId: leads[0].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[0], agentId, date: daysAgo(0), duration: 0,   outcome: 'no-answer',  leadName: 'Nour El-Masry',   leadId: leads[5].id  },
      { id: crypto.randomUUID(), clinicId: clinicCycle[1], agentId, date: daysAgo(0), duration: 470, outcome: 'booked',     leadName: 'Hana Yousef',     leadId: leads[10].id },
    ];
    this.set(STORAGE_KEYS.CALLS, calls);

    // ── Revenue (monthly stats per clinic) ────────────────────
    const revenue = [
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.DOWNTOWN, agentId, month: '2026-08', revenue: 18400, conversions: 5,  leadsAssigned: 12, conversionRate: 41.7 },
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.CENTRAL,  agentId, month: '2026-08', revenue: 12100, conversions: 4,  leadsAssigned: 10, conversionRate: 40.0 },
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.WEST,     agentId, month: '2026-08', revenue: 9800,  conversions: 3,  leadsAssigned: 8,  conversionRate: 37.5 },
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.EAST,     agentId, month: '2026-08', revenue: 7900,  conversions: 2,  leadsAssigned: 6,  conversionRate: 33.3 },
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.DOWNTOWN, agentId, month: '2026-07', revenue: 16200, conversions: 9,  leadsAssigned: 28, conversionRate: 32.1 },
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.CENTRAL,  agentId, month: '2026-07', revenue: 10800, conversions: 7,  leadsAssigned: 23, conversionRate: 30.4 },
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.WEST,     agentId, month: '2026-07', revenue: 9300,  conversions: 4,  leadsAssigned: 18, conversionRate: 22.2 },
      { id: crypto.randomUUID(), clinicId: CLINIC_IDS.EAST,     agentId, month: '2026-07', revenue: 6800,  conversions: 3,  leadsAssigned: 15, conversionRate: 20.0 },
    ];
    this.set(STORAGE_KEYS.REVENUE, revenue);
  }

  // Expose Keys for strict usage
  KEYS = STORAGE_KEYS;
}

// Export a singleton instance
export const storageService = new StorageService();
