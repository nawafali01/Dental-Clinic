import React from 'react';
import { UserPlus, ArrowRight } from 'lucide-react';
import { getUserResourceAccess } from '../../utils/hasPermission';
import { getScopeLabel, getVisibleUsers } from '../../utils/dashboardUtils';
import { useAuth } from '@/context/AuthContext';
import { USER_ROLE_BADGES, USER_STATUS_DOTS } from '../../constants/dashboardWidgetConstants';

const UsersWidget = () => {
  const { currentUser } = useAuth();
  const accessLevel  = getUserResourceAccess('users');
  const scopeLabel   = getScopeLabel('users', accessLevel) || 'Users';
  const visibleUsers = getVisibleUsers(accessLevel, currentUser);

  const canInvite = ['all', 'manage_org', 'clinic_team'].includes(accessLevel);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Users</h2>
          <p className="text-xs text-slate-500 mt-0.5">{scopeLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {canInvite && (
            <button className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-semibold hover:bg-slate-700 transition-colors">
              <UserPlus className="w-3 h-3" />
              Invite
            </button>
          )}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">
            Users
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {visibleUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3 py-2.5">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${USER_STATUS_DOTS[user.status] ?? 'bg-slate-400'}`} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize shrink-0 ${USER_ROLE_BADGES[user.role] ?? 'bg-slate-100 text-slate-600'}`}>
              {user.role.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>

      {accessLevel !== 'self' && (
        <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors">
          Manage users <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </section>
  );
};

export default UsersWidget;
