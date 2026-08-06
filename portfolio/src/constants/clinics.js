/**
 * CLINICS CONSTANTS
 *
 * Four canonical clinic branches with fixed, predictable IDs.
 * Using fixed string IDs (not UUIDs) so they can be referenced
 * statically in permissions, roleAccess and mock data without
 * needing a runtime lookup against localStorage.
 *
 * Backend-ready: these IDs would be replaced by database PKs when
 * the storage service is swapped for a real API.
 */

export const CLINICS = [
  { id: 'clinic-downtown', name: 'Downtown Dental Excellence', city: 'Riyadh'  },
  { id: 'clinic-central',  name: 'Apex Orthodontics & Smiles', city: 'Jeddah'  },
  { id: 'clinic-west',     name: 'Westside Pediatric & Family', city: 'Riyadh'  },
  { id: 'clinic-east',     name: 'Metro Cosmetic Care',          city: 'Dammam' },
];

export const DEFAULT_CLINIC_ID = 'clinic-downtown';

/**
 * Quick lookup by ID.
 * @param {string} id
 * @returns {{ id: string, name: string, city: string } | undefined}
 */
export const getClinicById = (id) => CLINICS.find((c) => c.id === id);
