import React from 'react';
import { ChevronRight } from 'lucide-react';
import { getUserResourceAccess } from '../../utils/hasPermission';
import { SETTING_ICON_COLORS } from '../../constants/dashboardWidgetConstants';
import { getScopeLabel, getVisibleSettings } from '../../utils/dashboardUtils';
import { useAuth } from '@/context/AuthContext';

const SettingsWidget = () => {
  const { currentUser } = useAuth();
  const accessLevel = getUserResourceAccess('settings', currentUser?.role);
  const scopeLabel  = getScopeLabel('settings', accessLevel) || 'Settings';
  const settings    = getVisibleSettings(accessLevel);

  if (settings.length === 0) return null;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">{scopeLabel}</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-600">
          Config
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {settings.map((s) => {
          const Icon      = s.icon;
          const iconColor = SETTING_ICON_COLORS[s.icon.displayName] ?? SETTING_ICON_COLORS.Settings;

          return (
            <button
              key={s.id}
              className="w-full flex items-center gap-3 py-3 text-left hover:bg-slate-50 rounded-xl px-1 transition-colors group"
            >
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 group-hover:text-slate-700">{s.title}</p>
                <p className="text-[10px] text-slate-500">{s.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default SettingsWidget;
