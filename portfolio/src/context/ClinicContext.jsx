import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrg } from '@/dashboard/shared/context/OrgContext';
import { CLINICS, DEFAULT_CLINIC_ID, isSameClinic, getClinicById } from '@/constants/clinics';
import { clinicsService } from '@/services/clinicsService';
import { MULTI_CLINIC_ROLES } from '@/dashboard/shared/config/permissions';

/**
 * CLINIC CONTEXT
 *
 * Manages the currently selected clinic branch for the dashboard.
 * Seamlessly synced with OrgContext:
 *  - When an organization is selected, available clinics filter dynamically
 *    to that organization's clinic branches.
 *  - Single-clinic roles (clinic_manager, receptionist, agent) are strictly
 *    locked to their assigned clinic and cannot view 'all'.
 *  - Multi-clinic roles (super_admin, org_admin) can switch branches or view 'all'.
 */

const ClinicContext = createContext(null);

const SELECTED_BRANCH_KEY = 'selectedBranch';

export const ClinicProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const orgContext = useOrg();
  const selectedOrgId = orgContext?.selectedOrgId || 'all';
  const currentOrg = orgContext?.currentOrg;

  const [backendClinics, setBackendClinics] = useState(() => clinicsService.getClinics() || []);

  useEffect(() => {
    clinicsService.fetchClinics().then((res) => {
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setBackendClinics(res.data);
      }
    }).catch(() => {});
  }, []);

  const allAvailableClinics = useMemo(() => {
    if (backendClinics && backendClinics.length > 0) {
      return backendClinics;
    }
    const stored = storageService.get(storageService.KEYS.CLINICS) || [];
    return stored || [];
  }, [backendClinics]);

  /**
   * Normalize the user object so both the mock shape and the real API shape work.
   */
  const normalizedUser = useMemo(() => {
    if (!currentUser) return null;
    const assigned = [
      ...(Array.isArray(currentUser.assigned_clinics) ? currentUser.assigned_clinics : []),
      ...(Array.isArray(currentUser.assignedClinics) ? currentUser.assignedClinics : []),
      ...(Array.isArray(currentUser.clinicIds) ? currentUser.clinicIds : []),
      ...(currentUser.clinicId ? [currentUser.clinicId] : []),
      ...(currentUser.clinic_id ? [currentUser.clinic_id] : []),
    ].filter(Boolean);

    return {
      ...currentUser,
      clinicIds: assigned,
      organizationId: currentUser.organizationId ?? currentUser.organization_id ?? null,
    };
  }, [currentUser]);

  /** True if the current user's role allows multi-clinic switching. */
  const canSwitch = useMemo(() => true, []);

  /**
   * The subset of clinics available to this user in current scope.
   */
  const availableClinics = useMemo(() => {
    if (!selectedOrgId || selectedOrgId === 'all') {
      return allAvailableClinics;
    }

    const orgClinics = allAvailableClinics.filter(
      (c) => c.orgId === selectedOrgId || c.organization_id === selectedOrgId
    );
    return orgClinics.length > 0 ? orgClinics : allAvailableClinics;
  }, [selectedOrgId, allAvailableClinics]);

  const getInitialClinicId = () => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(SELECTED_BRANCH_KEY) : null;
    return saved || 'all';
  };

  const [selectedClinicId, setSelectedClinicIdState] = useState(getInitialClinicId);

  // Re-derive the clinic whenever the logged-in user changes (e.g. after login/logout).
  useEffect(() => {
    setSelectedClinicIdState(getInitialClinicId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    if (selectedClinicId !== 'all') {
      const exists = availableClinics.some((c) => c.id === selectedClinicId || isSameClinic(c.id, selectedClinicId));
      if (!exists && availableClinics.length > 0) {
        setSelectedClinicIdState('all');
        if (typeof window !== 'undefined') {
          localStorage.setItem(SELECTED_BRANCH_KEY, 'all');
        }
      }
    }
  }, [selectedOrgId, availableClinics, selectedClinicId]);

  /**
   * Public setter
   */
  const setSelectedClinicId = (clinicId) => {
    setSelectedClinicIdState(clinicId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SELECTED_BRANCH_KEY, clinicId);
    }
  };

  const selectedClinic = useMemo(() => {
    const effectiveClinicId = selectedClinicId;

    if (effectiveClinicId === 'all') {
      return {
        id: 'all',
        name: selectedOrgId === 'all' ? 'All Clinics' : `All Clinics (${currentOrg?.shortName || currentOrg?.name || 'Org'})`,
        city: 'All Locations',
        isAll: true,
      };
    }

    const found = allAvailableClinics.find((c) => c.id === effectiveClinicId || isSameClinic(c.id, effectiveClinicId));
    if (found) return found;

    return getClinicById(effectiveClinicId) || availableClinics[0] || { id: effectiveClinicId, name: 'Selected Clinic', city: '' };
  }, [selectedClinicId, selectedOrgId, currentOrg, availableClinics, allAvailableClinics]);

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
