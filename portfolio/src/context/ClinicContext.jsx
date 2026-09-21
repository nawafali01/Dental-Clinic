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
    const list = [...backendClinics];
    for (const c of CLINICS) {
      if (!c.isAlias && !list.some((b) => b.id === c.id || (b.name && b.name.toLowerCase() === c.name.toLowerCase()))) {
        list.push(c);
      }
    }
    return list;
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
  const canSwitch = useMemo(
    () => Boolean(normalizedUser && MULTI_CLINIC_ROLES.includes(normalizedUser.role)),
    [normalizedUser],
  );

  /**
   * The subset of clinics available to this user in current scope.
   */
  const availableClinics = useMemo(() => {
    if (!normalizedUser) return allAvailableClinics;

    // Single-clinic roles locked to assigned clinicIds
    if (!canSwitch) {
      if (normalizedUser.clinicIds && normalizedUser.clinicIds.length > 0) {
        const filtered = allAvailableClinics.filter((c) =>
          normalizedUser.clinicIds.some((assignedId) => assignedId === c.id || isSameClinic(assignedId, c.id))
        );
        return filtered.length > 0 ? filtered : allAvailableClinics;
      }
      return allAvailableClinics;
    }

    // Multi-clinic roles (super_admin, org_admin)
    if (!selectedOrgId || selectedOrgId === 'all') {
      return allAvailableClinics;
    }

    const orgClinics = allAvailableClinics.filter(
      (c) => c.orgId === selectedOrgId || c.organization_id === selectedOrgId
    );
    return orgClinics.length > 0 ? orgClinics : allAvailableClinics;
  }, [normalizedUser, canSwitch, selectedOrgId, allAvailableClinics]);

  const getInitialClinicId = () => {
    const user = normalizedUser || (() => {
      try {
        const raw = typeof window !== 'undefined'
          ? (localStorage.getItem('dental_crm_current_user') || localStorage.getItem('auth_current_user'))
          : null;
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    })();

    if (!user) return 'all';
    const isMultiClinic = MULTI_CLINIC_ROLES.includes(user.role);
    if (isMultiClinic) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(SELECTED_BRANCH_KEY) : null;
      return saved || 'all';
    }
    const assignedClinics = [
      ...(Array.isArray(user.assigned_clinics) ? user.assigned_clinics : []),
      ...(Array.isArray(user.assignedClinics) ? user.assignedClinics : []),
      ...(Array.isArray(user.clinicIds) ? user.clinicIds : []),
      ...(user.clinicId ? [user.clinicId] : []),
      ...(user.clinic_id ? [user.clinic_id] : []),
    ].filter(Boolean);

    return assignedClinics[0] || 'f0c74f65-f068-47ad-b82c-27f3413976e2';
  };

  const [selectedClinicId, setSelectedClinicIdState] = useState(getInitialClinicId);

  // Re-derive the clinic whenever the logged-in user changes (e.g. after login/logout).
  useEffect(() => {
    setSelectedClinicIdState(getInitialClinicId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // Lock single-clinic roles to their assigned clinic; for multi-clinic roles validate against available clinics
  useEffect(() => {
    if (!canSwitch) {
      const userClinic = (normalizedUser?.clinicIds && normalizedUser.clinicIds[0]) || 'f0c74f65-f068-47ad-b82c-27f3413976e2';
      setSelectedClinicIdState(userClinic);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SELECTED_BRANCH_KEY, userClinic);
      }
      return;
    }

    if (selectedClinicId !== 'all') {
      const exists = availableClinics.some((c) => c.id === selectedClinicId || isSameClinic(c.id, selectedClinicId));
      if (!exists) {
        setSelectedClinicIdState('all');
        if (typeof window !== 'undefined') {
          localStorage.setItem(SELECTED_BRANCH_KEY, 'all');
        }
      }
    }
  }, [selectedOrgId, availableClinics, selectedClinicId, canSwitch, normalizedUser]);

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
    let effectiveClinicId = selectedClinicId;
    if (!canSwitch) {
      const assigned =
        (normalizedUser?.clinicIds && normalizedUser.clinicIds[0]) ||
        currentUser?.clinicId ||
        (Array.isArray(currentUser?.assigned_clinics) ? currentUser.assigned_clinics[0] : null);
      if (assigned) {
        effectiveClinicId = assigned;
      }
    }

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

    if (effectiveClinicId === 'f0c74f65-f068-47ad-b82c-27f3413976e2') {
      return { id: effectiveClinicId, name: 'doctor_hospital', city: '' };
    }

    return getClinicById(effectiveClinicId) || availableClinics[0] || { id: effectiveClinicId, name: effectiveClinicId, city: '' };
  }, [selectedClinicId, canSwitch, normalizedUser, currentUser, selectedOrgId, currentOrg, availableClinics, allAvailableClinics]);

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
