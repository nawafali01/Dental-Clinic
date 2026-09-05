import { storageService } from './storage.service';

/**
 * CLINICS SERVICE
 * Dedicated domain service for Clinic branches CRUD.
 */
export const clinicsService = {
  getClinics() {
    return storageService.get(storageService.KEYS.CLINICS) || [];
  },

  getClinicById(id) {
    const clinics = this.getClinics();
    return clinics.find((c) => c.id === id) || null;
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
      orgId: clinicData.orgId || null,
      status: clinicData.status || 'active',
      operatingHours: clinicData.operatingHours || '08:00 AM - 08:00 PM',
      chairsCount: Number(clinicData.chairsCount) || 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...clinics, newClinic];
    storageService.set(storageService.KEYS.CLINICS, updated);
    return newClinic;
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
    return updatedClinic;
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
export const addClinic = (data) => clinicsService.addClinic(data);
export const updateClinic = (id, updates) => clinicsService.updateClinic(id, updates);
export const deleteClinic = (id) => clinicsService.deleteClinic(id);
export const toggleClinicStatus = (id) => clinicsService.toggleClinicStatus(id);
