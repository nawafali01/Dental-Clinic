import React, { useState, useEffect } from 'react';
import { X, UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { assignLead } from '@/services/leadsService';
import { usersService } from '@/services/usersService';

export function AssignLeadModal({ isOpen, onClose, onSuccess, leadId, currentAssignedTo, leadName }) {
  const { currentUser } = useAuth();
  const role = (currentUser?.role || '').toLowerCase();
  const [users, setUsers] = useState(() => usersService.getUsersSync() || []);
  const [selectedUserId, setSelectedUserId] = useState(currentAssignedTo || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(currentAssignedTo || '');
      setIsLoading(true);
      usersService.fetchUsers()
        .then((res) => {
          if (res?.data && Array.isArray(res.data)) {
            setUsers(res.data);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, currentAssignedTo]);

  if (!isOpen || role === 'finance' || role === 'auditor') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error('Please select a user to assign the lead.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await assignLead(leadId, selectedUserId, currentUser);
      toast.success(res?.message || 'Lead assigned successfully!');
      onSuccess?.(selectedUserId);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to assign lead');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Assign Lead</h2>
              {leadName && <p className="text-xs text-slate-500 font-medium">Lead: {leadName}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Select Agent / Staff Member
            </label>
            {isLoading && users.length === 0 ? (
              <div className="flex items-center gap-2 py-3 px-3 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Loading available users...</span>
              </div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all cursor-pointer"
                required
              >
                <option value="">-- Choose User --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.name || u.email} ({u.role?.replace('_', ' ') || 'Staff'})
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-slate-400 mt-1.5">
              Target endpoint: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">POST /api/v1/leads/{'{lead_id}'}/assign?user_id={'{user_id}'}</code>
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedUserId}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary hover:opacity-90 rounded-xl transition-opacity cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Assigning...' : 'Confirm Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
