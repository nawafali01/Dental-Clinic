/**
 * CLINICS CONSTANTS
 *
 * Canonical clinic branches across all organizations.
 * Using fixed string IDs so they can be referenced statically in permissions,
 * roleAccess and mock data without needing a runtime lookup against localStorage.
 */

export const CLINICS = [
  // ── Smile Care Group (org-001) ────────────────────────────────────
  { id: 'clinic-downtown', orgId: 'org-001', name: 'Downtown Dental Excellence', city: 'Riyadh', status: 'active' },
  { id: 'clinic-001', orgId: 'org-001', name: 'Downtown Dental Excellence', city: 'Riyadh', status: 'active', isAlias: true },
  { id: 'clinic-west', orgId: 'org-001', name: 'Westside Pediatric & Family', city: 'Riyadh', status: 'active' },
  { id: 'clinic-002', orgId: 'org-001', name: 'Westside Pediatric & Family', city: 'Riyadh', status: 'active', isAlias: true },
  { id: 'clinic-003', orgId: 'org-001', name: 'Gulberg Dental Studio', city: 'Lahore', status: 'active' },
  { id: 'clinic-004', orgId: 'org-001', name: 'Clifton Oral Care', city: 'Karachi', status: 'active' },

  // ── Dental Plus (org-002) ─────────────────────────────────────────
  { id: 'clinic-005', orgId: 'org-002', name: 'Marina Branch', city: 'Dubai', status: 'active' },
  { id: 'clinic-006', orgId: 'org-002', name: 'Jumeirah Care', city: 'Dubai', status: 'active' },
  { id: 'clinic-007', orgId: 'org-002', name: 'Downtown Dubai Clinic', city: 'Dubai', status: 'active' },

  // ── Bright Dental (org-003) ───────────────────────────────────────
  { id: 'clinic-008', orgId: 'org-003', name: 'Kensington Clinic', city: 'London', status: 'inactive' },
  { id: 'clinic-009', orgId: 'org-003', name: 'Westminster Dental', city: 'London', status: 'inactive' },

  // ── Apex Dental Group (org-004) ───────────────────────────────────
  { id: 'clinic-central', orgId: 'org-004', name: 'Apex Orthodontics & Smiles', city: 'Jeddah', status: 'active' },
  { id: 'clinic-010', orgId: 'org-004', name: 'Apex Orthodontics & Smiles', city: 'Jeddah', status: 'active', isAlias: true },
  { id: 'clinic-011', orgId: 'org-004', name: 'Brooklyn Orthodontics', city: 'New York', status: 'active' },
  { id: 'clinic-east', orgId: 'org-004', name: 'Metro Cosmetic Care', city: 'Dammam', status: 'active' },
  { id: 'clinic-012', orgId: 'org-004', name: 'Metro Cosmetic Care', city: 'Dammam', status: 'active', isAlias: true },

  // ── Saudi Smiles (org-005) ────────────────────────────────────────
  { id: 'clinic-013', orgId: 'org-005', name: 'Olaya Dental Center', city: 'Riyadh', status: 'active' },
  { id: 'clinic-014', orgId: 'org-005', name: 'Corniche Jeddah Clinic', city: 'Jeddah', status: 'active' },

  // ── Crown & Care Dental (org-006) ─────────────────────────────────
  { id: 'clinic-015', orgId: 'org-006', name: 'Business Bay Branch', city: 'Dubai', status: 'active' },
];

export const DEFAULT_CLINIC_ID = 'clinic-downtown';

/**
 * Quick lookup by ID (handles canonical IDs and aliases).
 * @param {string} id
 * @returns {{ id: string, name: string, city: string, orgId: string, status: string } | undefined}
 */
export const getClinicById = (id) => {
  if (!id) return undefined;
  const staticClinic = CLINICS.find((c) => c.id === id);
  if (staticClinic) return staticClinic;
  if (typeof window !== 'undefined') {
    try {
      const cached = JSON.parse(localStorage.getItem('dental_crm_clinics') || '[]');
      const dyn = cached.find((c) => c.id === id || c._id === id);
      if (dyn) return dyn;
    } catch {}
  }
  return undefined;
};

/**
 * Get all clinics belonging to a specific organization.
 * @param {string} orgId
 * @returns {Array}
 */
export const getClinicsByOrgId = (orgId) => {
  if (!orgId || orgId === 'all') return CLINICS.filter((c) => !c.isAlias);
  return CLINICS.filter((c) => c.orgId === orgId && !c.isAlias);
};

/**
 * Check if two clinic IDs refer to the same clinic (handles aliases).
 * @param {string} idA
 * @param {string} idB
 * @returns {boolean}
 */
export const isSameClinic = (idA, idB) => {
  if (!idA || !idB) return false;
  if (idA === idB) return true;
  const clinicA = CLINICS.find((c) => c.id === idA);
  const clinicB = CLINICS.find((c) => c.id === idB);
  if (clinicA && clinicB && clinicA.name === clinicB.name) return true;
  const canonicalMap = {
    'clinic-001': 'clinic-downtown',
    'clinic-downtown': 'clinic-downtown',
    'clinic-002': 'clinic-west',
    'clinic-west': 'clinic-west',
    'clinic-010': 'clinic-central',
    'clinic-central': 'clinic-central',
    'clinic-012': 'clinic-east',
    'clinic-east': 'clinic-east',
  };
  return Boolean(canonicalMap[idA] && canonicalMap[idA] === canonicalMap[idB]);
};
