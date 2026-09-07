import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  PhoneCall,
  CalendarCheck,
  CheckSquare,
  CreditCard,
  AlertTriangle,
  XCircle,
  Edit2,
  ChevronUp,
  ChevronDown,
  Layers,
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
  addOrderedCatalogItem,
  updateOrderedCatalogItem,
  toggleOrderedCatalogItem,
  deleteOrderedCatalogItem,
} from '@/lib/catalogUtils';

export const TabOperationalCatalogs = ({
  catalogs,
  onCatalogsChange,
}) => {
  const [activeCatalogSection, setActiveCatalogSection] = useState('statuses');
  
  // State for Add/Edit Lead Status
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

  // State for Generic Ordered Status Modal (Appointment, Task, Payment, Priority)
  const [genericModal, setGenericModal] = useState({
    isOpen: false,
    catalogKey: '',
    title: '',
    prefix: '',
    editingItem: null,
    name: '',
    color: 'blue',
  });

  const leadStatuses = catalogs?.leadStatuses || [];
  const leadSources = catalogs?.leadSources || [];
  const callOutcomes = catalogs?.callOutcomes || [];
  const lostReasons = catalogs?.lostReasons || [];
  const appointmentStatuses = catalogs?.appointmentStatuses || [];
  const taskStatuses = catalogs?.taskStatuses || [];
  const paymentStatuses = catalogs?.paymentStatuses || [];
  const priorityLevels = catalogs?.priorityLevels || [];

  const getColorClass = getColorBadgeClass;

  // --- 1. Lead Status Reordering & CRUD ---
  const handleMoveStatus = (index, direction) => {
    const reordered = reorderCatalogItems(leadStatuses, index, direction);
    if (reordered === leadStatuses) return;
    onCatalogsChange({ leadStatuses: reordered });
    toast.success('Pipeline stage order updated.');
  };

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

  // --- 2. Lead Sources CRUD ---
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

  // --- 3. Call Outcomes CRUD ---
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

  // --- 4. Lost Reasons CRUD ---
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

  // --- 5-8. Generic Ordered Catalogs (Appointment, Task, Payment, Priority) ---
  const handleOpenAddGeneric = (catalogKey, title, prefix) => {
    setGenericModal({
      isOpen: true,
      catalogKey,
      title: `Add ${title}`,
      prefix,
      editingItem: null,
      name: '',
      color: 'blue',
    });
  };

  const handleOpenEditGeneric = (catalogKey, title, prefix, item) => {
    setGenericModal({
      isOpen: true,
      catalogKey,
      title: `Edit ${title}`,
      prefix,
      editingItem: item,
      name: item.name,
      color: item.color || 'blue',
    });
  };

  const handleSaveGeneric = (e) => {
    e.preventDefault();
    if (!genericModal.name.trim()) {
      toast.error('Name is required.');
      return;
    }
    const currentList = catalogs?.[genericModal.catalogKey] || [];
    let updated;
    if (genericModal.editingItem) {
      updated = updateOrderedCatalogItem(
        currentList,
        genericModal.editingItem.id,
        genericModal.name,
        genericModal.color
      );
      toast.success(`${genericModal.name} updated.`);
    } else {
      updated = addOrderedCatalogItem(
        currentList,
        genericModal.prefix,
        genericModal.name,
        genericModal.color
      );
      toast.success(`"${genericModal.name}" created.`);
    }
    onCatalogsChange({ [genericModal.catalogKey]: updated });
    setGenericModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleMoveGeneric = (catalogKey, index, direction) => {
    const list = catalogs?.[catalogKey] || [];
    const reordered = reorderCatalogItems(list, index, direction);
    if (reordered === list) return;
    onCatalogsChange({ [catalogKey]: reordered });
    toast.success('Sequence order updated.');
  };

  const handleToggleGenericActive = (catalogKey, id) => {
    const list = catalogs?.[catalogKey] || [];
    const updated = toggleOrderedCatalogItem(list, id);
    onCatalogsChange({ [catalogKey]: updated });
  };

  const handleDeleteGeneric = (catalogKey, id, name) => {
    const list = catalogs?.[catalogKey] || [];
    if (list.length <= 1) {
      toast.error('Catalogue must retain at least one configured item.');
      return;
    }
    const updated = deleteOrderedCatalogItem(list, id);
    onCatalogsChange({ [catalogKey]: updated });
    toast.success(`Item "${name}" removed.`);
  };

  // Reusable renderer for ordered status catalogues
  const renderOrderedSection = ({
    key,
    title,
    description,
    items,
    prefix,
    itemSingular,
  }) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenAddGeneric(key, itemSingular, prefix)}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add {itemSingular}
        </button>
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all group"
          >
            <div className="flex items-center gap-3">
              {/* Order Index & Reordering arrows */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveGeneric(key, index, 'up')}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  {item.order || index + 1}
                </span>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => handleMoveGeneric(key, index, 'down')}
                  className="text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Badge Preview */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${getColorClass(
                  item.color
                )}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {item.name}
              </span>

              {/* Status Indicator */}
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                {item.active !== false ? (
                  <span className="text-emerald-600 font-medium">Active</span>
                ) : (
                  <span className="text-slate-400 font-medium">Inactive</span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Active Toggle Switch */}
              <button
                type="button"
                onClick={() => handleToggleGenericActive(key, item.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  item.active !== false ? 'bg-primary' : 'bg-slate-300'
                }`}
                title={item.active !== false ? 'Active (Click to deactivate)' : 'Inactive (Click to activate)'}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    item.active !== false ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEditGeneric(key, itemSingular, prefix, item)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Edit item"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteGeneric(key, item.id, item.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Delete item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Pills for 8 Catalogs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
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
          Lead Pipeline ({leadStatuses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCatalogSection('appointments')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCatalogSection === 'appointments'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          Appointment Statuses ({appointmentStatuses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCatalogSection('tasks')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCatalogSection === 'tasks'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          Task Statuses ({taskStatuses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCatalogSection('payments')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCatalogSection === 'payments'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Payment Statuses ({paymentStatuses.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCatalogSection('priorities')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeCatalogSection === 'priorities'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Priority Levels ({priorityLevels.length})
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
          Lead Sources ({leadSources.length})
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
          Call Outcomes ({callOutcomes.length})
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
          Lost Reasons ({lostReasons.length})
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

      {/* SECTION 2: APPOINTMENT STATUSES */}
      {activeCatalogSection === 'appointments' &&
        renderOrderedSection({
          key: 'appointmentStatuses',
          title: 'Appointment Lifecycle Statuses',
          description: 'Calendar scheduling, patient check-in, and chair visit progression states.',
          items: appointmentStatuses,
          prefix: 'as',
          itemSingular: 'Appointment Status',
        })}

      {/* SECTION 3: TASK STATUSES */}
      {activeCatalogSection === 'tasks' &&
        renderOrderedSection({
          key: 'taskStatuses',
          title: 'Staff & Task Statuses',
          description: 'Work item and follow-up assignment progression states.',
          items: taskStatuses,
          prefix: 'ts',
          itemSingular: 'Task Status',
        })}

      {/* SECTION 4: PAYMENT STATUSES */}
      {activeCatalogSection === 'payments' &&
        renderOrderedSection({
          key: 'paymentStatuses',
          title: 'Billing & Payment Statuses',
          description: 'Patient invoice, deposit collection, and payment receipt tracking states.',
          items: paymentStatuses,
          prefix: 'ps',
          itemSingular: 'Payment Status',
        })}

      {/* SECTION 5: PRIORITY LEVELS */}
      {activeCatalogSection === 'priorities' &&
        renderOrderedSection({
          key: 'priorityLevels',
          title: 'Urgency & Priority Levels',
          description: 'Triage classification tiers for clinical inquiries and operational tasks.',
          items: priorityLevels,
          prefix: 'pl',
          itemSingular: 'Priority Level',
        })}

      {/* SECTION 6: LEAD SOURCES */}
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
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
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

      {/* SECTION 7: CALL OUTCOMES */}
      {activeCatalogSection === 'outcomes' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Call Dispositions & Outcomes</h3>
              <p className="text-xs text-slate-500">Available to front-desk staff and AI voice agents for patient calls.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOutcomeModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Call Outcome
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {callOutcomes.map((co) => (
              <div
                key={co.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900">{co.name}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{co.description}</p>
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
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete outcome"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 8: LOST & DISQUALIFIED REASONS */}
      {activeCatalogSection === 'lost' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">Lost & Disqualified Reasons</h3>
            <p className="text-xs text-slate-500">
              Standardized options required when closing or disqualifying prospective dental leads.
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

      {/* Modal: Add/Edit Generic Ordered Status (Appointment, Task, Payment, Priority) */}
      {genericModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">
              {genericModal.title}
            </h3>

            <form onSubmit={handleSaveGeneric} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Status Label</label>
                <input
                  type="text"
                  value={genericModal.name}
                  onChange={(e) => setGenericModal((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Under Review"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Color Badge</label>
                <div className="grid grid-cols-4 gap-2">
                  {BADGE_COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setGenericModal((prev) => ({ ...prev, color: col.value }))}
                      className={`px-2 py-1.5 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                        genericModal.color === col.value
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
                  onClick={() => setGenericModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-xs"
                >
                  {genericModal.editingItem ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
