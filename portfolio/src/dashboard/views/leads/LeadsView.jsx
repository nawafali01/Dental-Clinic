import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { storageService } from '@/services/storage.service';
import { scopeData } from '@/utils/scopeData';
import { PermissionGuard } from '@/guards/PermissionGuard';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';
import { Badge, StatCard, Table } from '../components/ViewComponents';

export const LeadsView = () => {
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();
  const navigate = useNavigate();

  const rawLeads = storageService.get(storageService.KEYS.LEADS) || [];
  const leads = scopeData({ resource: 'leads', data: rawLeads, currentUser, selectedClinicId });

  const role = currentUser?.role;
  const isReceptionist = role === 'receptionist';
  const isAgent = role === 'agent';

  const total = leads.length;
  const newCount = leads.filter(l => l.status === 'new').length;
  const qualifiedCount = leads.filter(l => l.status === 'qualified').length;
  const convertedCount = leads.filter(l => l.status === 'converted').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isReceptionist
              ? "Basic patient contact list for reception & appointment inquiries"
              : isAgent
              ? "Leads assigned to your workspace pipeline"
              : "Track and manage all organization & clinic leads"}
          </p>
        </div>
        <PermissionGuard resource="leads" action="create">
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
            + New Lead
          </button>
        </PermissionGuard>
      </div>

      {isReceptionist && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-500 text-white rounded-xl font-bold text-xs">RECEPTIONIST</span>
            <p className="text-sm text-blue-900 font-medium">
              Basic Contact Access Mode — Internal notes, lead values, and pipeline stage controls are hidden.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-full">
            Basic Contact Only
          </span>
        </div>
      )}

      {isAgent && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
          <span className="p-2 bg-emerald-600 text-white rounded-xl font-bold text-xs">AGENT</span>
          <p className="text-sm text-emerald-900 font-medium">
            Assigned Leads Mode — Displaying only leads currently assigned to you.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label={isAgent ? "Assigned Leads" : "Total Leads"} value={total} sub="Scoped dataset" />
        <StatCard label="New Today" value={newCount} sub="Needs contact" />
        <StatCard label="Qualified" value={qualifiedCount} sub="In pipeline" />
        <StatCard label="Converted" value={convertedCount} sub="Won" />
      </div>

      {isReceptionist ? (
        <Table
          headers={["Patient Name", "Phone", "Email", "Clinic Branch", "Date Received", "Action"]}
          rows={leads.map(l => [
            <span key="name" className="font-semibold text-slate-900">{l.patientName || l.name || 'Anonymous Patient'}</span>,
            l.phone || l.phoneNumber || '(555) 123-4567',
            l.email || 'N/A',
            l.clinicId || 'Downtown Dental',
            l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '2026-08-03',
            <button
              key="act"
              onClick={() => navigate(buildRoleUrl(`/leads/${l.id}`, role))}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              View Contact
            </button>
          ])}
        />
      ) : (
        <Table
          headers={["Lead Name", "Status", "Source / Treatment", "Assigned Agent", "Clinic", "Action"]}
          rows={leads.map(l => [
            <span key="name" className="font-semibold text-slate-900">{l.patientName || l.name || 'Anonymous Lead'}</span>,
            <Badge key="badge" color={l.status === 'converted' ? 'green' : l.status === 'qualified' ? 'purple' : l.status === 'lost' ? 'red' : 'blue'}>
              {l.status || 'new'}
            </Badge>,
            l.treatment || l.source || 'Website',
            l.assignedAgentName || l.assignedAgentId || (isAgent ? currentUser.name : 'Unassigned'),
            l.clinicId || 'Downtown Dental',
            <button
              key="act"
              onClick={() => navigate(buildRoleUrl(`/leads/${l.id}`, role))}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Manage Lead
            </button>
          ])}
        />
      )}
    </div>
  );
};

export default LeadsView;
