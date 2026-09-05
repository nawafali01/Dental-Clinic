import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  Sparkles,
  Bot,
  UserCheck,
  Globe,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck,
} from 'lucide-react';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';
import { PIPELINE_STATUSES, AGENTS_LIST, formatCurrency } from '../constants';

export const LeadDetailDrawer = ({
  lead,
  isOpen,
  onClose,
  organizations,
  availableClinics,
  onUpdateLead,
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'appointments' | 'ai'
  const [noteText, setNoteText] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(lead?.assignedAgentId || '');
  const [selectedClinicId, setSelectedClinicId] = useState(lead?.clinicId || '');
  const [selectedStatus, setSelectedStatus] = useState(lead?.status || 'new');

  if (!isOpen || !lead) return null;

  const handleSaveReassignment = () => {
    const matchedAgent = AGENTS_LIST.find((a) => a.id === selectedAgentId);
    const matchedClinic = availableClinics.find((c) => c.id === selectedClinicId);

    const updates = {
      assignedAgentId: selectedAgentId || null,
      assignedAgentName: matchedAgent ? matchedAgent.name.split(' (')[0] : null,
      clinicId: selectedClinicId || lead.clinicId,
      clinicName: matchedClinic ? matchedClinic.name : lead.clinicName,
      status: selectedStatus,
    };

    onUpdateLead(lead.id, updates);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      type: 'note',
      author: 'Super Admin',
      content: noteText.trim(),
      timestamp: 'Just now',
    };

    const existingTimeline = lead.timeline || [];
    onUpdateLead(lead.id, {
      timeline: [newNote, ...existingTimeline],
    });
    setNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* 1. Header */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{lead.patientName}</h2>
                  <Badge variant="purple">{lead.treatment || 'Treatment Inquiry'}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lead ID: <span className="font-mono text-slate-700">{lead.id}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Navigation Tabs */}
            <div className="flex items-center gap-2 mt-5 border-b border-slate-200">
              {[
                { id: 'overview', label: 'Attribution & Info' },
                { id: 'timeline', label: 'Activity Timeline' },
                { id: 'appointments', label: 'Appointments' },
                { id: 'ai', label: 'AI Intelligence' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 -mb-[2px] transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Contact Credentials
                  </h3>
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Phone</span>
                      <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        {lead.phone || '+1-555-0199'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Email</span>
                      <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                        {lead.email || 'patient@example.com'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Clinic Branch</span>
                      <div className="font-semibold text-slate-800 mt-0.5">{lead.clinicName || 'Downtown Branch'}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-semibold">Organization</span>
                      <div className="font-semibold text-slate-800 mt-0.5">{lead.orgName || 'Smile Care Group'}</div>
                    </div>
                  </div>
                </div>

                {/* Marketing UTM & Channel Attribution */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Marketing Attribution & UTM
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">Attribution Channel</span>
                        <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-primary" />
                          {lead.source || 'Google Ads'}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase font-semibold">Campaign Name</span>
                        <div className="font-semibold text-slate-800 mt-0.5">
                          {lead.utmCampaign || 'Q3_Implants_Search_Top'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400">UTM Medium:</span>
                        <div className="font-medium text-slate-700">{lead.utmMedium || 'cpc'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Device:</span>
                        <div className="font-medium text-slate-700">Mobile Safari (iOS)</div>
                      </div>
                      <div>
                        <span className="text-slate-400">City / Region:</span>
                        <div className="font-medium text-slate-700">Lahore / Riyadh</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Super Admin Quick Reassignment Controls */}
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Super Admin Pipeline Override
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Status Override */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Status Stage</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                      >
                        {PIPELINE_STATUSES.filter((s) => s.id !== 'all').map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Agent Assignment */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 mb-1 block">Assigned Agent</label>
                      <select
                        value={selectedAgentId}
                        onChange={(e) => setSelectedAgentId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
                      >
                        <option value="">Unassigned</option>
                        {AGENTS_LIST.map((ag) => (
                          <option key={ag.id} value={ag.id}>
                            {ag.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveReassignment}
                    className="w-full cursor-pointer mt-2"
                  >
                    Save Changes & Reassign
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-4">
                {/* Add Internal Note */}
                <form onSubmit={handleAddNote} className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <label className="text-xs font-bold text-slate-700">Add Internal Management Note</label>
                  <textarea
                    rows={2}
                    placeholder="Enter clinical notes, call summary, or triage instructions..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" icon={Send} className="cursor-pointer">
                      Post Note
                    </Button>
                  </div>
                </form>

                {/* Chronological Activity Feed */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity Stream</h4>
                  <div className="space-y-3">
                    {(lead.timeline || [
                      {
                        id: 't1',
                        type: 'call',
                        author: 'AI Voice Bot #2',
                        content: 'Completed introductory qualification call. Patient confirmed interest in All-on-4 Implants.',
                        timestamp: '2 hours ago',
                      },
                      {
                        id: 't2',
                        type: 'system',
                        author: 'Attribution Engine',
                        content: 'Lead captured via Google Ads Search (Keyword: "implant dentist near me").',
                        timestamp: '4 hours ago',
                      },
                    ]).map((event) => (
                      <div key={event.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="font-bold text-slate-800">{event.author}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{event.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-1">{event.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Consultation & Appointment History
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Initial Implant Evaluation</span>
                    <Badge variant="purple">Confirmed</Badge>
                  </div>
                  <div className="text-slate-600 space-y-1 text-[11px]">
                    <div><strong>Doctor:</strong> Dr. Sarah Lin (Prosthodontist)</div>
                    <div><strong>Scheduled:</strong> Tomorrow, 11:30 AM</div>
                    <div><strong>Clinic:</strong> Downtown Dental Excellence (Suite 4B)</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-300">AI Lead Scoring Engine</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Score: {lead.aiScore || 91}/100
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-2">
                    <p>
                      <strong>Intent Detection:</strong> High probability for high-ticket full-mouth restoration. Patient has engaged across 3 website sessions and reviewed implant pricing.
                    </p>
                    <div className="pt-2 border-t border-slate-800">
                      <strong className="text-indigo-300 block mb-1">Recommended Next Best Action:</strong>
                      <p className="text-slate-200">
                        Assign senior treatment coordinator for immediate personalized video consultation. Offer complimentary 3D CBCT imaging voucher.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Super Admin CRM Context</span>
            <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
              Close Drawer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
