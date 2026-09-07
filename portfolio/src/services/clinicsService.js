import { storageService } from './storage.service';
import { CLINICS } from '@/constants/clinics';
import { usersService } from './usersService';

/**
 * CLINICS SERVICE
 * Dedicated domain service for Clinic branches CRUD.
 * Keeps storage synchronized with the canonical list of clinics and organizations,
 * and dynamically enriches clinics with real manager data from usersService.
 */
export const clinicsService = {
  _enrichWithManager(clinic) {
    if (!clinic) return null;
    try {
      const users = usersService.getUsers();
      let managerUser = null;
      if (clinic.managerId) {
        managerUser = users.find((u) => u.id === clinic.managerId);
      }
      if (!managerUser) {
        managerUser = users.find(
          (u) =>
            u.role === 'clinic_manager' &&
            (u.clinicId === clinic.id || (Array.isArray(u.clinicIds) && u.clinicIds.includes(clinic.id)))
        );
      }
      return {
        ...clinic,
        managerId: managerUser ? managerUser.id : (clinic.managerId || null),
        manager: managerUser ? (managerUser.name || managerUser.fullName) : (clinic.manager || 'Unassigned'),
      };
    } catch {
      return clinic;
    }
  },

  getClinics() {
    const primaryClinics = CLINICS.filter((c) => !c.isAlias);
    let storedClinics = storageService.get(storageService.KEYS.CLINICS) || [];

    // If stored clinics are empty or missing any canonical clinics, sync with canonical master
    const storedMap = new Map((storedClinics || []).map((c) => [c.id, c]));
    const isOutOfSync =
      !storedClinics ||
      storedClinics.length < primaryClinics.length ||
      primaryClinics.some((pc) => !storedMap.has(pc.id) || !storedMap.get(pc.id)?.orgId);

    if (isOutOfSync) {
      const unifiedClinics = primaryClinics.map((pc, idx) => {
        const existing = storedMap.get(pc.id);
        return {
          id: pc.id,
          orgId: pc.orgId,
          name: pc.name,
          city: pc.city || 'Riyadh',
          address: existing?.address || `${pc.city || 'Central'} Medical District, Suite ${100 + idx * 10}`,
          phone: existing?.phone || `+1 (555) 020-00${String(idx + 1).padStart(2, '0')}`,
          email: existing?.email || `contact@${pc.id}.com`,
          status: existing?.status || pc.status || 'active',
          operatingHours: existing?.operatingHours || '08:00 AM - 08:00 PM',
          chairsCount: existing?.chairsCount || (idx % 2 === 0 ? 5 : 4),
          createdAt: existing?.createdAt || '2026-01-15T00:00:00.000Z',
          updatedAt: existing?.updatedAt || '2026-01-15T00:00:00.000Z',
        };
      });

      // Preserve any custom user-added clinics as well
      const userAdded = (storedClinics || []).filter(
        (sc) => !primaryClinics.some((pc) => pc.id === sc.id)
      );

      const finalClinics = [...unifiedClinics, ...userAdded];
      storageService.set(storageService.KEYS.CLINICS, finalClinics);
      return finalClinics.map((c) => this._enrichWithManager(c));
    }

    return (storedClinics || []).map((c) => this._enrichWithManager(c));
  },

  getClinicById(id) {
    const clinics = this.getClinics();
    const found = clinics.find((c) => c.id === id) || null;
    return this._enrichWithManager(found);
  },

  getClinicsByOrg(orgId) {
    const clinics = this.getClinics();
    if (!orgId || orgId === 'all') return clinics;
    return clinics.filter((c) => c.orgId === orgId);
  },

  addClinic(clinicData) {
    const clinics = this.getClinics();
    const slugId =
      'clinic-' +
      clinicData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const newClinic = {
      id: slugId || `clinic-${Date.now()}`,
      name: clinicData.name.trim(),
      city: clinicData.city || 'Riyadh',
      address: clinicData.address || `${clinicData.city || 'Riyadh'} Central District`,
      phone: clinicData.phone || '+1 (555) 020-0000',
      email: clinicData.email || `contact@${slugId || 'clinic'}.com`,
      orgId: clinicData.orgId || 'org-001',
      status: clinicData.status || 'active',
      operatingHours: clinicData.operatingHours || '08:00 AM - 08:00 PM',
      chairsCount: Number(clinicData.chairsCount) || 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...clinics, newClinic];
    storageService.set(storageService.KEYS.CLINICS, updated);
    return this._enrichWithManager(newClinic);
  },

  updateClinic(id, updates) {
    const clinics = this.getClinics();
    const index = clinics.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Clinic not found');

    const updatedClinic = {
      ...clinics[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    clinics[index] = updatedClinic;
    storageService.set(storageService.KEYS.CLINICS, clinics);
    return this._enrichWithManager(updatedClinic);
  },

  deleteClinic(id) {
    const clinics = this.getClinics();
    const updated = clinics.filter((c) => c.id !== id);
    storageService.set(storageService.KEYS.CLINICS, updated);
    return updated;
  },

  toggleClinicStatus(id) {
    const clinic = this.getClinicById(id);
    if (!clinic) throw new Error('Clinic not found');
    const newStatus = clinic.status === 'active' ? 'inactive' : 'active';
    return this.updateClinic(id, { status: newStatus });
  },
};

export const getClinics = () => clinicsService.getClinics();
export const getClinicById = (id) => clinicsService.getClinicById(id);
export const getClinicsByOrg = (orgId) => clinicsService.getClinicsByOrg(orgId);
export const addClinic = (data) => clinicsService.addClinic(data);
export const updateClinic = (id, updates) => clinicsService.updateClinic(id, updates);
export const deleteClinic = (id) => clinicsService.deleteClinic(id);
export const toggleClinicStatus = (id) => clinicsService.toggleClinicStatus(id);
