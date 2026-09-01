import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { completeTask } from '@/services/tasksService';

export function TaskCompleteModal({ isOpen, onClose, task, onSuccess }) {
  const [completionNotes, setCompletionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleComplete = () => {
    setIsSubmitting(true);
    try {
      const updated = completeTask(task.id, completionNotes.trim());
      if (updated) {
        toast.success(`Task marked as completed`);
        onSuccess?.(updated);
        onClose();
      } else {
        toast.error('Failed to complete task');
      }
    } catch (err) {
      console.error('Error completing task:', err);
      toast.error('Could not complete task');
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

      {/* Card */}
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle className="size-5" />
            <h3 className="font-bold text-slate-900 text-base">Complete Task</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              Task
            </p>
            <p className="text-sm font-semibold text-slate-900">{task.title}</p>
            {task.leadName && (
              <p className="text-xs text-slate-500 mt-0.5">
                Linked Lead: <span className="font-medium text-slate-700">{task.leadName}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
              Completion Notes / Remarks (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Spoke with patient, appointment booked for Thursday 2 PM..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle className="size-4" />
            {isSubmitting ? 'Saving...' : 'Mark Completed'}
          </button>
        </div>
      </div>
    </div>
  );
}
