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
      { id: 'clinic-downtown', name: 'Downtown Dental Excellence', city: 'Riyadh', status: 'active' },
      { id: 'clinic-west', name: 'Westside Pediatric & Family', city: 'Riyadh', status: 'active' },
      { id: 'clinic-003', name: 'Gulberg Dental Studio', city: 'Lahore', status: 'active' },
      { id: 'clinic-004', name: 'Clifton Oral Care', city: 'Karachi', status: 'active' },
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
      { id: 'clinic-005', name: 'Marina Branch', city: 'Dubai', status: 'active' },
      { id: 'clinic-006', name: 'Jumeirah Care', city: 'Dubai', status: 'active' },
      { id: 'clinic-007', name: 'Downtown Dubai Clinic', city: 'Dubai', status: 'active' },
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
      { id: 'clinic-008', name: 'Kensington Clinic', city: 'London', status: 'inactive' },
      { id: 'clinic-009', name: 'Westminster Dental', city: 'London', status: 'inactive' },
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
      { id: 'clinic-central', name: 'Apex Orthodontics & Smiles', city: 'Jeddah', status: 'active' },
      { id: 'clinic-011', name: 'Brooklyn Orthodontics', city: 'New York', status: 'active' },
      { id: 'clinic-east', name: 'Metro Cosmetic Care', city: 'Dammam', status: 'active' },
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
      { id: 'clinic-013', name: 'Olaya Dental Center', city: 'Riyadh', status: 'active' },
      { id: 'clinic-014', name: 'Corniche Jeddah Clinic', city: 'Jeddah', status: 'active' },
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
      { id: 'clinic-015', name: 'Business Bay Branch', city: 'Dubai', status: 'active' },
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
        id: orgData.id || `org-${Date.now().toString(36)}`,
        name: orgData.name,
        logoUrl: orgData.logoUrl || null,
        brandColor: orgData.brandColor || orgData.brandingColor || '#0F766E',
        brandingColor: orgData.brandColor || orgData.brandingColor || '#0F766E',
        status: orgData.status || 'active',
        timezone: orgData.timezone || 'Asia/Karachi',
        currency: orgData.currency || 'USD',
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
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

      const brandColor = updates.brandColor || updates.brandingColor || orgs[index].brandColor || orgs[index].brandingColor;

      const updatedOrg = {
        ...orgs[index],
        ...updates,
        brandColor,
        brandingColor: brandColor,
        updatedAt: new Date().toISOString(),
      };

      const updatedOrgs = [...orgs];
      updatedOrgs[index] = updatedOrg;
      storageService.set(this.getStorageKey(), updatedOrgs);

      return createSuccess(updatedOrg, 'Organization updated successfully.');
    } catch (error) {
      return createError('Failed to update organization.', error);
    }
  }

  /**
   * Delete an organization by ID.
   */
  async deleteOrganization(id) {
    try {
      const orgs = this.getOrganizationsSync();
      const filtered = orgs.filter((o) => o.id !== id);
      storageService.set(this.getStorageKey(), filtered);
      return createSuccess({ id }, 'Organization deleted successfully.');
    } catch (error) {
      return createError('Failed to delete organization.', error);
    }
  }

  getOrganizationById(id) {
    const orgs = this.getOrganizationsSync();
    return orgs.find((o) => o.id === id) || null;
  }
}

export const organizationsService = new OrganizationsService();
