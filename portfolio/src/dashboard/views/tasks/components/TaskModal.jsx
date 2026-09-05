import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, User, Flag, Layers, AlertCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { storageService } from '@/services/storage.service';
import {
  createTask,
  updateTask,
  TASK_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '@/services/tasksService';

export function TaskModal({
  isOpen,
  onClose,
  onSuccess,
  task = null, // if provided, modal is in Edit mode
  currentUser,
  selectedClinicId,
}) {
  const isEdit = Boolean(task && task.id);

  // Load available users and leads from storage for dropdown selections
  const users = useMemo(() => {
    const rawUsers = storageService.get(storageService.KEYS.USERS) || [];
    return rawUsers.filter((u) => u.status !== 'inactive');
  }, []);

  const leads = useMemo(() => {
    return storageService.get(storageService.KEYS.LEADS) || [];
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'Call',
    assignee_id: '',
    linked_lead_id: '',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '09:00',
    priority: 'Normal',
    status: 'Pending',
    completion_notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when task changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({
          title: task.title || task.leadName || '',
          type: task.type || task.taskType || 'Call',
          assignee_id: task.assignee_id || task.assigneeId || task.assignedAgentId || currentUser?.id || '',
          linked_lead_id: task.linked_lead_id || task.leadId || '',
          due_date: task.due_date ? String(task.due_date).substring(0, 10) : new Date().toISOString().split('T')[0],
          due_time: task.due_time || task.dueTime || '09:00',
          priority: task.priority || 'Normal',
          status: task.status || 'Pending',
          completion_notes: task.completion_notes || task.completionNotes || '',
        });
      } else {
        // Defaults for new task
        setFormData({
          title: '',
          type: 'Call',
          assignee_id: currentUser?.id || (users[0]?.id || ''),
          linked_lead_id: '',
          due_date: new Date().toISOString().split('T')[0],
          due_time: '09:00',
          priority: 'Normal',
          status: 'Pending',
          completion_notes: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, task, currentUser, users]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Task title is required';
    }
    if (!formData.due_date) {
      errs.due_date = 'Due date is required';
    }
    if (!formData.assignee_id) {
      errs.assignee_id = 'Please select an assignee';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Find selected lead name if linked
      const selectedLead = leads.find((l) => l.id === formData.linked_lead_id);
      const leadName = selectedLead ? (selectedLead.patientName || selectedLead.name || '') : '';

      const taskPayload = {
        ...formData,
        leadName,
        clinic_id: selectedClinicId && selectedClinicId !== 'all' ? selectedClinicId : (currentUser?.clinicId || 'clinic-downtown'),
        organization_id: currentUser?.organizationId || null,
      };

      if (isEdit) {
        const updated = updateTask(task.id, taskPayload);
        if (updated) {
          toast.success('Task updated successfully');
          onSuccess?.(updated);
          onClose();
        } else {
          toast.error('Failed to update task');
        }
      } else {
        const created = createTask(taskPayload, currentUser);
        if (created) {
          toast.success('Task created successfully');
          onSuccess?.(created);
          onClose();
        } else {
          toast.error('Failed to create task');
        }
      }
    } catch (err) {
      console.error('Error saving task:', err);
      toast.error('An unexpected error occurred while saving the task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit
                ? 'Update task details, schedule, or assignee'
                : 'Add a new action item, reminder, or follow-up'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Call patient to confirm implant consultation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                errors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
              } rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="size-3.5" /> {errors.title}
              </p>
            )}
          </div>

          {/* Type & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                {TASK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assignee & Linked Lead Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Assignee <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                  errors.assignee_id ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
              >
                <option value="">Select Assignee</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.name || u.email} ({u.role?.replace('_', ' ')})
                  </option>
                ))}
              </select>
              {errors.assignee_id && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3.5" /> {errors.assignee_id}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Linked Lead / Patient
              </label>
              <select
                value={formData.linked_lead_id}
                onChange={(e) => setFormData({ ...formData, linked_lead_id: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
                <option value="">None (General Task)</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.patientName || l.name || 'Lead'} — {l.treatment || l.source || 'General'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Due Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                    errors.due_date ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  } rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all`}
                />
              </div>
              {errors.due_date && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="size-3.5" /> {errors.due_date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                Due Time
              </label>
              <input
                type="time"
                value={formData.due_time}
                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              >
              </input>
            </div>
          </div>

          {/* Status (when editing or creating custom) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Completion Notes (always editable or useful when completed) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Completion Notes / Remarks
            </label>
            <textarea
              rows={2}
              placeholder="Add outcome remarks or follow-up instructions..."
              value={formData.completion_notes}
              onChange={(e) => setFormData({ ...formData, completion_notes: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
