import React, { useState, useMemo } from 'react';
import { Tag, Plus, Pencil, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { leadStatusesService } from '@/services/configService';
import { Badge, PageHeader, StatCard } from '../components/ViewComponents';
import { AddStatusModal } from './components/AddStatusModal';

export const LeadStatusesView = () => {
  const [statuses, setStatuses] = useState(() => leadStatusesService.getLeadStatuses());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusToEdit, setStatusToEdit] = useState(null);
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshStatuses = () => {
    setStatuses(leadStatusesService.getLeadStatuses());
  };

  const handleSaveStatus = (data, id) => {
    if (statusToEdit) {
      leadStatusesService.updateLeadStatus(id, data);
    } else {
      leadStatusesService.addLeadStatus(data);
    }
    refreshStatuses();
  };

  const handleDeleteStatus = () => {
    if (!statusToDelete) return;
    try {
      leadStatusesService.deleteLeadStatus(statusToDelete.id || statusToDelete.name);
      refreshStatuses();
      toast.success(`Pipeline stage "${statusToDelete.name}" deleted`);
      setStatusToDelete(null);
    } catch (err) {
      toast.error('Failed to delete lead status');
    }
  };

  const filteredStatuses = useMemo(() => {
    return statuses
      .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  }, [statuses, searchQuery]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Pipeline Stages & Statuses"
        description="Define and orchestrate lead lifecycle stages, funnel order, and visual color indicators."
        action="+ Add Pipeline Stage"
        onAction={() => {
          setStatusToEdit(null);
          setIsModalOpen(true);
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pipeline Stages" value={statuses.length} sub="Ordered progression" />
        <StatCard label="Funnel Health" value="100%" sub="Sequential routing active" />
        <StatCard label="Entry Stage" value={statuses[0]?.name || 'New'} sub="Default on lead intake" />
        <StatCard label="Terminal Won" value="Converted" sub="Triggers patient creation" />
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search pipeline stage name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Statuses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Funnel Order</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Stage Name</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Color Badge</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Leads in Stage</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStatuses.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-400">
                  <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="font-semibold text-slate-600">No pipeline stages found</p>
                </td>
              </tr>
            ) : (
              filteredStatuses.map((s) => (
                <tr key={s.id || s.name} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-500">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 inline-flex items-center justify-center text-xs font-mono font-bold">
                      #{s.order}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{s.name}</td>
                  <td className="px-6 py-3.5">
                    <Badge color={s.color}>
                      {s.color ? s.color.charAt(0).toUpperCase() + s.color.slice(1) : 'Blue'}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 font-semibold text-slate-700">{s.leads || '0'}</td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Edit */}
                      <button
                        onClick={() => {
                          setStatusToEdit(s);
                          setIsModalOpen(true);
                        }}
                        title="Edit Stage"
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setStatusToDelete(s)}
                        title="Delete Stage"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AddStatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStatus}
        statusToEdit={statusToEdit}
        currentCount={statuses.length}
      />

      {/* Delete Confirmation */}
      {statusToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Pipeline Stage?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to remove stage <span className="font-semibold text-slate-800">"{statusToDelete.name}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setStatusToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStatus}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadStatusesView;
