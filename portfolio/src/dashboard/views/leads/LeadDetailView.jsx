import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { getLeadByIdScoped, updateLeadStatus } from '@/services/leadsService';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';

export const LeadDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();

  const [lead, setLead] = useState(null);
  const [status, setStatus] = useState('');

  const role = currentUser?.role;
  const listUrl = buildRoleUrl('/leads', role);

  useEffect(() => {
    const data = getLeadByIdScoped(id, currentUser, selectedClinicId);
    setLead(data);
    if (data) {
      setStatus(data.status || 'new');
    }
  }, [id, currentUser, selectedClinicId]);

  if (!lead) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(listUrl)}
          className="text-sm font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          ← Back to Leads
        </button>
        <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center">
          <h2 className="text-xl font-bold text-slate-900">Lead Not Found or Access Denied</h2>
          <p className="text-sm text-slate-500 mt-2">
            You do not have permission to view this lead, or the lead ID does not exist.
          </p>
        </div>
      </div>
    );
  }

  const isReceptionist = currentUser?.role === 'receptionist' || lead.isBasicView;

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    updateLeadStatus(lead.id, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(listUrl)}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
        >
          ← Back to Leads List
        </button>

        {isReceptionist && (
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            Receptionist Basic Contact View
          </span>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Lead Record #{lead.id}</span>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">{lead.patientName}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Received on {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'August 3, 2026'}
            </p>
          </div>

          {!isReceptionist && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Pipeline Stage:</span>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-primary cursor-pointer"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          )}
        </div>

        {/* Contact Information Details */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Patient Contact Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Phone Number</p>
              <p className="text-base font-bold text-slate-800 mt-1">{lead.phone || '(555) 123-4567'}</p>
              <a
                href={`tel:${lead.phone || '5551234567'}`}
                className="inline-block mt-2 text-xs font-semibold text-primary hover:underline"
              >
                📞 Call Patient
              </a>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Email Address</p>
              <p className="text-base font-bold text-slate-800 mt-1">{lead.email || 'N/A'}</p>
              {lead.email && lead.email !== 'N/A' && (
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-block mt-2 text-xs font-semibold text-primary hover:underline"
                >
                  ✉️ Send Email
                </a>
              )}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase">Clinic Branch</p>
              <p className="text-base font-bold text-slate-800 mt-1">{lead.clinicId || lead.preferredBranch || 'Downtown Dental'}</p>
            </div>
          </div>
        </div>

        {/* Extended Information for Agents & Admins/Managers only */}
        {!isReceptionist && (
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">CRM Pipeline Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-xs font-semibold text-slate-400 uppercase">Treatment Interest</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{lead.treatment || 'General Dentistry'}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-xs font-semibold text-slate-400 uppercase">Lead Source</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{lead.source || 'Website Contact Form'}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-xs font-semibold text-slate-400 uppercase">Assigned Agent</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {lead.assignedAgentName || lead.assignedAgentId || (currentUser?.role === 'agent' ? currentUser.name : 'Unassigned')}
                </p>
              </div>
            </div>

            {lead.notes && (
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                <p className="text-xs font-semibold text-amber-800 uppercase">Internal Agent Notes</p>
                <p className="text-sm text-amber-900 mt-1">{lead.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetailView;
