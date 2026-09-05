import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import { organizationsService, INITIAL_ORGANIZATIONS } from '@/services/organizationsService';
import { storageService } from '@/services/storage.service';
import { rawAiTelemetryData } from '@/dashboard/super-admin/mock-data/aiData';

import {
  formatCurrency,
  safePct,
  safePctNumber,
  getDateScale,
} from './constants';
import { OverviewHeader } from './components/OverviewHeader';
import { OverviewKpiDeck } from './components/OverviewKpiDeck';
import { LeadFunnelCard } from './components/LeadFunnelCard';
import { AiOperationsCard } from './components/AiOperationsCard';
import { RevenueTrendsCard } from './components/RevenueTrendsCard';
import { MultiClinicPerformanceTable } from './components/MultiClinicPerformanceTable';

export default function DashboardOverviewView() {
  // ── Global Filter State ──────────────────────────────────────────
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
  const [selectedOrgId, setSelectedOrgId] = useState('all');
  const [selectedClinicId, setSelectedClinicId] = useState('all');
  const [activeChartTab, setActiveChartTab] = useState('timeline'); // 'timeline' | 'treatment'

  // ── Simulated Loading State ──────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);

  // ── Table Local Pagination ───────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // ── Organizations & Clinics Retrieval ────────────────────────────
  const organizations = useMemo(() => {
    const rawOrgs = organizationsService.getOrganizationsSync();
    if (rawOrgs && Array.isArray(rawOrgs) && rawOrgs.length > 0) {
      return rawOrgs;
    }
    return INITIAL_ORGANIZATIONS;
  }, []);

  // Dynamically derived clinic list based on selected organization
  const availableClinics = useMemo(() => {
    if (selectedOrgId === 'all') {
      const allList = [];
      organizations.forEach((org) => {
        if (Array.isArray(org.clinics)) {
          org.clinics.forEach((c) => {
            allList.push({
              ...c,
              orgId: org.id,
              orgName: org.name,
            });
          });
        }
      });
      return allList;
    }

    const matchedOrg = organizations.find((o) => o.id === selectedOrgId);
    if (!matchedOrg || !Array.isArray(matchedOrg.clinics)) return [];
    return matchedOrg.clinics.map((c) => ({
      ...c,
      orgId: matchedOrg.id,
      orgName: matchedOrg.name,
    }));
  }, [organizations, selectedOrgId]);

  // Reset clinic filter if previously selected clinic no longer belongs to newly selected organization
  useEffect(() => {
    if (selectedClinicId !== 'all') {
      const existsInAvailable = availableClinics.some((c) => c.id === selectedClinicId);
      if (!existsInAvailable) {
        setSelectedClinicId('all');
      }
    }
  }, [selectedOrgId, availableClinics, selectedClinicId]);

  // Reset pagination when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDateRange, selectedOrgId, selectedClinicId]);

  // ── Simulated Loading Effect (250ms) ─────────────────────────────
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedDateRange, selectedOrgId, selectedClinicId]);

  // ── Date Range Multipliers & Temporal Scope ──────────────────────
  const dateScale = useMemo(() => getDateScale(selectedDateRange), [selectedDateRange]);

  // ── Multi-Clinic Aggregated Performance Dataset ──────────────────
  const multiClinicData = useMemo(() => {
    const rawLeads = storageService.get(storageService.KEYS.LEADS) || [];

    // Build rich performance metrics for all clinics
    const allClinicsWithMetrics = [];

    organizations.forEach((org, orgIdx) => {
      const orgClinics = org.clinics || [];
      orgClinics.forEach((clinic, cIdx) => {
        // Base weights for deterministic calculations
        const baseWeight = (orgIdx + 1) * 1.2 + (cIdx + 1) * 0.8;
        const totalLeads = Math.round(
          Math.max(12, ((org.newLeadsCount || 35) + cIdx * 14 + (rawLeads.length > 0 ? rawLeads.length * 2 : 24)) * dateScale.multiplier * (baseWeight / 3))
        );

        const bookings = Math.round(totalLeads * (0.55 + ((cIdx % 3) * 0.05)));
        const attended = Math.round(bookings * (0.88 + ((cIdx % 2) * 0.04)));
        const conversions = Math.max(1, Math.round(attended * (0.42 + ((cIdx % 4) * 0.03))));
        const convRateNumber = safePctNumber(conversions, totalLeads);
        const convRateStr = safePct(conversions, totalLeads);

        const clinicRevenue = Math.round(
          ((org.revenue || 18000) / Math.max(1, orgClinics.length) + (cIdx + 1) * 2400) * dateScale.multiplier
        );

        let status = 'active';
        if (org.status === 'inactive' || clinic.status === 'inactive') {
          status = 'inactive';
        } else if (cIdx === 2 && orgIdx % 2 === 1) {
          status = 'warning';
        }

        allClinicsWithMetrics.push({
          id: clinic.id,
          name: clinic.name,
          orgId: org.id,
          orgName: org.name,
          leads: totalLeads,
          bookings,
          attended,
          conversions,
          convRateNumber,
          convRateStr,
          revenue: clinicRevenue,
          formattedRevenue: formatCurrency(clinicRevenue),
          status,
          city: clinic.city || org.timezone?.split('/')[1]?.replace('_', ' ') || 'Regional Branch',
        });
      });
    });

    // Apply global organization and clinic filters
    return allClinicsWithMetrics.filter((item) => {
      if (selectedOrgId !== 'all' && item.orgId !== selectedOrgId) return false;
      if (selectedClinicId !== 'all' && item.id !== selectedClinicId) return false;
      return true;
    });
  }, [organizations, dateScale, selectedOrgId, selectedClinicId]);

  // ── Derived Dashboard Metrics ────────────────────────────────────
  const derivedMetrics = useMemo(() => {
    const totalLeads = multiClinicData.reduce((acc, c) => acc + c.leads, 0);
    const totalBookings = multiClinicData.reduce((acc, c) => acc + c.bookings, 0);
    const totalAttended = multiClinicData.reduce((acc, c) => acc + c.attended, 0);
    const totalConversions = multiClinicData.reduce((acc, c) => acc + c.conversions, 0);
    const totalRevenue = multiClinicData.reduce((acc, c) => acc + c.revenue, 0);

    const attendanceRateStr = safePct(totalAttended, totalBookings);
    const conversionRateStr = safePct(totalConversions, totalLeads);

    // Active clinics count
    const activeClinicsCount = multiClinicData.filter((c) => c.status === 'active').length;

    // Active staff count calculation derived from organizations scope
    let activeStaffCount = 0;
    if (selectedOrgId === 'all') {
      activeStaffCount = organizations.reduce((acc, org) => acc + (org.users ? org.users.length : 0), 0) + 24;
    } else {
      const currentOrg = organizations.find((o) => o.id === selectedOrgId);
      activeStaffCount = currentOrg && currentOrg.users ? currentOrg.users.length * 4 + 6 : 12;
      if (selectedClinicId !== 'all') {
        activeStaffCount = Math.max(3, Math.round(activeStaffCount / 3));
      }
    }

    // Lead Funnel Stages
    const contactedCount = Math.round(totalLeads * 0.88);
    const funnelStages = [
      {
        stage: 'Captured',
        name: 'Total Leads Captured',
        value: totalLeads,
        formattedValue: totalLeads.toLocaleString(),
        pct: '100%',
        dropOff: 'Top of funnel',
        barColor: 'bg-blue-500',
      },
      {
        stage: 'Contacted',
        name: 'Contacted / Engaged',
        value: contactedCount,
        formattedValue: contactedCount.toLocaleString(),
        pct: safePct(contactedCount, totalLeads),
        dropOff: `${safePct(contactedCount, totalLeads)} of captured`,
        barColor: 'bg-cyan-500',
      },
      {
        stage: 'Booked',
        name: 'Appointments Booked',
        value: totalBookings,
        formattedValue: totalBookings.toLocaleString(),
        pct: safePct(totalBookings, totalLeads),
        dropOff: `${safePct(totalBookings, contactedCount)} of contacted`,
        barColor: 'bg-indigo-500',
      },
      {
        stage: 'Attended',
        name: 'Consultations Attended',
        value: totalAttended,
        formattedValue: totalAttended.toLocaleString(),
        pct: safePct(totalAttended, totalBookings),
        dropOff: `${attendanceRateStr} attendance rate`,
        barColor: 'bg-violet-500',
      },
      {
        stage: 'Converted',
        name: 'Treatment Accepted',
        value: totalConversions,
        formattedValue: totalConversions.toLocaleString(),
        pct: safePct(totalConversions, totalLeads),
        dropOff: `${safePct(totalConversions, totalAttended)} of attended`,
        barColor: 'bg-emerald-500',
      },
      {
        stage: 'Revenue',
        name: 'Recognized Revenue',
        value: totalRevenue,
        formattedValue: formatCurrency(totalRevenue),
        pct: '100%',
        dropOff: `${formatCurrency(totalConversions > 0 ? Math.round(totalRevenue / totalConversions) : 0)} / case`,
        barColor: 'bg-emerald-600',
      },
    ];

    return {
      totalRevenue,
      formattedRevenue: formatCurrency(totalRevenue),
      totalLeads,
      totalBookings,
      totalAttended,
      totalConversions,
      attendanceRateStr,
      conversionRateStr,
      activeClinicsCount,
      activeStaffCount,
      funnelStages,
    };
  }, [multiClinicData, selectedOrgId, selectedClinicId, organizations]);

  // ── AI Operations & System Alerts Data ───────────────────────────
  const aiOperationsMetrics = useMemo(() => {
    const rawLeads = storageService.get(storageService.KEYS.LEADS) || [];
    const rawTasks = storageService.get(storageService.KEYS.TASKS) || [];

    // Filter unassigned leads
    const unassignedLeads = rawLeads.filter((l) => {
      if (l.assignedAgentId !== null && l.assignedAgentId !== undefined && l.assignedAgentId !== '') {
        return false;
      }
      if (selectedClinicId !== 'all' && l.clinicId && l.clinicId !== selectedClinicId) {
        return false;
      }
      return true;
    });

    // Overdue follow-ups count from tasks
    const now = new Date();
    const overdueTasks = rawTasks.filter((t) => {
      if (t.status === 'completed') return false;
      if (selectedClinicId !== 'all' && t.clinicId && t.clinicId !== selectedClinicId) return false;
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < now;
    });

    // AI Telemetry details
    const orgKey = selectedOrgId === 'org-004' ? 'apex' : selectedOrgId === 'org-001' ? 'smilecare' : 'all';
    const telemetry = rawAiTelemetryData[orgKey] || rawAiTelemetryData.all;

    // AI runs scaled by date filter
    const totalAiRuns = Math.round((telemetry.todayCalls * 4.2 + multiClinicData.length * 120) * dateScale.multiplier);
    const agentAcceptanceRate = '96.8%';
    const systemAnomalyFlags = selectedOrgId === 'org-003' ? 2 : 0;

    return {
      unassignedLeadsCount: Math.max(unassignedLeads.length, selectedOrgId === 'all' ? 3 : 1),
      overdueFollowUpsCount: Math.max(overdueTasks.length, selectedOrgId === 'all' ? 2 : 0),
      telemetry,
      totalAiRuns,
      agentAcceptanceRate,
      systemAnomalyFlags,
    };
  }, [selectedOrgId, selectedClinicId, multiClinicData, dateScale]);

  // ── Revenue Trends Chart Data ────────────────────────────────────
  const revenueChartData = useMemo(() => {
    const baseRev = derivedMetrics.totalRevenue || 10000;
    const baseLds = derivedMetrics.totalLeads || 50;

    if (selectedDateRange === 'Today') {
      const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
      return hours.map((hour, idx) => {
        const factor = [0.08, 0.14, 0.22, 0.18, 0.20, 0.12, 0.06][idx];
        return {
          timeLabel: hour,
          revenue: Math.round(baseRev * factor),
          leads: Math.round(baseLds * factor),
          implants: Math.round(baseRev * factor * 0.42),
          aligners: Math.round(baseRev * factor * 0.32),
          restorative: Math.round(baseRev * factor * 0.26),
        };
      });
    }

    if (selectedDateRange === 'Last 7 Days') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayFactors = [0.13, 0.15, 0.16, 0.19, 0.21, 0.10, 0.06];
      return days.map((day, idx) => {
        const factor = dayFactors[idx];
        return {
          timeLabel: day,
          revenue: Math.round(baseRev * factor),
          leads: Math.round(baseLds * factor),
          implants: Math.round(baseRev * factor * 0.44),
          aligners: Math.round(baseRev * factor * 0.31),
          restorative: Math.round(baseRev * factor * 0.25),
        };
      });
    }

    if (selectedDateRange === 'This Month') {
      const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      const weekFactors = [0.22, 0.26, 0.28, 0.24];
      return weeks.map((week, idx) => {
        const factor = weekFactors[idx];
        return {
          timeLabel: week,
          revenue: Math.round(baseRev * factor),
          leads: Math.round(baseLds * factor),
          implants: Math.round(baseRev * factor * 0.45),
          aligners: Math.round(baseRev * factor * 0.30),
          restorative: Math.round(baseRev * factor * 0.25),
        };
      });
    }

    // Default: Last 30 Days (4 weekly intervals)
    const intervals = ['Interval 1 (1-7d)', 'Interval 2 (8-14d)', 'Interval 3 (15-21d)', 'Interval 4 (22-30d)'];
    const intervalFactors = [0.21, 0.24, 0.27, 0.28];
    return intervals.map((interval, idx) => {
      const factor = intervalFactors[idx];
      return {
        timeLabel: interval,
        revenue: Math.round(baseRev * factor),
        leads: Math.round(baseLds * factor),
        implants: Math.round(baseRev * factor * 0.43),
        aligners: Math.round(baseRev * factor * 0.33),
        restorative: Math.round(baseRev * factor * 0.24),
      };
    });
  }, [derivedMetrics, selectedDateRange]);

  // ── Quick CSV Export Handler ─────────────────────────────────────
  const handleQuickExport = useCallback(() => {
    try {
      const dateString = new Date().toISOString().split('T')[0];
      const selectedOrgName =
        selectedOrgId === 'all'
          ? 'All Organizations'
          : organizations.find((o) => o.id === selectedOrgId)?.name || selectedOrgId;
      const selectedClinicName =
        selectedClinicId === 'all'
          ? 'All Clinics'
          : availableClinics.find((c) => c.id === selectedClinicId)?.name || selectedClinicId;

      let csvContent = `SUPER ADMIN EXECUTIVE TELEMETRY REPORT\n`;
      csvContent += `Generated Date,${dateString}\n`;
      csvContent += `Date Range Filter,${selectedDateRange}\n`;
      csvContent += `Organization Filter,${selectedOrgName}\n`;
      csvContent += `Clinic Filter,${selectedClinicName}\n\n`;

      csvContent += `KEY PERFORMANCE INDICATORS\n`;
      csvContent += `Metric,Value,Trend / Period\n`;
      csvContent += `Total Recognized Revenue,"${derivedMetrics.formattedRevenue}","${dateScale.trend} vs previous period"\n`;
      csvContent += `Total Leads Captured,${derivedMetrics.totalLeads},"Top of Funnel"\n`;
      csvContent += `Appointment Attendance Rate,${derivedMetrics.attendanceRateStr},"Attended Bookings"\n`;
      csvContent += `Treatment Conversion Rate,${derivedMetrics.conversionRateStr},"Closed Cases"\n`;
      csvContent += `Active Clinics & Staff,"${derivedMetrics.activeClinicsCount} Clinics / ${derivedMetrics.activeStaffCount} Staff","Active Network"\n\n`;

      csvContent += `LEAD-TO-REVENUE FUNNEL CONVERSION\n`;
      csvContent += `Stage,Stage Name,Count / Value,Conversion %\n`;
      derivedMetrics.funnelStages.forEach((stg) => {
        csvContent += `"${stg.stage}","${stg.name}","${stg.formattedValue}","${stg.pct}"\n`;
      });
      csvContent += `\n`;

      csvContent += `MULTI-CLINIC PERFORMANCE BENCHMARKS\n`;
      csvContent += `Clinic Name,Organization,Leads,Bookings,Attendance Rate,Conversion Rate,Revenue Generated,Status\n`;
      multiClinicData.forEach((row) => {
        csvContent += `"${row.name}","${row.orgName}",${row.leads},${row.bookings},"${safePct(row.attended, row.bookings)}","${row.convRateStr}","${row.formattedRevenue}","${row.status}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `super-admin-dashboard-${dateString}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Export generated');
    } catch (error) {
      console.error('Export generation error:', error);
      toast.error('Failed to generate export file.');
    }
  }, [
    derivedMetrics,
    dateScale,
    multiClinicData,
    selectedDateRange,
    selectedOrgId,
    selectedClinicId,
    organizations,
    availableClinics,
  ]);

  // ── Pagination calculations ──────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(multiClinicData.length / pageSize));
  const paginatedClinics = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return multiClinicData.slice(start, start + pageSize);
  }, [multiClinicData, currentPage, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Page Header & Global Filter Controls */}
      <OverviewHeader
        selectedDateRange={selectedDateRange}
        onSelectDateRange={setSelectedDateRange}
        selectedOrgId={selectedOrgId}
        onSelectOrgId={setSelectedOrgId}
        selectedClinicId={selectedClinicId}
        onSelectClinicId={setSelectedClinicId}
        organizations={organizations}
        availableClinics={availableClinics}
        onExport={handleQuickExport}
      />

      {/* 2. Top KPI Summary (5 Dynamic KPI Cards) */}
      <OverviewKpiDeck
        isLoading={isLoading}
        derivedMetrics={derivedMetrics}
        dateScale={dateScale}
      />

      {/* 3. Lead Funnel & AI Operations Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LeadFunnelCard
          isLoading={isLoading}
          derivedMetrics={derivedMetrics}
          selectedDateRange={selectedDateRange}
        />
        <AiOperationsCard
          isLoading={isLoading}
          aiOperationsMetrics={aiOperationsMetrics}
        />
      </div>

      {/* 4. Revenue Trends (Recharts Area & Treatment Mix) */}
      <RevenueTrendsCard
        isLoading={isLoading}
        revenueChartData={revenueChartData}
        selectedDateRange={selectedDateRange}
        activeChartTab={activeChartTab}
        setActiveChartTab={setActiveChartTab}
      />

      {/* 5. Multi-Clinic Performance Benchmarks Table */}
      <MultiClinicPerformanceTable
        isLoading={isLoading}
        multiClinicData={multiClinicData}
        paginatedClinics={paginatedClinics}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}
