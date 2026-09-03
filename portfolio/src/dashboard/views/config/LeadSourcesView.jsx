import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  Power,
  Search,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { leadSourcesService } from '@/services/configService';
import { Badge, StatCard, PageHeader } from '../components/ViewComponents';
import { AddSourceModal } from './components/AddSourceModal';

export const LeadSourcesView = () => {
  const [sources, setSources] = useState(() => leadSourcesService.getLeadSources());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceToEdit, setSourceToEdit] = useState(null);
  const [sourceToDelete, setSourceToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const refreshSources = () => {
    setSources(leadSourcesService.getLeadSources());
  };

  const handleSaveSource = (data, id) => {
    if (sourceToEdit) {
      leadSourcesService.updateLeadSource(id, data);
    } else {
      leadSourcesService.addLeadSource(data);
    }
    refreshSources();
  };

  const handleToggleStatus = (id, e) => {
    e.stopPropagation();
    try {
      const updated = leadSourcesService.toggleSourceStatus(id);
      refreshSources();
      toast.success(`Source "${updated.source}" is now ${updated.status}!`);
    } catch (err) {
      toast.error('Failed to change source status');
    }
  };

  const handleDeleteSource = () => {
    if (!sourceToDelete) return;
    try {
      leadSourcesService.deleteLeadSource(sourceToDelete.id || sourceToDelete.source);
      refreshSources();
      toast.success(`Source "${sourceToDelete.source}" removed`);
      setSourceToDelete(null);
    } catch (err) {
      toast.error('Failed to delete lead source');
    }
  };

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const matchesSearch =
        s.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.type || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType =
        typeFilter === 'ALL' || s.type?.toUpperCase() === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [sources, searchQuery, typeFilter]);

  const activeCount = sources.filter((s) => s.status === 'Active').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Sources & Attribution"
        description="Configure and audit marketing acquisition channels, UTM tags, and inbound attribution."
        action="+ Add Lead Source"
        onAction={() => {
          setSourceToEdit(null);
          setIsModalOpen(true);
        }}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Channels" value={sources.length} sub="Configured in system" />
        <StatCard label="Active Tracking" value={activeCount} sub="Inbound live webhooks" />
        <StatCard label="Top Performer" value="Google Ads" sub="38% conversion share" />
        <StatCard label="Avg Conv. Rate" value="7.8%" sub="Across all channels" />
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search channel name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { label: 'All Types', value: 'ALL' },
            { label: 'Paid', value: 'PAID' },
            { label: 'Social', value: 'SOCIAL' },
            { label: 'Organic', value: 'ORGANIC' },
            { label: 'Direct', value: 'DIRECT' },
            { label: 'Referral', value: 'REFERRAL' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setTypeFilter(type.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === type.value
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sources Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Source Channel</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Channel Type</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Inbound Leads</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Conversion Rate</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Tracking Status</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSources.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  <Target className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="font-semibold text-slate-600">No lead sources found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Adjust your filters or add a new acquisition channel</p>
                </td>
              </tr>
            ) : (
              filteredSources.map((s) => {
                const isActive = s.status === 'Active';
                return (
                  <tr key={s.id || s.source} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        <span>{s.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-700">
                        {s.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-800 font-semibold">{s.leads || '0'}</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-700">{s.rate || '0%'}</td>
                    <td className="px-6 py-3.5">
                      <Badge color={s.color || (isActive ? 'green' : 'amber')}>
                        {s.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Status */}
                        <button
                          onClick={(e) => handleToggleStatus(s.id || s.source, e)}
                          title={isActive ? 'Pause Channel' : 'Activate Channel'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isActive
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setSourceToEdit(s);
                            setIsModalOpen(true);
                          }}
                          title="Edit Source"
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setSourceToDelete(s)}
                          title="Delete Source"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AddSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSource}
        sourceToEdit={sourceToEdit}
      />

      {/* Delete Confirmation */}
      {sourceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Lead Source?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-slate-800">"{sourceToDelete.source}"</span>? Inbound leads referencing this source will retain their legacy tags.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setSourceToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSource}
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

export default LeadSourcesView;
