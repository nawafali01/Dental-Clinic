import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  User,
  ChevronRight,
  RefreshCw,
  ThumbsUp,
  XCircle,
  Building2,
  Calendar,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getAssignedLeads } from '@/services/leadsService';
import { storageService } from '@/services/storage.service';
import { PageHeader } from '../components/ViewComponents';

export const AiCopilotView = () => {
  const { currentUser } = useAuth();
  const agentId = currentUser?.id || 'user-003';
  const agentName = currentUser?.fullName || currentUser?.name || 'Agent Alex';

  // Fetch assigned leads for this agent
  const rawLeads = useMemo(() => {
    try {
      const assigned = getAssignedLeads(agentId);
      if (assigned && assigned.length > 0) return assigned;
    } catch {
      // fallback to storage
    }
    const all = storageService.get(storageService.KEYS.LEADS) || [];
    return all.filter((l) => !l.assignedAgentId || l.assignedAgentId === agentId || l.assignedAgentId === 'user-003');
  }, [agentId]);

  // Demo AI Recommendations generator for assigned leads
  const recommendations = useMemo(() => {
    const leadsList = rawLeads.length > 0 ? rawLeads : [
      {
        id: 'lead-001',
        patientName: 'Sarah Mitchell',
        phone: '+1-555-0142',
        email: 'sarah.m@example.com',
        treatment: 'Teeth Whitening',
        status: 'new',
        priority: 'high',
        createdAt: '2026-09-04T10:00:00Z',
      },
      {
        id: 'lead-002',
        patientName: 'James Thornton',
        phone: '+1-555-0188',
        email: 'james.t@example.com',
        treatment: 'Dental Implant',
        status: 'contacted',
        priority: 'urgent',
        createdAt: '2026-09-02T14:30:00Z',
      },
      {
        id: 'lead-003',
        patientName: 'Priya Kapoor',
        phone: '+971-50-8877665',
        email: 'priya.k@example.com',
        treatment: 'Invisalign',
        status: 'proposal',
        priority: 'medium',
        createdAt: '2026-09-05T09:15:00Z',
      },
    ];

    return leadsList.map((lead, idx) => {
      let actionType = 'Call';
      let rationale = 'Lead has not been contacted in 3 days. High intent detected.';
      let urgency = 'High Priority';
      let channel = 'WhatsApp';

      if (lead.treatment?.toLowerCase().includes('implant')) {
        actionType = 'WhatsApp Follow-up';
        rationale = 'Patient viewed implant pricing guide twice yesterday. Send consultation invite.';
        urgency = 'Urgent Action';
        channel = 'WhatsApp';
      } else if (lead.status === 'proposal' || lead.treatment?.toLowerCase().includes('invisalign')) {
        actionType = 'SMS Check-in';
        rationale = 'Consultation proposal pending patient response. Send polite slot availability reminder.';
        urgency = 'Medium Priority';
        channel = 'SMS';
      } else {
        actionType = 'Outbound Discovery Call';
        rationale = 'New inbound inquiry for teeth whitening. First-time contact recommendation.';
        urgency = 'High Priority';
        channel = 'Call';
      }

      return {
        leadId: lead.id,
        leadName: lead.patientName,
        phone: lead.phone,
        email: lead.email,
        treatment: lead.treatment || 'General Consultation',
        status: lead.status || 'new',
        branch: 'Downtown Dental Excellence',
        actionType,
        rationale,
        urgency,
        recommendedChannel: channel,
        initialDraft: `Hi ${lead.patientName}, this is ${agentName} from Downtown Dental Excellence! I noticed you were exploring options for ${lead.treatment || 'dental care'}. We currently have a limited consultation slot available this week with Dr. Catherine Reyes. Would tomorrow afternoon work for a quick 15-minute chat?`,
      };
    });
  }, [rawLeads, agentName]);

  const [selectedLeadId, setSelectedLeadId] = useState(recommendations[0]?.leadId || '');
  const [activeChannel, setActiveChannel] = useState('WhatsApp');
  const [draftMessage, setDraftMessage] = useState('');
  const [approvalStatus, setApprovalStatus] = useState({}); // { [leadId]: 'approved' | 'dismissed' }

  // Sync draft message when selecting a lead
  const currentRecommendation = useMemo(() => {
    return recommendations.find((r) => r.leadId === selectedLeadId) || recommendations[0];
  }, [recommendations, selectedLeadId]);

  // Keep draft updated if selecting new lead
  React.useEffect(() => {
    if (currentRecommendation) {
      setDraftMessage(currentRecommendation.initialDraft);
      setActiveChannel(currentRecommendation.recommendedChannel || 'WhatsApp');
    }
  }, [currentRecommendation]);

  // Approval Gate Action: Requires explicit agent click
  const handleApproveAndSend = () => {
    if (!currentRecommendation) return;
    setApprovalStatus((prev) => ({ ...prev, [currentRecommendation.leadId]: 'approved' }));
    toast.success(`Action approved! Message dispatched to ${currentRecommendation.leadName} via ${activeChannel}.`);
  };

  // Dismiss action
  const handleDismiss = () => {
    if (!currentRecommendation) return;
    setApprovalStatus((prev) => ({ ...prev, [currentRecommendation.leadId]: 'dismissed' }));
    toast.info(`Suggestion dismissed for ${currentRecommendation.leadName}.`);
  };

  const handleTemplateSelect = (type) => {
    if (!currentRecommendation) return;
    if (type === 'offer') {
      setDraftMessage(
        `Hi ${currentRecommendation.leadName}, ${agentName} here from Downtown Dental Excellence. We are currently offering a complimentary 3D scan for new ${currentRecommendation.treatment} inquiries. Would you like me to hold a morning slot for you this Thursday?`
      );
    } else if (type === 'gentle') {
      setDraftMessage(
        `Hello ${currentRecommendation.leadName}, checking in from Downtown Dental Excellence regarding your ${currentRecommendation.treatment} request. Feel free to reply here if you have any questions or would like to schedule a visit!`
      );
    } else {
      setDraftMessage(currentRecommendation.initialDraft);
    }
  };

  const isCurrentApproved = approvalStatus[currentRecommendation?.leadId] === 'approved';
  const isCurrentDismissed = approvalStatus[currentRecommendation?.leadId] === 'dismissed';

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <PageHeader
        title="Agent AI Copilot"
        description="Operational assistant for sales & call agents with mandatory human-approval verification"
      />

      {/* ── Governance & Oversight Banner ── */}
      <div className="bg-linear-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Human-in-the-Loop Mode Active</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                100% Gated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              All AI next-best-actions and message drafts require your explicit review and manual approval before dispatching.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs self-start sm:self-auto shrink-0">
          <Building2 className="w-3.5 h-3.5 text-primary" />
          <span>Downtown Dental Excellence</span>
        </div>
      </div>

      {/* ── Main Copilot Workspace ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column: Assigned Leads Queue (4 cols) ── */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Leads Needing Action ({recommendations.length})
            </h2>
            <span className="text-xs text-primary font-medium">Auto-ranked by intent</span>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec) => {
              const isSelected = rec.leadId === selectedLeadId;
              const isApproved = approvalStatus[rec.leadId] === 'approved';
              const isDismissed = approvalStatus[rec.leadId] === 'dismissed';

              return (
                <div
                  key={rec.leadId}
                  onClick={() => setSelectedLeadId(rec.leadId)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-primary ring-2 ring-primary/10 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{rec.leadName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{rec.treatment}</p>
                    </div>

                    {isApproved ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Dispatched
                      </span>
                    ) : isDismissed ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Dismissed
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {rec.urgency}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{rec.actionType}: {rec.rationale}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: Copilot Action & Human-Approval Center (7 cols) ── */}
        <div className="lg:col-span-7 space-y-4">
          {currentRecommendation ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{currentRecommendation.leadName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {currentRecommendation.treatment}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentRecommendation.phone} • {currentRecommendation.email} • {currentRecommendation.branch}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize bg-slate-100 text-slate-800">
                    {currentRecommendation.status}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* 1. Next-Best-Action Box */}
                <div className="p-4 rounded-xl bg-linear-to-r from-blue-50/60 to-cyan-50/60 border border-blue-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Next-Best-Action Recommendation</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {currentRecommendation.actionType}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {currentRecommendation.rationale}
                  </p>
                </div>

                {/* 2. Interactive Message Composer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Draft Message (Review & Edit Before Sending)
                    </label>

                    {/* Channel Selector */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                      {['WhatsApp', 'SMS', 'Email'].map((ch) => (
                        <button
                          key={ch}
                          onClick={() => setActiveChannel(ch)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                            activeChannel === ch
                              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Template Quick Switchers */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="text-slate-400 self-center text-[11px]">Templates:</span>
                    <button
                      onClick={() => handleTemplateSelect('default')}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors"
                    >
                      Consultation Prompt
                    </button>
                    <button
                      onClick={() => handleTemplateSelect('offer')}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors"
                    >
                      Scan Promotion
                    </button>
                    <button
                      onClick={() => handleTemplateSelect('gentle')}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors"
                    >
                      Gentle Check-in
                    </button>
                  </div>

                  {/* Editable Draft Textarea */}
                  <textarea
                    rows={4}
                    value={draftMessage}
                    onChange={(e) => setDraftMessage(e.target.value)}
                    disabled={isCurrentApproved}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60"
                    placeholder="Type or customize your message draft..."
                  />
                  <p className="text-[11px] text-slate-400">
                    💡 You can freely edit this message text before clicking Approve. Nothing is sent automatically.
                  </p>
                </div>

                {/* 3. Explicit Human Approval Action Bar */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Action Status:</span>
                    {isCurrentApproved ? (
                      <span className="font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved & Dispatched
                      </span>
                    ) : isCurrentDismissed ? (
                      <span className="font-semibold text-slate-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Dismissed
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Awaiting Your Approval
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      onClick={handleDismiss}
                      disabled={isCurrentApproved || isCurrentDismissed}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      Dismiss
                    </button>

                    <button
                      onClick={handleApproveAndSend}
                      disabled={isCurrentApproved}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        isCurrentApproved
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-primary text-white hover:opacity-95'
                      }`}
                    >
                      {isCurrentApproved ? (
                        <>
                          <Check className="w-4 h-4" />
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
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 mt-2">No Lead Selected</h3>
              <p className="text-xs text-slate-400 mt-1">Select an assigned lead from the list to view recommendations.</p>
            </div>
          )}

          {/* 4. Lead History & Context Summary Card */}
          {currentRecommendation && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Lead Interaction Summary & Context</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-slate-400 text-[11px] font-medium">Inquiry Branch</p>
                  <p className="font-bold text-slate-800 mt-0.5">{currentRecommendation.branch}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-slate-400 text-[11px] font-medium">Preferred Treatment</p>
                  <p className="font-bold text-slate-800 mt-0.5">{currentRecommendation.treatment}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-slate-400 text-[11px] font-medium">Assigned Sales Agent</p>
                  <p className="font-bold text-slate-800 mt-0.5">{agentName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiCopilotView;
