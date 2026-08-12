import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { Badge, StatCard, DevBanner, PageHeader, Table } from '../components/ViewComponents';

export const CallsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const rawCalls = storageService.get(storageService.KEYS.CALLS) || [];
  const calls = scopeData({ resource: 'calls', data: rawCalls, currentUser, selectedClinicId });

  const total = calls.length;
  const booked = calls.filter(c => c.outcome === 'booked').length;
  const missed = calls.filter(c => c.outcome === 'missed' || c.outcome === 'no-answer').length;
  const contacted = calls.filter(c => c.outcome === 'contacted').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Calls" description="Track all inbound and outbound calls" action="+ Log Call" />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Calls" value={total} sub="Scoped dataset" />
        <StatCard label="Booked" value={booked} sub="Successful bookings" />
        <StatCard label="Contacted" value={contacted} sub="In conversation" />
        <StatCard label="Missed / Unanswered" value={missed} sub="Follow-up needed" />
      </div>
      <Table
        headers={["Caller / Lead", "Duration", "Outcome", "Date & Time"]}
        rows={calls.map(c => [
          c.leadName || 'Caller',
          c.duration ? `${Math.floor(c.duration / 60)}m ${c.duration % 60}s` : '0m 0s',
          <Badge key="badge" color={c.outcome === 'booked' ? 'green' : c.outcome === 'missed' ? 'red' : 'amber'}>{c.outcome}</Badge>,
          c.date ? new Date(c.date).toLocaleString() : 'Aug 3 — 09:15 AM'
        ])}
      />
      <DevBanner text="Full Call Tracking module is under development" />
    </div>
  );
};

export default CallsView;
