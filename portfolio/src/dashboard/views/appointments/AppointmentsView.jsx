import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { organizationsService, INITIAL_ORGANIZATIONS } from '@/services/organizationsService';
import { storageService } from '@/services/storage.service';

import {
  APPOINTMENT_STATUSES,
  INITIAL_DEMO_APPOINTMENTS,
} from './constants';
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
  const isScopedClinic = isClinicManager || isAgent;
  const managerClinicId = currentUser?.clinicId || (currentUser?.clinicIds && currentUser?.clinicIds[0]) || 'clinic-downtown';
  const assignedClinicObj = getClinicById(managerClinicId);
  const assignedClinicName = assignedClinicObj?.name || 'Downtown Dental Excellence';

  // ── Global Filter State ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'day' | 'week' | 'month'
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
  const pageSize = 8;

  // ── Organizations Retrieval ──────────────────────────────────────
  const organizations = useMemo(() => {
    const orgs = organizationsService.getOrganizationsSync();
    return orgs && orgs.length > 0 ? orgs : INITIAL_ORGANIZATIONS;
  }, []);

  // ── Dynamic Available Clinics ────────────────────────────────────
  const availableClinics = useMemo(() => {
    if (selectedOrgId === 'all') {
      const allClinics = [];
      organizations.forEach((org) => {
        if (Array.isArray(org.clinics)) {
          org.clinics.forEach((c) => {
            allClinics.push({
              ...c,
              orgId: org.id,
              orgName: org.name,
            });
          });
        }
      });
      return allClinics;
    }

    const matchedOrg = organizations.find((o) => o.id === selectedOrgId);
    if (!matchedOrg || !Array.isArray(matchedOrg.clinics)) return [];
    return matchedOrg.clinics.map((c) => ({
      ...c,
      orgId: matchedOrg.id,
      orgName: matchedOrg.name,
    }));
  }, [organizations, selectedOrgId]);


  // Reset clinic if invalid when switching org
  useEffect(() => {
    if (selectedClinicId !== 'all') {
      const exists = availableClinics.some((c) => c.id === selectedClinicId);
      if (!exists) {
        setSelectedClinicId('all');
      }
    }
  }, [selectedOrgId, availableClinics, selectedClinicId]);

  // ── Storage Appointments Initialization & State ──────────────────
  const [rawAppointments, setRawAppointments] = useState(() => {
    const saved = storageService.get(storageService.KEYS.APPOINTMENTS);
    if (saved && Array.isArray(saved) && saved.length > 0 && saved[0].doctorName) {
      // Check if saved has downtown appointments
      const hasDowntown = saved.some((a) => isSameClinic(a.clinicId, 'clinic-downtown'));
      if (hasDowntown && saved.length >= INITIAL_DEMO_APPOINTMENTS.length) {
        return saved;
      }
      // Merge initial demo appointments so newly added demo appointments are present
      const savedIds = new Set(saved.map((a) => a.id));
      const missing = INITIAL_DEMO_APPOINTMENTS.filter((a) => !savedIds.has(a.id));
      const merged = [
        ...saved.map((a) => (isSameClinic(a.clinicId, 'clinic-downtown') ? { ...a, clinicId: 'clinic-downtown' } : a)),
        ...missing,
      ];
      storageService.set(storageService.KEYS.APPOINTMENTS, merged);
      return merged;
    }
    storageService.set(storageService.KEYS.APPOINTMENTS, INITIAL_DEMO_APPOINTMENTS);
    return INITIAL_DEMO_APPOINTMENTS;
  });

  // ── Simulated Loading State ──────────────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedOrgId, selectedClinicId, selectedDoctorId, selectedTreatment, selectedStatus]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedOrgId, selectedClinicId, selectedDoctorId, selectedTreatment, selectedStatus]);

  // ── Filtered Appointments Calculation (AND logic) ────────────────
  const filteredAppointments = useMemo(() => {
    return rawAppointments.filter((appt) => {
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

      // Clinic scoping: Clinic Manager strictly views their assigned clinic, Agent views Downtown assigned/clinic
      if (isScopedClinic) {
        if (!isSameClinic(appt.clinicId, managerClinicId)) {
          return false;
        }
        if (isAgent && appt.assignedAgentId && appt.assignedAgentId !== currentUser?.id) {
          return false;
        }
      } else {
        // Organization filter
        if (selectedOrgId !== 'all' && appt.orgId && appt.orgId !== selectedOrgId) {
          return false;
        }

        // Clinic filter
        if (selectedClinicId !== 'all' && !isSameClinic(appt.clinicId, selectedClinicId)) {
          return false;
        }
      }

      // Doctor filter
      if (selectedDoctorId !== 'all' && appt.doctorId !== selectedDoctorId) {
        return false;
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
    rawAppointments,
    searchQuery,
    isScopedClinic,
    isAgent,
    currentUser?.id,
    managerClinicId,
    selectedOrgId,
    selectedClinicId,
    selectedDoctorId,
    selectedTreatment,
    selectedStatus,
  ]);

  // ── KPI Metrics Calculations ─────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = filteredAppointments.filter((a) => {
    if (!a.date) return false;
    return a.date.startsWith(todayStr);
  }).length || filteredAppointments.length;

  const confirmedCheckedInCount = filteredAppointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'checked-in'
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

  // ── Pagination ───────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  // ── Modal / Drawer Handlers ──────────────────────────────────────
  const handleOpenBooking = useCallback(() => {
    setSelectedAppointment(null);
    setIsNewBooking(true);
    setIsDrawerOpen(true);
  }, []);

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
  const handleQuickCheckIn = useCallback((apptId) => {
    setRawAppointments((prev) => {
      const updated = prev.map((a) => (a.id === apptId ? { ...a, status: 'checked-in' } : a));
      storageService.set(storageService.KEYS.APPOINTMENTS, updated);
      return updated;
    });
    toast.success('Patient checked in successfully.');
  }, []);

  // ── Convert to Patient Handler ───────────────────────────────────
  const handleConvertToPatient = useCallback((apptId) => {
    setRawAppointments((prev) => {
      const updated = prev.map((a) => (a.id === apptId ? { ...a, isConvertedPatient: true } : a));
      storageService.set(storageService.KEYS.APPOINTMENTS, updated);
      return updated;
    });
    setSelectedAppointment((prev) => (prev ? { ...prev, isConvertedPatient: true } : prev));
    toast.success('Lead converted to permanent patient profile.');
  }, []);

  // ── Save / Create Appointment Handler ────────────────────────────
  const handleSaveAppointment = useCallback(
    (appointmentData, isNew) => {
      setRawAppointments((prev) => {
        let updated;
        if (isNew) {
          updated = [appointmentData, ...prev];
        } else {
          updated = prev.map((a) => (a.id === appointmentData.id ? { ...a, ...appointmentData } : a));
        }
        storageService.set(storageService.KEYS.APPOINTMENTS, updated);
        return updated;
      });

      handleCloseDrawer();
      toast.success(isNew ? 'Appointment booked successfully.' : 'Appointment updated successfully.');
    },
    [handleCloseDrawer]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Multi-Tenant Global Controls */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedOrgId={selectedOrgId}
        onSelectOrgId={setSelectedOrgId}
        selectedClinicId={selectedClinicId}
        onSelectClinicId={setSelectedClinicId}
        selectedDoctorId={selectedDoctorId}
        onSelectDoctorId={setSelectedDoctorId}
        selectedTreatment={selectedTreatment}
        onSelectTreatment={setSelectedTreatment}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        organizations={organizations}
        availableClinics={availableClinics}
        onOpenBookingModal={handleOpenBooking}
        isClinicManager={isScopedClinic}
        assignedClinicName={assignedClinicName}
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
          setCurrentPage={setCurrentPage}
          onSelectAppointment={handleSelectAppointment}
          onQuickCheckIn={handleQuickCheckIn}
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
        onSaveAppointment={handleSaveAppointment}
        onConvertToPatient={handleConvertToPatient}
      />
    </div>
  );
};

export default AppointmentsView;
