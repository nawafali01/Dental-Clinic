import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { CLINICS, DEFAULT_CLINIC_ID } from '@/constants/clinics';
import { MULTI_CLINIC_ROLES } from '@/dashboard/shared/config/permissions';

/**
 * CLINIC CONTEXT
 *
 * Manages the currently selected clinic branch for the dashboard.
 * Seamlessly synced with OrgContext:
 *  - When an organization is selected, available clinics filter dynamically
 *    to that organization's clinic branches.
 *  - When switching organizations, invalid clinic selections reset cleanly to 'all'.
 *  - Multi-clinic roles (super_admin, org_admin) can switch branches or view 'all'.
 */

const ClinicContext = createContext(null);

const SELECTED_BRANCH_KEY = 'selectedBranch';

export const ClinicProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const orgContext = useOrg();
  const selectedOrgId = orgContext?.selectedOrgId || 'all';
  const currentOrg = orgContext?.currentOrg;

  /** True if the current user's role allows multi-clinic switching. */
  const canSwitch = useMemo(
    () => Boolean(currentUser && MULTI_CLINIC_ROLES.includes(currentUser.role)),
    [currentUser]
  );

  /**
   * The subset of clinics available to this user in current scope.
   * - Single-clinic roles: only their assigned clinic(s).
   * - Multi-clinic roles with org selected: only clinics belonging to that organization.
   * - Multi-clinic roles with global scope ('all'): all canonical clinics.
   */
  const availableClinics = useMemo(() => {
    const primaryClinics = CLINICS.filter((c) => !c.isAlias);

    if (!currentUser) return primaryClinics;

    // Single-clinic roles locked to assigned clinicIds
    if (!canSwitch) {
      if (currentUser.clinicIds && currentUser.clinicIds.length > 0) {
        const filtered = primaryClinics.filter((c) => currentUser.clinicIds.includes(c.id));
        return filtered.length > 0 ? filtered : primaryClinics;
      }
      return primaryClinics;
    }

    // Multi-clinic roles (super_admin, org_admin)
    if (!selectedOrgId || selectedOrgId === 'all') {
      return primaryClinics;
    }

    const orgClinics = primaryClinics.filter((c) => c.orgId === selectedOrgId);
    return orgClinics.length > 0 ? orgClinics : primaryClinics;
  }, [currentUser, canSwitch, selectedOrgId]);

  const getInitialClinicId = () => {
    if (!currentUser) return 'all';
    if (canSwitch) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(SELECTED_BRANCH_KEY) : null;
      return saved || 'all';
    }
    return (currentUser.clinicIds && currentUser.clinicIds[0]) || DEFAULT_CLINIC_ID;
  };

  const [selectedClinicId, setSelectedClinicIdState] = useState(getInitialClinicId);

  // Re-derive the clinic whenever the logged-in user changes (e.g. after login/logout).
  useEffect(() => {
    setSelectedClinicIdState(getInitialClinicId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // When selected organization changes, reset clinic if current selection doesn't belong to it
  useEffect(() => {
    if (selectedClinicId !== 'all') {
      const exists = availableClinics.some((c) => c.id === selectedClinicId);
      if (!exists) {
        setSelectedClinicIdState('all');
        if (typeof window !== 'undefined') {
          localStorage.setItem(SELECTED_BRANCH_KEY, 'all');
        }
      }
    }
  }, [selectedOrgId, availableClinics, selectedClinicId]);

  /**
   * Public setter — only multi-clinic roles can actually change the selection.
   */
  const setSelectedClinicId = (clinicId) => {
    if (!canSwitch) return;
    setSelectedClinicIdState(clinicId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SELECTED_BRANCH_KEY, clinicId);
    }
  };

  const selectedClinic = useMemo(() => {
    if (selectedClinicId === 'all') {
      return {
        id: 'all',
        name: selectedOrgId === 'all' ? 'All Clinics' : `All Clinics (${currentOrg?.shortName || currentOrg?.name || 'Org'})`,
        city: 'All Locations',
        isAll: true,
      };
    }
    return CLINICS.find((c) => c.id === selectedClinicId) || availableClinics[0] || CLINICS[0];
  }, [selectedClinicId, selectedOrgId, currentOrg, availableClinics]);

  return (
    <ClinicContext.Provider
      value={{
        selectedClinicId,
        selectedClinic,
        setSelectedClinicId,
        availableClinics,
        allClinics: CLINICS.filter((c) => !c.isAlias),
        canSwitch,
        selectedOrgId,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(SELECTED_BRANCH_KEY) : null;
    const initialClinicId = saved || 'all';
    const primaryClinics = CLINICS.filter((c) => !c.isAlias);
    const selectedClinic =
      initialClinicId === 'all'
        ? { id: 'all', name: 'All Clinics', city: 'All Locations', isAll: true }
        : CLINICS.find((c) => c.id === initialClinicId) || primaryClinics[0];

    return {
      selectedClinicId: initialClinicId,
      selectedClinic,
      setSelectedClinicId: () => {},
      availableClinics: primaryClinics,
      allClinics: primaryClinics,
      canSwitch: true,
      selectedOrgId: 'all',
    };
  }
  return context;
};
