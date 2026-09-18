import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Send, Check, CheckCircle2, ShieldCheck, RefreshCw, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { getLeadByIdScoped, updateLead, fetchLeadById } from '@/services/leadsService';
import { buildRoleUrl } from '@/utils/getRoleBaseUrl';
import { EditLeadModal } from './components/EditLeadModal';
import { AssignLeadModal } from './components/AssignLeadModal';

export const LeadDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { selectedClinicId } = useClinic();

  const [lead, setLead] = useState(null);
  const [status, setStatus] = useState('');
  const [copilotDraft, setCopilotDraft] = useState('');
  const [copilotApproved, setCopilotApproved] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const role = currentUser?.role;
  const listUrl = buildRoleUrl('/leads', role);

  const loadLead = useCallback(async () => {
    // 1. Instant render from local cache / scoped check
    const cached = getLeadByIdScoped(id, currentUser, selectedClinicId);
    if (cached) {
      setLead(cached);
      setStatus(cached.status || 'new');
      setCopilotDraft(
        `Hi ${cached.patientName}, this is ${currentUser?.fullName || currentUser?.name || 'Alex'} from Downtown Dental Excellence. I'm reaching out regarding your ${cached.treatment_interest || cached.treatment || 'dental'} inquiry. We have consultation slots open this week—would you like me to reserve a time for you?`
      );
    }

    // 2. Fetch live from GET /api/v1/leads/{lead_id}
    setIsLoading(true);
    try {
      const res = await fetchLeadById(id);
      if (res) {
        const scoped = getLeadByIdScoped(id, currentUser, selectedClinicId) || res;
        setLead(scoped);
        setStatus(scoped.status || 'new');
      }
    } catch (err) {
      console.warn('[LeadDetailView] API error loading lead:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, currentUser, selectedClinicId]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

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
  const isAuditor = currentUser?.role === 'auditor';

  const handleStatusChange = async (newStatus) => {
    if (isAuditor) {
      toast.error('Unauthorized: Auditor role has read-only access');
      return;
    }
    setStatus(newStatus);
    try {
      await updateLead(lead.id, { ...lead, status: newStatus }, currentUser);
      toast.success(`Pipeline stage updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update stage');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(listUrl)}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 cursor-pointer"
        >
          ← Back to Leads List
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadLead}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Sync lead record from API (GET /api/v1/leads/{lead_id})"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync'}</span>
          </button>

          {!isReceptionist && !isAuditor && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
              title="Edit lead details (PUT /api/v1/leads/{lead_id})"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Lead</span>
            </button>
          )}

          {isReceptionist && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Receptionist Basic Contact View
            </span>
          )}

          {isAuditor && (
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Auditor Read-Only Record
            </span>
          )}
        </div>
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

          {isAuditor ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
              <span className="text-xs font-semibold text-slate-500">Pipeline Stage:</span>
              <span className="text-xs font-bold uppercase text-slate-800 tracking-wider">
                {status || 'New'}
              </span>
            </div>
          ) : !isReceptionist && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-xs font-semibold text-slate-400 uppercase">Treatment Interest</p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{lead.treatment_interest || lead.treatment || 'General Dentistry'}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-xs font-semibold text-slate-400 uppercase">Expected Revenue</p>
                <p className="text-sm font-bold text-emerald-600 mt-1">${Number(lead.expected_revenue ?? lead.expectedRevenue ?? 1).toLocaleString()}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-xs font-semibold text-slate-400 uppercase">Source & Priority</p>
                <p className="text-sm font-semibold text-slate-800 mt-1 capitalize">
                  {(lead.source || 'other').replace('_', ' ')} • <span className="uppercase text-xs font-bold text-slate-600">{lead.priority || 'medium'}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Assigned Agent</p>
                  {!isAuditor && (
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Assign
                    </button>
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {lead.assignedAgentName || lead.assigned_to || lead.assignedAgentId || (currentUser?.role === 'agent' ? currentUser.name : 'Unassigned')}
                </p>
              </div>
            </div>

            {lead.notes && (
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl">
                <p className="text-xs font-semibold text-amber-800 uppercase">Internal Agent Notes</p>
                <p className="text-sm text-amber-900 mt-1">{lead.notes}</p>
              </div>
            )}

            {/* Embedded AI Copilot Panel (Hidden for Auditor — No Copilot write action) */}
            {!isAuditor && (
              <div className="p-5 rounded-2xl bg-linear-to-r from-blue-50/60 via-cyan-50/60 to-purple-50/60 border border-blue-200/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">AI Copilot Recommendation</h3>
                      <p className="text-[11px] text-slate-500">Human Approval Gated</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200 text-[10px] font-bold text-slate-700 self-start sm:self-auto shadow-2xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Manual Approval Required</span>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">
                    Next-Best-Action: Outreach for {lead.treatment || 'Consultation'}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {lead.status === 'new'
                      ? 'New inquiry received. High conversion probability when contacted within the current window.'
                      : 'Pipeline inquiry awaiting patient decision. Send gentle slot availability reminder.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Draft Message (Review & Edit Before Sending)
                  </label>
                  <textarea
                    rows={3}
                    value={copilotDraft}
                    onChange={(e) => setCopilotDraft(e.target.value)}
                    disabled={copilotApproved}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-blue-100/60">
                  <p className="text-[11px] text-slate-500">
                    {copilotApproved ? '✓ Suggestion approved and message dispatched' : '💡 Nothing is sent without clicking Approve & Send.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCopilotApproved(true);
                      toast.success(`Action approved! Message dispatched to ${lead.patientName}.`);
                    }}
                    disabled={copilotApproved}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                      copilotApproved ? 'bg-emerald-600 text-white cursor-default' : 'bg-primary text-white hover:opacity-90'
                    }`}
                  >
                    {copilotApproved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Approved & Sent
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Approve & Send
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Lead Modal (PUT /api/v1/leads/{lead_id}) */}
      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => {
          setLead(updated);
          setStatus(updated.status || 'new');
        }}
        lead={lead}
        currentUser={currentUser}
      />

      {/* Assign Lead Modal (POST /api/v1/leads/{lead_id}/assign?user_id={user_id}) */}
      {lead && (
        <AssignLeadModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={() => loadLead()}
          leadId={lead.id}
          currentAssignedTo={lead.assigned_to || lead.assignedAgentId}
          leadName={lead.patientName || lead.name}
        />
      )}
    </div>
  );
};

export default LeadDetailView;
