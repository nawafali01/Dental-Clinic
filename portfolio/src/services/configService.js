import { storageService } from './storage.service';
import { treatmentsConfigRows } from '@/data/routesData';

const KEYS = {
  TREATMENTS: storageService.KEYS.TREATMENTS_CONFIG || 'dental_crm_treatments_config',
};

// ─────────────────────────────────────────────────────────────
// TREATMENTS SERVICE
// ─────────────────────────────────────────────────────────────
export const treatmentsService = {
  getTreatments() {
    const data = storageService.get(KEYS.TREATMENTS);
    if (!data || !Array.isArray(data) || data.length === 0) {
      const seeded = treatmentsConfigRows.map((t, idx) => ({
        id: `t-${idx + 1}`,
        ...t,
      }));
      storageService.set(KEYS.TREATMENTS, seeded);
      return seeded;
    }
    return data;
  },

  addTreatment(treatmentData) {
    const treatments = this.getTreatments();
    const newTreatment = {
      id: `t-${Date.now()}`,
      treatment: treatmentData.treatment.trim(),
      category: treatmentData.category || 'General',
      duration: treatmentData.duration || '45 min',
      price: treatmentData.price.startsWith('$') ? treatmentData.price : `$${treatmentData.price}`,
      status: treatmentData.status || 'Active',
      color: treatmentData.status === 'Active' ? 'green' : 'amber',
      createdAt: new Date().toISOString(),
    };
    const updated = [newTreatment, ...treatments];
    storageService.set(KEYS.TREATMENTS, updated);
    return newTreatment;
  },

  updateTreatment(id, updates) {
    const treatments = this.getTreatments();
    const index = treatments.findIndex((t) => t.id === id || t.treatment === id);
    if (index === -1) throw new Error('Treatment not found');

    const updatedTreatment = {
      ...treatments[index],
      ...updates,
      price: updates.price ? (updates.price.startsWith('$') ? updates.price : `$${updates.price}`) : treatments[index].price,
      color: updates.status ? (updates.status === 'Active' ? 'green' : 'amber') : treatments[index].color,
      updatedAt: new Date().toISOString(),
    };

    treatments[index] = updatedTreatment;
    storageService.set(KEYS.TREATMENTS, treatments);
    return updatedTreatment;
  },

  deleteTreatment(id) {
    const treatments = this.getTreatments();
    const updated = treatments.filter((t) => t.id !== id && t.treatment !== id);
    storageService.set(KEYS.TREATMENTS, updated);
    return updated;
  },

  toggleTreatmentStatus(id) {
    const treatments = this.getTreatments();
    const item = treatments.find((t) => t.id === id || t.treatment === id);
    if (!item) throw new Error('Treatment not found');
    const newStatus = item.status === 'Active' ? 'Inactive' : 'Active';
    return this.updateTreatment(item.id || item.treatment, { status: newStatus });
  },
};

