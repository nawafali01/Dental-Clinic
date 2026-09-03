import React, { useState, useMemo } from 'react';
import {
  Activity,
  Plus,
  Pencil,
  Trash2,
  Power,
  Search,
  CheckCircle2,
  Clock,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import { treatmentsService } from '@/services/configService';
import { Badge, PageHeader, StatCard } from '../components/ViewComponents';
import { AddTreatmentModal } from './components/AddTreatmentModal';

export const TreatmentsConfigView = () => {
  const [treatments, setTreatments] = useState(() => treatmentsService.getTreatments());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treatmentToEdit, setTreatmentToEdit] = useState(null);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const refreshTreatments = () => {
    setTreatments(treatmentsService.getTreatments());
  };

  const handleSaveTreatment = (data, id) => {
    if (treatmentToEdit) {
      treatmentsService.updateTreatment(id, data);
    } else {
      treatmentsService.addTreatment(data);
    }
    refreshTreatments();
  };

  const handleToggleStatus = (id, e) => {
    e.stopPropagation();
    try {
      const updated = treatmentsService.toggleTreatmentStatus(id);
      refreshTreatments();
      toast.success(`Treatment "${updated.treatment}" is now ${updated.status}!`);
    } catch (err) {
      toast.error('Failed to change treatment status');
    }
  };

  const handleDeleteTreatment = () => {
    if (!treatmentToDelete) return;
    try {
      treatmentsService.deleteTreatment(treatmentToDelete.id || treatmentToDelete.treatment);
      refreshTreatments();
      toast.success(`Treatment "${treatmentToDelete.treatment}" deleted`);
      setTreatmentToDelete(null);
    } catch (err) {
      toast.error('Failed to delete treatment');
    }
  };

  // Filtered
  const filteredTreatments = useMemo(() => {
    return treatments.filter((t) => {
      const matchesSearch =
        t.treatment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === 'ALL' || t.category?.toUpperCase() === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [treatments, searchQuery, categoryFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treatments Catalog"
        description="Configure standard dental procedures, durations, base prices, and online bookability."
        action="+ Add Treatment"
        onAction={() => {
          setTreatmentToEdit(null);
          setIsModalOpen(true);
        }}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Procedures" value={treatments.length} sub="Registered in catalog" />
        <StatCard
          label="Active Bookable"
          value={treatments.filter((t) => t.status === 'Active').length}
          sub="Live for patient intake"
        />
        <StatCard label="Categories" value="6" sub="Specialty groups" />
        <StatCard label="Catalog Integrity" value="100%" sub="Synced with appointments" />
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search procedure name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Preventive', value: 'PREVENTIVE' },
            { label: 'Restorative', value: 'RESTORATIVE' },
            { label: 'Cosmetic', value: 'COSMETIC' },
            { label: 'Orthodontic', value: 'ORTHODONTIC' },
            { label: 'Surgical', value: 'SURGICAL' },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat.value
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Treatments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Procedure Name</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Category</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Chair Duration</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Base Price</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px]">Status</th>
              <th className="px-6 py-3.5 font-bold uppercase tracking-wider text-[10px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTreatments.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                  <p className="font-semibold text-slate-600">No procedures found</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try changing your search or add a new treatment</p>
                </td>
              </tr>
            ) : (
              filteredTreatments.map((t) => {
                const isActive = t.status === 'Active';
                return (
                  <tr key={t.id || t.treatment} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        <span>{t.treatment}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 font-medium">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-700">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.duration}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{t.price}</td>
                    <td className="px-6 py-3.5">
                      <Badge color={t.color || (isActive ? 'green' : 'amber')}>
                        {t.status || 'Active'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Status */}
                        <button
                          onClick={(e) => handleToggleStatus(t.id || t.treatment, e)}
                          title={isActive ? 'Deactivate Treatment' : 'Activate Treatment'}
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
                            setTreatmentToEdit(t);
                            setIsModalOpen(true);
                          }}
                          title="Edit Procedure"
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setTreatmentToDelete(t)}
                          title="Delete Procedure"
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

      {/* Add / Edit Modal */}
      <AddTreatmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTreatment}
        treatmentToEdit={treatmentToEdit}
      />

      {/* Delete Confirmation */}
      {treatmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Treatment Procedure?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to remove <span className="font-semibold text-slate-800">"{treatmentToDelete.treatment}"</span>?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setTreatmentToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTreatment}
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

export default TreatmentsConfigView;
