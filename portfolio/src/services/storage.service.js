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

const STORAGE_KEYS = {
  USERS:        'dental_crm_users',
  ORGS:         'dental_crm_orgs',
  CLINICS:      'dental_crm_clinics',
  PATIENTS:     'dental_crm_patients',
  APPOINTMENTS: 'dental_crm_appointments',
  CURRENT_USER: 'dental_crm_current_user',
  LEADS:        'dental_crm_leads',
  TASKS:        'dental_crm_tasks',
  CALLS:        'dental_crm_calls',
  REVENUE:      'dental_crm_revenue',
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
      // Re-seed CRM data if missing (e.g. after partial clear)
      if (!this.get(STORAGE_KEYS.LEADS)) this._seedCRMData(existingUsers);
      return;
    }

    console.log('Seeding Database...');

    const orgId     = crypto.randomUUID();
    const clinicId1 = crypto.randomUUID();
    const clinicId2 = crypto.randomUUID();

    // 1. Seed Organizations
    const orgs = [
      { id: orgId, name: 'Aurea Dental Group', createdAt: new Date().toISOString() }
    ];
    this.set(STORAGE_KEYS.ORGS, orgs);

    // 2. Seed Clinics
    const clinics = [
      { id: clinicId1, orgId, name: 'Downtown Dental',  city: 'New York' },
      { id: clinicId2, orgId, name: 'Uptown Smiles',    city: 'New York' },
    ];
    this.set(STORAGE_KEYS.CLINICS, clinics);

    // 3. Seed Users
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
      { ...baseUser, id: crypto.randomUUID(), fullName: 'System Administrator',    email: 'superadmin@test.com',  role: ROLES.SUPER_ADMIN,    organizationId: null,  clinicIds: []                       },
      { ...baseUser, id: crypto.randomUUID(), fullName: 'Organization Admin',       email: 'orgadmin@test.com',    role: ROLES.ORG_ADMIN,      organizationId: orgId, clinicIds: [clinicId1, clinicId2]   },
      { ...baseUser, id: crypto.randomUUID(), fullName: 'Clinic Manager',           email: 'manager@test.com',     role: ROLES.CLINIC_MANAGER, organizationId: orgId, clinicIds: [clinicId1]               },
      { ...baseUser, id: crypto.randomUUID(), fullName: 'Sales Agent',              email: 'agent@test.com',       role: ROLES.AGENT,          organizationId: orgId, clinicIds: [clinicId1, clinicId2]   },
      { ...baseUser, id: crypto.randomUUID(), fullName: 'Front Desk Receptionist',  email: 'reception@test.com',   role: ROLES.RECEPTIONIST,   organizationId: orgId, clinicIds: [clinicId1]               },
      { ...baseUser, id: crypto.randomUUID(), fullName: 'Finance Controller',       email: 'finance@test.com',     role: ROLES.FINANCE,        organizationId: orgId, clinicIds: [clinicId1, clinicId2]   },
      { ...baseUser, id: crypto.randomUUID(), fullName: 'External Auditor',         email: 'auditor@test.com',     role: ROLES.AUDITOR,        organizationId: orgId, clinicIds: []                       },
    ];
    this.set(STORAGE_KEYS.USERS, users);

    // 4. Seed Patients
    const patientId1 = crypto.randomUUID();
    const patientId2 = crypto.randomUUID();
    const patients = [
      { id: patientId1, clinicId: clinicId1, fullName: 'John Doe',   phone: '+1-555-1234' },
      { id: patientId2, clinicId: clinicId2, fullName: 'Jane Smith', phone: '+1-555-5678' },
    ];
    this.set(STORAGE_KEYS.PATIENTS, patients);

    // 5. Seed Appointments
    const appointments = [
      { id: crypto.randomUUID(), clinicId: clinicId1, patientId: patientId1, date: new Date().toISOString(), status: 'scheduled' },
      { id: crypto.randomUUID(), clinicId: clinicId2, patientId: patientId2, date: new Date().toISOString(), status: 'completed' },
    ];
    this.set(STORAGE_KEYS.APPOINTMENTS, appointments);

    // 6. Seed CRM Data (Leads, Tasks, Calls, Revenue)
    this._seedCRMData(users);
  }

  /**
   * Seeds Leads, Tasks, Calls, and Revenue for the Agent user.
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

    // ── Leads ─────────────────────────────────────────────────
    const leads = [
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Ahmed Al-Rashidi',  treatment: 'Dental Implant',      status: 'qualified', priority: 'high',   lastActivity: 'Called — interested',         lastActivityDate: daysAgo(0), phone: '+971-50-1234567', email: 'ahmed@example.com',  source: 'Google Ads', createdAt: daysAgo(12) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Sara Johnson',       treatment: 'Teeth Whitening',     status: 'new',       priority: 'medium', lastActivity: 'Form submitted',              lastActivityDate: daysAgo(0), phone: '+1-555-2345',    email: 'sara@example.com',   source: 'Instagram', createdAt: daysAgo(1) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Mohammed Hassan',    treatment: 'Root Canal',          status: 'contacted', priority: 'high',   lastActivity: 'Left voicemail',              lastActivityDate: daysAgo(1), phone: '+966-55-9876543', email: 'moh@example.com',    source: 'Website', createdAt: daysAgo(5) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Fatima Al-Zaidi',    treatment: 'Orthodontics',        status: 'proposal',  priority: 'medium', lastActivity: 'Sent treatment plan PDF',     lastActivityDate: daysAgo(1), phone: '+971-55-3456789', email: 'fatima@example.com', source: 'Referral', createdAt: daysAgo(8) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Khalid Mansour',     treatment: 'Veneers',             status: 'converted', priority: 'low',    lastActivity: 'Booked appointment',          lastActivityDate: daysAgo(2), phone: '+966-50-7654321', email: 'khalid@example.com', source: 'WhatsApp', createdAt: daysAgo(15) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Nour El-Masry',      treatment: 'Dental Cleaning',     status: 'new',       priority: 'low',    lastActivity: 'Assigned to agent',           lastActivityDate: daysAgo(0), phone: '+20-10-1234567',  email: 'nour@example.com',   source: 'Google Ads', createdAt: daysAgo(0) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Rania Haddad',       treatment: 'Teeth Whitening',     status: 'contacted', priority: 'medium', lastActivity: 'WhatsApp message sent',       lastActivityDate: daysAgo(2), phone: '+961-70-9876543', email: 'rania@example.com',  source: 'Instagram', createdAt: daysAgo(3) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Omar Tariq',         treatment: 'Dental Implant',      status: 'qualified', priority: 'high',   lastActivity: 'Video call completed',        lastActivityDate: daysAgo(3), phone: '+92-300-1234567', email: 'omar@example.com',   source: 'Google Ads', createdAt: daysAgo(6) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Lina Khalil',        treatment: 'Invisalign',          status: 'proposal',  priority: 'high',   lastActivity: 'Proposal sent via email',     lastActivityDate: daysAgo(3), phone: '+961-71-5432109', email: 'lina@example.com',   source: 'Referral', createdAt: daysAgo(9) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Tariq Al-Fahad',     treatment: 'Root Canal',          status: 'lost',      priority: 'low',    lastActivity: 'No response after 3 tries',   lastActivityDate: daysAgo(5), phone: '+966-54-3210987', email: 'tariq@example.com',  source: 'TV Ad', createdAt: daysAgo(20) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Hana Yousef',        treatment: 'Crown & Bridge',      status: 'converted', priority: 'medium', lastActivity: 'Appointment confirmed',        lastActivityDate: daysAgo(4), phone: '+962-79-8765432', email: 'hana@example.com',   source: 'Website', createdAt: daysAgo(11) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, patientName: 'Samir Boutros',      treatment: 'Teeth Whitening',     status: 'contacted', priority: 'low',    lastActivity: 'Called — no answer',          lastActivityDate: daysAgo(1), phone: '+20-12-9876543',  email: 'samir@example.com',  source: 'Instagram', createdAt: daysAgo(2) },
    ];
    this.set(STORAGE_KEYS.LEADS, leads);

    // ── Tasks ──────────────────────────────────────────────────
    const tasks = [
      { id: crypto.randomUUID(), assignedAgentId: agentId, dueTime: '09:00', taskType: 'Call',      leadName: 'Ahmed Al-Rashidi', leadId: leads[0].id, priority: 'high',   status: 'pending',   dueDate: todayAt('09:00'), createdAt: daysAgo(1) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, dueTime: '10:30', taskType: 'Follow-up', leadName: 'Sara Johnson',      leadId: leads[1].id, priority: 'medium', status: 'pending',   dueDate: todayAt('10:30'), createdAt: daysAgo(1) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, dueTime: '08:00', taskType: 'Email',     leadName: 'Mohammed Hassan',   leadId: leads[2].id, priority: 'high',   status: 'pending',   dueDate: todayAt('08:00'), createdAt: daysAgo(2) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, dueTime: '13:00', taskType: 'WhatsApp',  leadName: 'Rania Haddad',      leadId: leads[6].id, priority: 'medium', status: 'pending',   dueDate: todayAt('13:00'), createdAt: daysAgo(0) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, dueTime: '15:00', taskType: 'Demo Call', leadName: 'Omar Tariq',        leadId: leads[7].id, priority: 'high',   status: 'pending',   dueDate: todayAt('15:00'), createdAt: daysAgo(0) },
      { id: crypto.randomUUID(), assignedAgentId: agentId, dueTime: '11:00', taskType: 'Call',      leadName: 'Lina Khalil',       leadId: leads[8].id, priority: 'high',   status: 'completed', dueDate: todayAt('11:00'), createdAt: daysAgo(0) },
    ];
    this.set(STORAGE_KEYS.TASKS, tasks);

    // ── Calls (last 7 days) ───────────────────────────────────
    const calls = [
      { id: crypto.randomUUID(), agentId, date: daysAgo(6), duration: 180, outcome: 'contacted',  leadName: 'Khalid Mansour',  leadId: leads[4].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(6), duration: 0,   outcome: 'no-answer',  leadName: 'Tariq Al-Fahad',  leadId: leads[9].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(5), duration: 240, outcome: 'booked',     leadName: 'Hana Yousef',     leadId: leads[10].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(5), duration: 310, outcome: 'contacted',  leadName: 'Omar Tariq',      leadId: leads[7].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(5), duration: 0,   outcome: 'missed',     leadName: 'Tariq Al-Fahad',  leadId: leads[9].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(4), duration: 420, outcome: 'booked',     leadName: 'Fatima Al-Zaidi', leadId: leads[3].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(4), duration: 195, outcome: 'contacted',  leadName: 'Lina Khalil',     leadId: leads[8].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(3), duration: 275, outcome: 'booked',     leadName: 'Ahmed Al-Rashidi',leadId: leads[0].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(3), duration: 0,   outcome: 'no-answer',  leadName: 'Samir Boutros',   leadId: leads[11].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(3), duration: 120, outcome: 'contacted',  leadName: 'Nour El-Masry',   leadId: leads[5].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(2), duration: 530, outcome: 'booked',     leadName: 'Sara Johnson',    leadId: leads[1].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(2), duration: 210, outcome: 'contacted',  leadName: 'Rania Haddad',    leadId: leads[6].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(2), duration: 0,   outcome: 'missed',     leadName: 'Khalid Mansour',  leadId: leads[4].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(1), duration: 380, outcome: 'booked',     leadName: 'Mohammed Hassan', leadId: leads[2].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(1), duration: 145, outcome: 'contacted',  leadName: 'Omar Tariq',      leadId: leads[7].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(0), duration: 290, outcome: 'contacted',  leadName: 'Ahmed Al-Rashidi',leadId: leads[0].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(0), duration: 0,   outcome: 'no-answer',  leadName: 'Nour El-Masry',   leadId: leads[5].id },
      { id: crypto.randomUUID(), agentId, date: daysAgo(0), duration: 470, outcome: 'booked',     leadName: 'Hana Yousef',     leadId: leads[10].id },
    ];
    this.set(STORAGE_KEYS.CALLS, calls);

    // ── Revenue (monthly stats per agent) ─────────────────────
    const revenue = [
      { id: crypto.randomUUID(), agentId, month: '2026-08', revenue: 12400, conversions: 5,  leadsAssigned: 12, conversionRate: 41.7 },
      { id: crypto.randomUUID(), agentId, month: '2026-07', revenue: 18750, conversions: 9,  leadsAssigned: 28, conversionRate: 32.1 },
      { id: crypto.randomUUID(), agentId, month: '2026-06', revenue: 15200, conversions: 7,  leadsAssigned: 23, conversionRate: 30.4 },
      { id: crypto.randomUUID(), agentId, month: '2026-05', revenue: 9800,  conversions: 4,  leadsAssigned: 18, conversionRate: 22.2 },
      { id: crypto.randomUUID(), agentId, month: '2026-04', revenue: 21000, conversions: 11, leadsAssigned: 32, conversionRate: 34.4 },
      { id: crypto.randomUUID(), agentId, month: '2026-03', revenue: 16500, conversions: 8,  leadsAssigned: 25, conversionRate: 32.0 },
    ];
    this.set(STORAGE_KEYS.REVENUE, revenue);
  }

  // Expose Keys for strict usage
  KEYS = STORAGE_KEYS;
}

// Export a singleton instance
export const storageService = new StorageService();
