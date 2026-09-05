import { storageService } from './storage.service';
import { treatmentsConfigRows, leadSourcesRows, leadStatusesRows } from '@/data/routesData';

const KEYS = {
  TREATMENTS: storageService.KEYS.TREATMENTS_CONFIG || 'dental_crm_treatments_config',
  SOURCES: storageService.KEYS.LEAD_SOURCES || 'dental_crm_lead_sources',
  STATUSES: storageService.KEYS.LEAD_STATUSES || 'dental_crm_lead_statuses',
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

// ─────────────────────────────────────────────────────────────
// LEAD SOURCES SERVICE
// ─────────────────────────────────────────────────────────────
export const leadSourcesService = {
  getLeadSources() {
    const data = storageService.get(KEYS.SOURCES);
    if (!data || !Array.isArray(data) || data.length === 0) {
      const seeded = leadSourcesRows.map((s, idx) => ({
        id: `s-${idx + 1}`,
        ...s,
      }));
      storageService.set(KEYS.SOURCES, seeded);
      return seeded;
    }
    return data;
  },

  addLeadSource(sourceData) {
    const sources = this.getLeadSources();
    const newSource = {
      id: `s-${Date.now()}`,
      source: sourceData.source.trim(),
      type: sourceData.type || 'Organic',
      leads: sourceData.leads || '0',
      rate: sourceData.rate || '0%',
      status: sourceData.status || 'Active',
      color: sourceData.status === 'Active' ? 'green' : 'amber',
      createdAt: new Date().toISOString(),
    };
    const updated = [newSource, ...sources];
    storageService.set(KEYS.SOURCES, updated);
    return newSource;
  },

  updateLeadSource(id, updates) {
    const sources = this.getLeadSources();
    const index = sources.findIndex((s) => s.id === id || s.source === id);
    if (index === -1) throw new Error('Lead source not found');

    const updatedSource = {
      ...sources[index],
      ...updates,
      color: updates.status ? (updates.status === 'Active' ? 'green' : 'amber') : sources[index].color,
      updatedAt: new Date().toISOString(),
    };

    sources[index] = updatedSource;
    storageService.set(KEYS.SOURCES, sources);
    return updatedSource;
  },

  deleteLeadSource(id) {
    const sources = this.getLeadSources();
    const updated = sources.filter((s) => s.id !== id && s.source !== id);
    storageService.set(KEYS.SOURCES, updated);
    return updated;
  },

  toggleSourceStatus(id) {
    const sources = this.getLeadSources();
    const item = sources.find((s) => s.id === id || s.source === id);
    if (!item) throw new Error('Lead source not found');
    const newStatus = item.status === 'Active' ? 'Paused' : 'Active';
    return this.updateLeadSource(item.id || item.source, { status: newStatus });
  },
};

// ─────────────────────────────────────────────────────────────
// LEAD STATUSES SERVICE
// ─────────────────────────────────────────────────────────────
export const leadStatusesService = {
  getLeadStatuses() {
    const data = storageService.get(KEYS.STATUSES);
    if (!data || !Array.isArray(data) || data.length === 0) {
      const seeded = leadStatusesRows.map((s, idx) => ({
        id: `st-${idx + 1}`,
        ...s,
      }));
      storageService.set(KEYS.STATUSES, seeded);
      return seeded;
    }
    return data;
  },

  addLeadStatus(statusData) {
    const statuses = this.getLeadStatuses();
    const newStatus = {
      id: `st-${Date.now()}`,
      name: statusData.name.trim(),
      color: statusData.color || 'blue',
      order: String(statusData.order || statuses.length + 1),
      leads: '0',
      createdAt: new Date().toISOString(),
    };
    const updated = [...statuses, newStatus];
    storageService.set(KEYS.STATUSES, updated);
    return newStatus;
  },

  updateLeadStatus(id, updates) {
    const statuses = this.getLeadStatuses();
    const index = statuses.findIndex((s) => s.id === id || s.name === id);
    if (index === -1) throw new Error('Lead status not found');

    const updatedStatus = {
      ...statuses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    statuses[index] = updatedStatus;
    storageService.set(KEYS.STATUSES, statuses);
    return updatedStatus;
  },

  deleteLeadStatus(id) {
    const statuses = this.getLeadStatuses();
    const updated = statuses.filter((s) => s.id !== id && s.name !== id);
    storageService.set(KEYS.STATUSES, updated);
    return updated;
  },
};
