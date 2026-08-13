import { storageService } from './storage.service';
import { createSuccess, createError } from '../utils/response.util';

export const INITIAL_ORGANIZATIONS = [
  {
    id: 'org-001',
    name: 'Smile Care Group',
    status: 'active',
    timezone: 'Asia/Karachi',
    currency: 'PKR',
    brandingColor: '#0F766E',
    createdAt: '2026-01-12',
    clinics: [
      { id: 'clinic-001', name: 'Downtown Dental Excellence', status: 'active' },
      { id: 'clinic-002', name: 'Westside Dental Clinic', status: 'active' },
      { id: 'clinic-003', name: 'Gulberg Dental Studio', status: 'active' },
      { id: 'clinic-004', name: 'Clifton Oral Care', status: 'active' },
    ],
    users: [
      { id: 'user-001', name: 'Dr. John Doe', role: 'org_admin' },
      { id: 'user-002', name: 'Sarah Khan', role: 'manager' },
      { id: 'user-003', name: 'Ali Raza', role: 'agent' },
    ],
    newLeadsCount: 42,
    revenue: 18400,
  },
  {
    id: 'org-002',
    name: 'Dental Plus',
    status: 'active',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    brandingColor: '#2563EB',
    createdAt: '2026-02-04',
    clinics: [
      { id: 'clinic-005', name: 'Marina Branch', status: 'active' },
      { id: 'clinic-006', name: 'Jumeirah Care', status: 'active' },
      { id: 'clinic-007', name: 'Downtown Dubai Clinic', status: 'active' },
    ],
    users: [
      { id: 'user-004', name: 'Tariq Mansoor', role: 'org_admin' },
      { id: 'user-005', name: 'Fatima Al-Sayed', role: 'manager' },
    ],
    newLeadsCount: 31,
    revenue: 12100,
  },
  {
    id: 'org-003',
    name: 'Bright Dental',
    status: 'inactive',
    timezone: 'Europe/London',
    currency: 'GBP',
    brandingColor: '#D97706',
    createdAt: '2026-03-18',
    clinics: [
      { id: 'clinic-008', name: 'Kensington Clinic', status: 'inactive' },
      { id: 'clinic-009', name: 'Westminster Dental', status: 'inactive' },
    ],
    users: [
      { id: 'user-006', name: 'Edward Smith', role: 'org_admin' },
      { id: 'user-007', name: 'Emma Watson', role: 'agent' },
    ],
    newLeadsCount: 14,
    revenue: 3500,
  },
  {
    id: 'org-004',
    name: 'Apex Dental Group',
    status: 'active',
    timezone: 'America/New_York',
    currency: 'USD',
    brandingColor: '#7C3AED',
    createdAt: '2026-01-05',
    clinics: [
      { id: 'clinic-010', name: 'Manhattan Smile Hub', status: 'active' },
      { id: 'clinic-011', name: 'Brooklyn Orthodontics', status: 'active' },
      { id: 'clinic-012', name: 'Queens Family Dental', status: 'active' },
    ],
    users: [
      { id: 'user-008', name: 'Michael Chang', role: 'org_admin' },
      { id: 'user-009', name: 'Jessica Taylor', role: 'manager' },
    ],
    newLeadsCount: 22,
    revenue: 9800,
  },
  {
    id: 'org-005',
    name: 'Saudi Smiles',
    status: 'active',
    timezone: 'Asia/Riyadh',
    currency: 'SAR',
    brandingColor: '#059669',
    createdAt: '2026-02-20',
    clinics: [
      { id: 'clinic-013', name: 'Olaya Dental Center', status: 'active' },
      { id: 'clinic-014', name: 'Corniche Jeddah Clinic', status: 'active' },
    ],
    users: [
      { id: 'user-010', name: 'Abdullah Al-Ghamdi', role: 'org_admin' },
      { id: 'user-011', name: 'Reem Khalid', role: 'agent' },
    ],
    newLeadsCount: 11,
    revenue: 3450,
  },
  {
    id: 'org-006',
    name: 'Crown & Care Dental',
    status: 'active',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    brandingColor: '#E11D48',
    createdAt: '2026-03-01',
    clinics: [
      { id: 'clinic-015', name: 'Business Bay Branch', status: 'active' },
    ],
    users: [
      { id: 'user-012', name: 'Zaid Al-Harbi', role: 'org_admin' },
    ],
    newLeadsCount: 4,
    revenue: 1500,
  },
];

class OrganizationsService {
  getStorageKey() {
    return storageService.KEYS.ORGS || 'dental_crm_orgs';
  }

  /**
   * Fetch all organizations from LocalStorage (or seed defaults if empty).
   */
  async getOrganizations() {
    try {
      let orgs = storageService.get(this.getStorageKey());
      if (!orgs || !Array.isArray(orgs) || orgs.length === 0 || !orgs[0].clinics) {
        orgs = INITIAL_ORGANIZATIONS;
        storageService.set(this.getStorageKey(), orgs);
      }
      return createSuccess(orgs, 'Organizations retrieved successfully.');
    } catch (error) {
      return createError('Failed to fetch organizations.', error);
    }
  }

  /**
   * Synchronously get organizations from LocalStorage for immediate render.
   */
  getOrganizationsSync() {
    try {
      let orgs = storageService.get(this.getStorageKey());
      if (!orgs || !Array.isArray(orgs) || orgs.length === 0 || !orgs[0].clinics) {
        orgs = INITIAL_ORGANIZATIONS;
        storageService.set(this.getStorageKey(), orgs);
      }
      return orgs;
    } catch (error) {
      console.error('Error fetching orgs sync:', error);
      return INITIAL_ORGANIZATIONS;
    }
  }

  /**
   * Create a new organization.
   * // TODO: replace with Supabase call when backend is ready
   */
  async createOrganization(orgData) {
    try {
      // TODO: replace with Supabase call when backend is ready
      const orgs = this.getOrganizationsSync();

      const newOrg = {
        id: `org-${Date.now().toString(36)}`,
        name: orgData.name,
        status: orgData.status || 'active',
        timezone: orgData.timezone || 'Asia/Karachi',
        currency: orgData.currency || 'PKR',
        brandingColor: orgData.brandingColor || '#0F766E',
        createdAt: new Date().toISOString().split('T')[0],
        clinics: [],
        users: [],
        newLeadsCount: 0,
        revenue: 0,
      };

      const updatedOrgs = [newOrg, ...orgs];
      storageService.set(this.getStorageKey(), updatedOrgs);

      return createSuccess(newOrg, 'Organization created successfully.');
    } catch (error) {
      return createError('Failed to create organization.', error);
    }
  }

  /**
   * Update an existing organization.
   * // TODO: replace with Supabase call when backend is ready
   */
  async updateOrganization(id, updates) {
    try {
      // TODO: replace with Supabase call when backend is ready
      const orgs = this.getOrganizationsSync();
      const index = orgs.findIndex((o) => o.id === id);

      if (index === -1) {
        return createError('Organization not found.');
      }

      const updatedOrg = {
        ...orgs[index],
        ...updates,
      };

      const updatedOrgs = [...orgs];
      updatedOrgs[index] = updatedOrg;
      storageService.set(this.getStorageKey(), updatedOrgs);

      return createSuccess(updatedOrg, 'Organization updated successfully.');
    } catch (error) {
      return createError('Failed to update organization.', error);
    }
  }
}

export const organizationsService = new OrganizationsService();
