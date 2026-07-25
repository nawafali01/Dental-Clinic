import React from 'react';
import { useManager } from '../context/ManagerContext';
import { DailyKpiCards } from '../components/dashboard/DailyKpiCards';
import { CheckInShortcuts } from '../components/dashboard/CheckInShortcuts';
import { AiEscalationAlerts } from '../components/dashboard/AiEscalationAlerts';
import { AppointmentsList } from '../components/dashboard/AppointmentsList';
import { UnassignedLeadsQueue } from '../components/dashboard/UnassignedLeadsQueue';
import { OverdueTaskManager } from '../components/dashboard/OverdueTaskManager';
import { FinancialSummary } from '../components/dashboard/FinancialSummary';
import { TeamAllocation } from '../components/dashboard/TeamAllocation';
import { ClinicLeadWorkspace } from '../components/dashboard/ClinicLeadWorkspace';
import { AgentPerformance } from '../components/dashboard/AgentPerformance';

export default function ManagerDashboardView() {
  const { activeClinic } = useManager();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dashboard View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Clinic Manager Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time insights for <span className="font-semibold text-slate-700 dark:text-slate-300">{activeClinic.name}</span>
          </p>
        </div>
      </div>

      {/* Daily KPI Cards */}
      <DailyKpiCards />

      {/* Primary Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Schedule & Action */}
        <div className="space-y-6">
          <AppointmentsList />
          <CheckInShortcuts />
        </div>

        {/* Column 2: Team & Operations */}
        <div className="space-y-6">
          <TeamAllocation />
          <OverdueTaskManager />
        </div>

        {/* Column 3: Pipeline & Alerts */}
        <div className="space-y-6">
          <AiEscalationAlerts />
          <UnassignedLeadsQueue />
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FinancialSummary />
        </div>
        <div className="lg:col-span-1">
          <ClinicLeadWorkspace />
        </div>
        <div className="lg:col-span-1">
          <AgentPerformance />
        </div>
      </div>
    </div>
  );
}
