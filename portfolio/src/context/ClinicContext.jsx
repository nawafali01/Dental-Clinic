import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CLINICS, DEFAULT_CLINIC_ID } from '@/constants/clinics';
import { MULTI_CLINIC_ROLES } from '@/dashboard/shared/config/permissions';

/**
 * CLINIC CONTEXT
 *
 * Manages the currently selected clinic branch for the dashboard.
 *
 * Rules:
 *  - Roles in MULTI_CLINIC_ROLES (super_admin, org_admin) can freely switch
 *    branches; the selection is persisted in localStorage under 'selectedBranch'.
 *  - All other roles are locked to the first clinic in their clinicIds array.
 *  - No logout is triggered when switching clinics — only the data scope changes.
 *
 * Backend-ready: Replace localStorage reads/writes with an API call when
 * a real backend is available.
 */

const ClinicContext = createContext(null);

const SELECTED_BRANCH_KEY = 'selectedBranch';

export const ClinicProvider = ({ children }) => {
  const { currentUser } = useAuth();

  /** True if the current user's role allows multi-clinic switching. */
  const canSwitch = useMemo(
    () => Boolean(currentUser && MULTI_CLINIC_ROLES.includes(currentUser.role)),
    [currentUser]
  );

  /**
   * The subset of clinics this user may access.
   * - Multi-clinic roles: all clinics.
   * - Single-clinic roles: only their assigned clinic(s).
   * - Auditors (no clinicIds): all clinics in read-only mode.
   */
  const availableClinics = useMemo(() => {
    if (!currentUser) return CLINICS;
    if (canSwitch) return CLINICS;
    if (currentUser.clinicIds && currentUser.clinicIds.length > 0) {
      const filtered = CLINICS.filter((c) => currentUser.clinicIds.includes(c.id));
      return filtered.length > 0 ? filtered : CLINICS;
    }
    // Auditor or unconstrained — see all clinics in read-only
    return CLINICS;
  }, [currentUser, canSwitch]);

  /**
   * Determine the initial clinic:
   *  - Multi-clinic roles: last persisted selection or default.
   *  - Everyone else: their first assigned clinic.
   */
  const getInitialClinicId = () => {
    if (!currentUser) return DEFAULT_CLINIC_ID;
    if (canSwitch) {
      const saved = localStorage.getItem(SELECTED_BRANCH_KEY);
      return saved || DEFAULT_CLINIC_ID;
    }
    return (currentUser.clinicIds && currentUser.clinicIds[0]) || DEFAULT_CLINIC_ID;
  };

  const [selectedClinicId, setSelectedClinicIdState] = useState(getInitialClinicId);

  // Re-derive the clinic whenever the logged-in user changes (e.g. after login/logout).
  useEffect(() => {
    setSelectedClinicIdState(getInitialClinicId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  /**
   * Public setter — only multi-clinic roles can actually change the selection.
   * Silently no-ops for restricted roles so call-sites don't need to check.
   */
  const setSelectedClinicId = (clinicId) => {
    if (!canSwitch) return;
    setSelectedClinicIdState(clinicId);
    localStorage.setItem(SELECTED_BRANCH_KEY, clinicId);
  };

  const selectedClinic =
    CLINICS.find((c) => c.id === selectedClinicId) || CLINICS[0];

  return (
    <ClinicContext.Provider
      value={{
        selectedClinicId,
        selectedClinic,
        setSelectedClinicId,
        availableClinics,
        allClinics: CLINICS,
        canSwitch,
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
    const initialClinicId = saved || DEFAULT_CLINIC_ID;
    const selectedClinic = CLINICS.find((c) => c.id === initialClinicId) || CLINICS[0];
    return {
      selectedClinicId: initialClinicId,
      selectedClinic,
      setSelectedClinicId: () => {},
      availableClinics: CLINICS,
      allClinics: CLINICS,
      canSwitch: true,
    };
  }
  return context;
};
