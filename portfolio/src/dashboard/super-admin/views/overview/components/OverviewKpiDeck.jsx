import React from 'react';
import {
  DollarSign,
  Users,
  CalendarCheck,
  Award,
  Building2,
} from 'lucide-react';
import { KpiCard } from '@/dashboard/shared/components/ui/KpiCard';

export const OverviewKpiDeck = ({ isLoading, derivedMetrics, dateScale }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs animate-pulse space-y-3">
            <div className="h-3 bg-slate-200 rounded w-24" />
            <div className="h-7 bg-slate-200 rounded w-32" />
            <div className="h-4 bg-slate-100 rounded w-20 pt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* KPI 1 — Total Recognized Revenue */}
      <KpiCard
        category="Financial"
        title="Total Recognized Revenue"
        value={derivedMetrics.formattedRevenue}
        change={dateScale.trend}
        isPositive={true}
        period={dateScale.label}
        icon={DollarSign}
        sparkline={[210, 225, 240, 255, 270, 260, 295, 310, 325, 330, 338, 342]}
      />

      {/* KPI 2 — Total Leads Captured */}
      <KpiCard
        category="Pipeline"
        title="Total Leads Captured"
        value={derivedMetrics.totalLeads.toLocaleString()}
        change="+14.2%"
        isPositive={true}
        period="Top of Funnel"
        icon={Users}
        sparkline={[45, 52, 58, 65, 72, 68, 84, 95, 110, 125, 138, 142]}
      />

      {/* KPI 3 — Appointment Attendance Rate */}
      <KpiCard
        category="Operations"
        title="Appointment Attendance Rate"
        value={derivedMetrics.attendanceRateStr}
        change="+2.4%"
        isPositive={true}
        period={`${derivedMetrics.totalAttended} of ${derivedMetrics.totalBookings} booked`}
        icon={CalendarCheck}
        sparkline={[88, 89, 88.5, 90, 89.8, 90.5, 91, 90.8, 91.2, 91, 91.2, 91.2]}
      />

      {/* KPI 4 — Treatment Conversion Rate */}
      <KpiCard
        category="Conversion"
        title="Treatment Conversion Rate"
        value={derivedMetrics.conversionRateStr}
        change="+3.8%"
        isPositive={true}
        period={`${derivedMetrics.totalConversions} closed cases`}
        icon={Award}
        sparkline={[30, 32, 34, 35, 38, 36, 39, 40, 41, 41.5, 42, 42.6]}
      />

      {/* KPI 5 — Active Clinics & Staff */}
      <KpiCard
        category="Network Scale"
        title="Active Clinics & Staff"
        value={`${derivedMetrics.activeClinicsCount} Clinics`}
        change={`+${derivedMetrics.activeStaffCount} Staff`}
        isPositive={true}
        period="Active Accounts"
        icon={Building2}
        sparkline={[3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4]}
      />
    </div>
  );
};
