import React, { useState } from 'react';
import {
  Tag,
  ArrowUpDown,
  Plus,
  Trash2,
  PhoneCall,
  CalendarCheck,
  XCircle,
  Check,
  Edit2,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

import { BADGE_COLOR_OPTIONS } from '@/constants/settingsConstants';
import {
  getColorBadgeClass,
  reorderCatalogItems,
  addLeadStatusItem,
  updateLeadStatusItem,
  deleteLeadStatusItem,
  toggleLeadSourceItem,
  addLeadSourceItem,
  deleteLeadSourceItem,
  addCallOutcomeItem,
  deleteCallOutcomeItem,
  addLostReasonItem,
  deleteLostReasonItem,
} from '@/lib/catalogUtils';

export const TabOperationalCatalogs = ({
  catalogs,
  onCatalogsChange,
}) => {
  const [activeCatalogSection, setActiveCatalogSection] = useState('statuses'); // 'statuses' | 'sources' | 'outcomes' | 'lost'
  
  // State for Add/Edit Status
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [statusName, setStatusName] = useState('');
  const [statusColor, setStatusColor] = useState('blue');

  // State for Add Source
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState('Organic');

  // State for Add Call Outcome
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [newOutcomeName, setNewOutcomeName] = useState('');
  const [newOutcomeType, setNewOutcomeType] = useState('positive');
  const [newOutcomeDesc, setNewOutcomeDesc] = useState('');

  // State for Add Lost Reason
  const [newLostReason, setNewLostReason] = useState('');

  const leadStatuses = catalogs?.leadStatuses || [];
  const leadSources = catalogs?.leadSources || [];
  const callOutcomes = catalogs?.callOutcomes || [];
  const appointmentStatuses = catalogs?.appointmentStatuses || [];
  const lostReasons = catalogs?.lostReasons || [];

  // --- Lead Status Reordering (Order Index) ---
  const handleMoveStatus = (index, direction) => {
    const reordered = reorderCatalogItems(leadStatuses, index, direction);
    if (reordered === leadStatuses) return;
    onCatalogsChange({ leadStatuses: reordered });
    toast.success(`Pipeline stage order updated.`);
  };

  // --- Add/Edit Lead Status ---
  const handleOpenAddStatus = () => {
    setEditingStatus(null);
    setStatusName('');
    setStatusColor('blue');
    setIsStatusModalOpen(true);
  };

  const handleOpenEditStatus = (status) => {
    setEditingStatus(status);
    setStatusName(status.name);
    setStatusColor(status.color || 'blue');
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = (e) => {
    e.preventDefault();
    if (!statusName.trim()) {
      toast.error('Stage name is required.');
      return;
    }

    if (editingStatus) {
      const updated = updateLeadStatusItem(leadStatuses, editingStatus.id, statusName, statusColor);
      onCatalogsChange({ leadStatuses: updated });
      toast.success(`Status "${statusName}" updated.`);
    } else {
      const updated = addLeadStatusItem(leadStatuses, statusName, statusColor);
      onCatalogsChange({ leadStatuses: updated });
      toast.success(`Pipeline stage "${statusName}" created.`);
    }

    setIsStatusModalOpen(false);
  };

  const handleDeleteStatus = (id, name) => {
    if (leadStatuses.length <= 2) {
      toast.error('At least two pipeline stages are required for CRM workflow.');
      return;
    }
    const updated = deleteLeadStatusItem(leadStatuses, id);
    onCatalogsChange({ leadStatuses: updated });
    toast.success(`Stage "${name}" removed.`);
  };

  // --- Lead Sources ---
  const handleToggleSourceActive = (id) => {
    const updated = toggleLeadSourceItem(leadSources, id);
    onCatalogsChange({ leadSources: updated });
  };

  const handleSaveNewSource = (e) => {
    e.preventDefault();
    if (!newSourceName.trim()) {
      toast.error('Source name is required.');
      return;
    }
    const updated = addLeadSourceItem(leadSources, newSourceName, newSourceType);
    onCatalogsChange({ leadSources: updated });
    setNewSourceName('');
    setIsSourceModalOpen(false);
    toast.success(`Lead source "${newSourceName}" added.`);
  };

  const handleDeleteSource = (id, name) => {
    const updated = deleteLeadSourceItem(leadSources, id);
    onCatalogsChange({ leadSources: updated });
    toast.success(`Source "${name}" removed.`);
  };

  // --- Call Outcomes ---
  const handleSaveOutcome = (e) => {
    e.preventDefault();
    if (!newOutcomeName.trim()) {
      toast.error('Outcome label is required.');
      return;
    }
    const updated = addCallOutcomeItem(callOutcomes, newOutcomeName, newOutcomeType, newOutcomeDesc);
    onCatalogsChange({ callOutcomes: updated });
    setNewOutcomeName('');
    setNewOutcomeDesc('');
    setIsOutcomeModalOpen(false);
    toast.success(`Call outcome "${newOutcomeName}" added.`);
  };

  const handleDeleteOutcome = (id, name) => {
    const updated = deleteCallOutcomeItem(callOutcomes, id);
    onCatalogsChange({ callOutcomes: updated });
    toast.success(`Call outcome "${name}" deleted.`);
  };

  // --- Lost Reasons ---
  const handleAddLostReason = (e) => {
    e.preventDefault();
    if (!newLostReason.trim()) return;
    const updated = addLostReasonItem(lostReasons, newLostReason);
    onCatalogsChange({ lostReasons: updated });
    setNewLostReason('');
    toast.success('Disqualified reason added.');
  };

  const handleDeleteLostReason = (id) => {
    const updated = deleteLostReasonItem(lostReasons, id);
    onCatalogsChange({ lostReasons: updated });
    toast.success('Disqualified reason removed.');
  };

  const getColorClass = getColorBadgeClass;

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Pills for Catalogs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl w-fit border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveCatalogSection('statuses')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCatalogSection === 'statuses'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          Lead Pipeline Statuses ({leadStatuses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCatalogSection('sources')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCatalogSection === 'sources'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Lead Acquisition Sources ({leadSources.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCatalogSection('outcomes')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCatalogSection === 'outcomes'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          Call Outcomes & Appointments
        </button>

        <button
          type="button"
          onClick={() => setActiveCatalogSection('lost')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCatalogSection === 'lost'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Lost & Disqualified Reasons ({lostReasons.length})
        </button>
      </div>

      {/* SECTION 1: LEAD STATUSES */}
      {activeCatalogSection === 'statuses' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Lead Pipeline Stages</h3>
              <p className="text-xs text-slate-500">
                Order and configure stages in your clinic's patient conversion funnel.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddStatus}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Pipeline Stage
            </button>
          </div>

          <div className="space-y-2.5">
            {leadStatuses.map((status, index) => (
              <div
                key={status.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all group"
              >
                <div className="flex items-center gap-3">
                  {/* Order Index & Reordering arrows */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveStatus(index, 'up')}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {status.order || index + 1}
                    </span>
                    <button
                      type="button"
                      disabled={index === leadStatuses.length - 1}
                      onClick={() => handleMoveStatus(index, 'down')}
                      className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                      title="Move down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Badge Preview */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getColorClass(
                      status.color
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {status.name}
                  </span>

                  <span className="text-xs text-slate-400">
                    Active Leads: <span className="font-semibold text-slate-700">{status.leads || 0}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEditStatus(status)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit stage"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStatus(status.id, status.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete stage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: LEAD SOURCES */}
      {activeCatalogSection === 'sources' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Lead Acquisition Channels</h3>
              <p className="text-xs text-slate-500">
                Track marketing channels, campaign forms, and patient referral streams.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSourceModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lead Source
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {leadSources.map((src) => (
              <div
                key={src.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-slate-900">{src.name}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      {src.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Volume: <span className="font-semibold text-slate-800">{src.leads || 0}</span> leads • Conv: <span className="font-semibold text-emerald-600">{src.rate || '0%'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleSourceActive(src.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      src.active ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        src.active ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSource(src.id, src.name)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove source"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CALL OUTCOMES & APPOINTMENTS */}
      {activeCatalogSection === 'outcomes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Dispositions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Call Dispositions & Outcomes</h3>
                <p className="text-xs text-slate-500">Available to front-desk and AI voice agents</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOutcomeModalOpen(true)}
                className="p-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {callOutcomes.map((co) => (
                <div
                  key={co.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-800">{co.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{co.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        co.type === 'positive'
                          ? 'bg-emerald-100 text-emerald-700'
                          : co.type === 'negative'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {co.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteOutcome(co.id, co.name)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Statuses */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Appointment Statuses</h3>
              <p className="text-xs text-slate-500">System calendar & chair lifecycle progression</p>
            </div>

            <div className="space-y-2">
              {appointmentStatuses.map((as) => (
                <div
                  key={as.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-xs"
                >
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getColorClass(
                      as.color
                    )}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {as.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">System Controlled</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: LOST & DISQUALIFIED REASONS */}
      {activeCatalogSection === 'lost' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Lost & Disqualified Reasons</h3>
            <p className="text-xs text-slate-500">
              Standardized dropdown options required when closing or disqualifying prospective dental leads.
            </p>
          </div>

          {/* Add Reason Form */}
          <form onSubmit={handleAddLostReason} className="flex gap-2">
            <input
              type="text"
              value={newLostReason}
              onChange={(e) => setNewLostReason(e.target.value)}
              placeholder="e.g. Relocated to another city..."
              className="flex-1 px-3.5 py-2 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Reason
            </button>
          </form>

          <div className="space-y-2">
            {lostReasons.map((lr) => (
              <div
                key={lr.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white transition-all text-xs"
              >
                <span className="font-medium text-slate-800">{lr.reason}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteLostReason(lr.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Pipeline Status */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">
              {editingStatus ? 'Edit Pipeline Stage' : 'Add Pipeline Stage'}
            </h3>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Stage Name</label>
                <input
                  type="text"
                  value={statusName}
                  onChange={(e) => setStatusName(e.target.value)}
                  placeholder="e.g. VIP Consultation"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Status Color Badge</label>
                <div className="grid grid-cols-4 gap-2">
                  {BADGE_COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setStatusColor(col.value)}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                        statusColor === col.value
                          ? 'border-slate-900 bg-slate-900 text-white shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs"
                >
                  {editingStatus ? 'Update Stage' : 'Create Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Lead Source */}
      {isSourceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Add Lead Source</h3>

            <form onSubmit={handleSaveNewSource} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Source Name</label>
                <input
                  type="text"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  placeholder="e.g. TikTok Ads Campaign"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Channel Type</label>
                <select
                  value={newSourceType}
                  onChange={(e) => setNewSourceType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Organic">Organic (SEO / Maps)</option>
                  <option value="Paid">Paid Advertising</option>
                  <option value="Direct">Direct / Phone Call</option>
                  <option value="Referral">Doctor / Patient Referral</option>
                  <option value="Import">CSV Campaign Import</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSourceModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs"
                >
                  Add Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Call Outcome */}
      {isOutcomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Add Call Outcome</h3>

            <form onSubmit={handleSaveOutcome} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Outcome Label</label>
                <input
                  type="text"
                  value={newOutcomeName}
                  onChange={(e) => setNewOutcomeName(e.target.value)}
                  placeholder="e.g. Scheduled Second Opinion"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Sentiment Classification</label>
                <select
                  value={newOutcomeType}
                  onChange={(e) => setNewOutcomeType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="positive">Positive (Lead booked or progressed)</option>
                  <option value="neutral">Neutral (Follow-up or callback needed)</option>
                  <option value="negative">Negative (Unreachable or rejected)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Description</label>
                <input
                  type="text"
                  value={newOutcomeDesc}
                  onChange={(e) => setNewOutcomeDesc(e.target.value)}
                  placeholder="e.g. Patient booked consultation"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOutcomeModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs"
                >
                  Add Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
