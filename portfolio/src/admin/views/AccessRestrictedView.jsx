import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useRole } from '../context/RoleContext';

export default function AccessRestrictedView({ requiredPermission = 'Super Admin Level' }) {
  const navigate = useNavigate();
  const { currentRole } = useRole();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 mb-2">
            <Badge variant="error" dot>
              Access Restricted
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Permission Required
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your current role <span className="font-semibold text-slate-700 dark:text-slate-300">({currentRole.label})</span> does not have authorization to view this module.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-left flex items-start gap-3">
          <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Platform Governance Policy</span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Multi-tenant management, AI governance, and global audit logs are strictly reserved for Super Admin accounts.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/dashboard')}
            className="w-full"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
