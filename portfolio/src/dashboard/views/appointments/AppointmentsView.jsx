import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { organizationsService, INITIAL_ORGANIZATIONS } from '@/services/organizationsService';
import { clinicsService } from '@/services/clinicsService';
import { usersService, getAgentDisplayName } from '@/services/usersService';
import { leadsService } from '@/services/leadsService';
import { storageService, isLegacyMockAppointment } from '@/services/storage.service';
import appointmentsService, {
  canUserPerformAction,
  notifyAppointmentError,
} from '@/services/appointmentsService';

import { APPOINTMENT_STATUSES } from './constants';
import { CLINICS, getClinicById, isSameClinic } from '@/constants/clinics';

import {
  Header,
  KpiStrip,
  TableView,
  CalendarView,
  DetailDrawer,
} from './components';

import { useOrg } from '@/dashboard/shared/context/OrgContext';

export const AppointmentsView = () => {
  const { currentUser } = useAuth();
  const { selectedOrgId, setSelectedOrgId } = useOrg();
  const { selectedClinicId, setSelectedClinicId } = useClinic();

  const isClinicManager = currentUser?.role === 'clinic_manager';
  const isAgent = currentUser?.role === 'agent';
  const isReceptionist = currentUser?.role === 'receptionist';
  const isAuditor = currentUser?.role === 'auditor';
  const isReadOnly = isAuditor;
  const isScopedClinic = isClinicManager || isAgent || isReceptionist;
  const userOrgId = currentUser?.organizationId || 'org-001';
  const managerClinicId = currentUser?.clinicId || (currentUser?.clinicIds && currentUser?.clinicIds[0]) || 'clinic-downtown';
  const assignedClinicObj = getClinicById(managerClinicId);
  const assignedClinicName = assignedClinicObj?.name || 'Downtown Dental Excellence';

  // ── Global Filter State ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'day' | 'week' | 'month'
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('all');
  const [selectedClinicFilter, setSelectedClinicFilter] = useState('all');
  const [selectedDoctorId, setSelectedDoctorId] = useState('all');
  const [selectedTreatment, setSelectedTreatment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // ── Loading State (300ms simulated async) ────────────────────────
  const [isLoading, setIsLoading] = useState(true);

  // ── Drawer / Modal State ─────────────────────────────────────────
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isNewBooking, setIsNewBooking] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ── Pagination State ─────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ── Backend Clinics & Organizations Retrieval ───────────────────
  const [backendClinics, setBackendClinics] = useState(() => clinicsService.getClinics() || []);
  const [users, setUsers] = useState(() => usersService.getUsersSync() || []);
  const [leads, setLeads] = useState(() => {
    try {
      if (typeof leadsService?.getLeads === 'function') return leadsService.getLeads() || [];
      const cached = storageService.get(storageService.KEYS.LEADS);
      return Array.isArray(cached) ? cached : [];
    } catch {
      return [];
    }
  });
  const { organizations: orgsFromCtx } = useOrg();
  const organizations = useMemo(() => {
    return orgsFromCtx && orgsFromCtx.length > 0 ? orgsFromCtx : [];
  }, [orgsFromCtx]);

  useEffect(() => {
    if (typeof organizationsService.getOrganizations === 'function') {
      organizationsService.getOrganizations().catch(() => {});
    }
    if (typeof clinicsService?.fetchClinics === 'function') {
      clinicsService.fetchClinics().then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setBackendClinics(res.data);
        }
      }).catch(() => {});
    }
    if (typeof usersService?.fetchUsers === 'function') {
      usersService.fetchUsers().then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setUsers(res.data);
        }
      }).catch(() => {});
    }
    if (typeof leadsService?.fetchLeads === 'function') {
      leadsService.fetchLeads().then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setLeads(res.data);
        }
      }).catch(() => {});
    }
  }, []);

  // ── Dynamic Available Clinics ────────────────────────────────────
  const availableClinics = useMemo(() => {
    const list = [];
    const seen = new Set();

    (backendClinics || []).forEach((c) => {
      if (c?.id && !seen.has(c.id)) {
        if (selectedOrgFilter === 'all' || c.organization_id === selectedOrgFilter || c.orgId === selectedOrgFilter) {
          seen.add(c.id);
          list.push({
            ...c,
            orgId: c.organization_id || c.orgId,
            orgName: c.organization_name || c.orgName || 'Smile Care Group',
          });
        }
      }
    });

    return list;
  }, [selectedOrgFilter, backendClinics]);

  // Reset clinic if invalid when switching org
  useEffect(() => {
    if (selectedClinicFilter !== 'all') {
      const exists = availableClinics.some((c) => c.id === selectedClinicFilter || isSameClinic(c.id, selectedClinicFilter));
      if (!exists) {
        setSelectedClinicFilter('all');
      }
    }
  }, [selectedOrgFilter, availableClinics, selectedClinicFilter]);

  // ── Appointments Live Retrieval & State ─────────────────────────
  const [rawAppointments, setRawAppointments] = useState(() => {
    const cached = storageService.get(storageService.KEYS.APPOINTMENTS);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      return cached.filter((a) => !isLegacyMockAppointment(a));
    }
    return [];
  });

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await appointmentsService.getAppointments({
        clinic_id: selectedClinicFilter !== 'all' ? selectedClinicFilter : undefined,
        organization_id: selectedOrgFilter !== 'all' ? selectedOrgFilter : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      if (res && res.data) {
        setRawAppointments(res.data);
      }
    } catch (err) {
      console.warn('[AppointmentsView] Live fetch notice, using cached data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedClinicFilter, selectedOrgFilter, selectedStatus]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedOrgFilter, selectedClinicFilter, selectedDoctorId, selectedTreatment, selectedStatus]);

  // ── Build Users Map for Provider Display Resolution ─────────────
  const usersMap = useMemo(() => {
    const map = {};
    (users || []).forEach((u) => {
      if (u?.id) map[u.id] = u;
      if (u?._id) map[u._id] = u;
    });
    return map;
  }, [users]);

  // ── Enriched Appointments with Resolved Database Users ───────────
  const enrichedAppointments = useMemo(() => {
    return rawAppointments.map((appt) => {
      const assignedId = appt.assigned_to || appt.assignedTo || appt.doctorId;
      let doctorName = appt.doctorName;
      const isGeneric =
        !doctorName ||
        doctorName === 'Assigned Staff' ||
        doctorName === 'Unassigned' ||
        doctorName === 'Doctor' ||
        doctorName === assignedId;

      if (isGeneric && assignedId) {
        const resolved = getAgentDisplayName(assignedId, usersMap);
        if (resolved && resolved !== 'Assigned Staff') {
          doctorName = resolved;
        } else if (usersMap[assignedId] || usersMap[String(assignedId)]) {
          const u = usersMap[assignedId] || usersMap[String(assignedId)];
          doctorName = u.fullName || u.full_name || u.name || u.email || 'Assigned Staff';
        }
      }
      return {
        ...appt,
        doctorName: doctorName || 'Unassigned',
      };
    });
  }, [rawAppointments, usersMap]);

  // ── Filtered Appointments Calculation (AND logic) ────────────────
  const filteredAppointments = useMemo(() => {
    return enrichedAppointments.filter((appt) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (appt.patientName || '').toLowerCase().includes(q);
        const matchesEmail = (appt.email || '').toLowerCase().includes(q);
        const matchesPhone = (appt.phone || '').toLowerCase().includes(q);
        const matchesDoctor = (appt.doctorName || '').toLowerCase().includes(q);
        const matchesTreatment = (appt.treatment || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesDoctor && !matchesTreatment) {
          return false;
        }
      }

      // Agent scope: Can ONLY view individual appointments assigned directly to them
      if (isAgent) {
        const isAssigned =
          appt.assigned_to === currentUser?.id ||
          appt.assignedTo === currentUser?.id ||
          appt.assignedUserId === currentUser?.id ||
          appt.assignedAgentId === currentUser?.id ||
          (currentUser?._id &&
            (appt.assigned_to === currentUser?._id || appt.assignedTo === currentUser?._id));
        if (!isAssigned) return false;
      }

      // Clinic scoping: Clinic Manager strictly views their assigned clinic
      if (isScopedClinic) {
        if (!isSameClinic(appt.clinicId, managerClinicId) && appt.clinic_id !== managerClinicId) {
          return false;
        }
      } else {
        // Auditor is strictly scoped to their own organization
        if (isAuditor) {
          if (appt.orgId && appt.orgId !== userOrgId) {
            return false;
          }
        } else if (selectedOrgFilter !== 'all') {
          const apptOrg = appt.orgId || appt.organization_id;
          if (apptOrg && apptOrg !== selectedOrgFilter) {
            return false;
          }
        }

        // Clinic filter
        if (selectedClinicFilter !== 'all') {
          if (!isSameClinic(appt.clinicId, selectedClinicFilter) && appt.clinic_id !== selectedClinicFilter) {
            return false;
          }
        }
      }

      // Doctor / Provider filter (matches database user UUID or doctorId)
      if (selectedDoctorId !== 'all') {
        const matchesDoctor =
          appt.doctorId === selectedDoctorId ||
          appt.assigned_to === selectedDoctorId ||
          appt.assignedTo === selectedDoctorId ||
          appt.assignedAgentId === selectedDoctorId ||
          appt.assignedUserId === selectedDoctorId ||
          (appt.doctorName && appt.doctorName.toLowerCase() === selectedDoctorId.toLowerCase());
        if (!matchesDoctor) {
          return false;
        }
      }

      // Treatment filter
      if (selectedTreatment !== 'all' && appt.treatment !== selectedTreatment) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && appt.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [
    enrichedAppointments,
    searchQuery,
    isScopedClinic,
    isAgent,
    currentUser?.id,
    managerClinicId,
    selectedOrgFilter,
    selectedClinicFilter,
    selectedDoctorId,
    selectedTreatment,
    selectedStatus,
  ]);

  // ── KPI Metrics Calculations ─────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = filteredAppointments.filter((a) => {
    if (!a.date) return false;
    return a.date.startsWith(todayStr);
  }).length;

  const confirmedCheckedInCount = filteredAppointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'checked-in' || a.status === 'checked_in'
  ).length;

  const attendedOrCompletedCount = filteredAppointments.filter(
    (a) => a.status === 'attended' || a.status === 'completed'
  ).length;

  const totalEvaluated = filteredAppointments.length;
  const attendanceRateNumber = totalEvaluated > 0 ? (attendedOrCompletedCount / totalEvaluated) * 100 : 0;
  const attendanceRateStr = totalEvaluated > 0 ? `${attendanceRateNumber.toFixed(1)}%` : '0%';

  const noShowRiskCount = filteredAppointments.filter(
    (a) => a.aiRiskLevel === 'high' || (a.aiRiskScore && a.aiRiskScore >= 70)
  ).length;

  const cancelledCount = useMemo(() => {
    return rawAppointments.filter((a) => a.status === 'cancelled' || a.cancellation_reason).length;
  }, [rawAppointments]);

  // ── Pagination ───────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  // ── Modal / Drawer Handlers ──────────────────────────────────────
  const handleOpenBooking = useCallback(() => {
    if (isReadOnly) return;
    if (!canUserPerformAction(currentUser, 'create')) {
      notifyAppointmentError({
        status: 403,
        data: { detail: 'Forbidden: Your role does not have permission to create appointments.' },
      });
      return;
    }
    setSelectedAppointment(null);
    setIsNewBooking(true);
    setIsDrawerOpen(true);
  }, [isReadOnly, currentUser]);

  const handleSelectAppointment = useCallback((appt) => {
    setSelectedAppointment(appt);
    setIsNewBooking(false);
    setIsDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedAppointment(null);
    setIsNewBooking(false);
  }, []);

  // ── Quick Check-In Handler ───────────────────────────────────────
  const handleQuickCheckIn = useCallback(
    async (apptId) => {
      const targetAppt = rawAppointments.find((a) => a.id === apptId || a._id === apptId);
      if (!canUserPerformAction(currentUser, 'checkin', targetAppt)) {
        notifyAppointmentError({
          status: 403,
          data: { detail: 'Forbidden: Your user role is not authorized to check in patients.' },
        });
        return;
      }
      try {
        await appointmentsService.checkinAppointment(apptId);
        setRawAppointments((prev) =>
          prev.map((a) =>
            a.id === apptId || a._id === apptId
              ? { ...a, status: 'checked-in', checked_in_at: new Date().toISOString() }
              : a
          )
        );
        toast.success('Patient checked in successfully.');
      } catch (err) {
        notifyAppointmentError(err, 'Failed to check in appointment.');
      }
    },
    [currentUser, rawAppointments]
  );

  // ── Convert to Patient Handler ───────────────────────────────────
  const handleConvertToPatient = useCallback((apptId) => {
    if (isReadOnly) {
      toast.error('Unauthorized: Auditor role has read-only access');
      return;
    }
    setRawAppointments((prev) => {
      const updated = prev.map((a) => (a.id === apptId || a._id === apptId ? { ...a, isConvertedPatient: true } : a));
      storageService.set(storageService.KEYS.APPOINTMENTS, updated);
      return updated;
    });
    setSelectedAppointment((prev) => (prev ? { ...prev, isConvertedPatient: true } : prev));
    toast.success('Lead converted to permanent patient profile.');
  }, [isReadOnly]);

  // ── Save / Create Appointment Handler ────────────────────────────
  const handleSaveAppointment = useCallback(
    async (appointmentData, isNew) => {
      if (isNew) {
        if (!canUserPerformAction(currentUser, 'create', appointmentData)) {
          notifyAppointmentError({
            status: 403,
            data: { detail: 'Forbidden: You do not have permission to schedule appointments for this clinic.' },
          });
          return;
        }
        try {
          const created = await appointmentsService.createAppointment(appointmentData);
          setRawAppointments((prev) => [created, ...prev]);
          toast.success('Appointment booked successfully.');
          handleCloseDrawer();
        } catch (err) {
          notifyAppointmentError(err, 'Failed to book appointment.');
        }
      } else {
        if (!canUserPerformAction(currentUser, 'edit', appointmentData)) {
          notifyAppointmentError({
            status: 403,
            data: { detail: 'Forbidden: You do not have permission to modify this appointment.' },
          });
          return;
        }
        try {
          const updated = await appointmentsService.updateAppointment(
            appointmentData.id || appointmentData._id,
            appointmentData
          );
          setRawAppointments((prev) =>
            prev.map((a) => (a.id === appointmentData.id || a._id === appointmentData.id ? { ...a, ...updated } : a))
          );
          toast.success('Appointment updated successfully.');
          handleCloseDrawer();
        } catch (err) {
          notifyAppointmentError(err, 'Failed to save appointment.');
        }
      }
    },
    [handleCloseDrawer, currentUser]
  );

  // ── Cancel Appointment Handler (POST /api/v1/appointments/{appointment_id}/cancel) ──
  const handleCancelAppointment = useCallback(
    async (apptId, reason = '') => {
      const targetAppt = rawAppointments.find((a) => a.id === apptId || a._id === apptId);
      if (!canUserPerformAction(currentUser, 'cancel', targetAppt)) {
        notifyAppointmentError({
          status: 403,
          data: { detail: 'Forbidden: You do not have permission to cancel this appointment.' },
        });
        return;
      }
      try {
        await appointmentsService.cancelAppointment(apptId, reason);
        setRawAppointments((prev) =>
          prev.map((a) =>
            a.id === apptId || a._id === apptId
              ? {
                  ...a,
                  status: 'cancelled',
                  cancellation_reason: reason || 'Cancelled by staff',
                  cancelled_at: new Date().toISOString(),
                }
              : a
          )
        );
        handleCloseDrawer();
        toast.success('Appointment cancelled successfully.');
      } catch (err) {
        notifyAppointmentError(err, 'Failed to cancel appointment.');
      }
    },
    [handleCloseDrawer, currentUser, rawAppointments]
  );

  // ── Delete Appointment Handler (DELETE /api/v1/appointments/{appointment_id}) ──
  const handleDeleteAppointment = useCallback(
    async (apptId) => {
      const targetAppt = rawAppointments.find((a) => a.id === apptId || a._id === apptId);
      if (!canUserPerformAction(currentUser, 'delete', targetAppt)) {
        notifyAppointmentError({
          status: 403,
          data: { detail: 'Forbidden: You do not have permission to delete this appointment.' },
        });
        return;
      }
      try {
        await appointmentsService.deleteAppointment(apptId);
        setRawAppointments((prev) => prev.filter((a) => a.id !== apptId && a._id !== apptId));
        handleCloseDrawer();
        toast.success('Appointment deleted successfully.');
      } catch (err) {
        notifyAppointmentError(err, 'Failed to delete appointment.');
      }
    },
    [handleCloseDrawer, currentUser, rawAppointments]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Multi-Tenant Global Controls */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedOrgId={selectedOrgFilter}
        onSelectOrgId={setSelectedOrgFilter}
        selectedClinicId={selectedClinicFilter}
        onSelectClinicId={setSelectedClinicFilter}
        selectedDoctorId={selectedDoctorId}
        onSelectDoctorId={setSelectedDoctorId}
        selectedTreatment={selectedTreatment}
        onSelectTreatment={setSelectedTreatment}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        cancelledCount={cancelledCount}
        organizations={organizations}
        availableClinics={availableClinics}
        users={users}
        onOpenBookingModal={handleOpenBooking}
        isClinicManager={isScopedClinic}
        assignedClinicName={assignedClinicName}
        readOnly={isReadOnly}
        currentUser={currentUser}
      />

      {/* 2. Live Appointment KPI Strip */}
      <KpiStrip
        isLoading={isLoading}
        todayCount={todayCount}
        confirmedCheckedInCount={confirmedCheckedInCount}
        attendanceRateStr={attendanceRateStr}
        attendanceRateNumber={attendanceRateNumber}
        noShowRiskCount={noShowRiskCount}
      />

      {/* 3. Main Content: Table / List View vs Interactive Calendar View */}
      {viewMode === 'list' ? (
        <TableView
          isLoading={isLoading}
          appointments={filteredAppointments}
          paginatedAppointments={paginatedAppointments}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          setCurrentPage={setCurrentPage}
          onSelectAppointment={handleSelectAppointment}
          onQuickCheckIn={handleQuickCheckIn}
          onCancelAppointment={handleCancelAppointment}
          onDeleteAppointment={handleDeleteAppointment}
          readOnly={isReadOnly}
          currentUser={currentUser}
        />
      ) : (
        <CalendarView
          viewMode={viewMode}
          appointments={filteredAppointments}
          onSelectAppointment={handleSelectAppointment}
        />
      )}

      {/* 4. Appointment Detail & Booking Slide-over Drawer */}
      <DetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        appointment={selectedAppointment}
        isNewBooking={isNewBooking}
        organizations={organizations}
        availableClinics={availableClinics}
        users={users}
        leads={leads}
        onSaveAppointment={handleSaveAppointment}
        onCancelAppointment={handleCancelAppointment}
        onDeleteAppointment={handleDeleteAppointment}
        onQuickCheckIn={handleQuickCheckIn}
        onConvertToPatient={handleConvertToPatient}
        readOnly={isReadOnly}
        currentUser={currentUser}
      />
    </div>
  );
};

export default AppointmentsView;
