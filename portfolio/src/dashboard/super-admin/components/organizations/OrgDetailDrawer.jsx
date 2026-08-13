import { X, Building2, MapPin, Users, Edit3, Calendar, Globe, DollarSign } from 'lucide-react';
import { Badge } from '@/dashboard/shared/components/ui/Badge';

export function OrgDetailDrawer({ isOpen, onClose, org, onEdit }) {
  if (!isOpen || !org) return null;

  const clinics = org.clinics || [];
  const users = org.users || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-150">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-2xs"
                style={{ backgroundColor: org.brandingColor || '#0F766E' }}
              >
                {org.name ? org.name.substring(0, 2).toUpperCase() : 'OG'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">{org.name}</h2>
                  <Badge variant={org.status === 'active' ? 'success' : 'warning'} dot>
                    {org.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">ID: {org.id}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  if (onEdit) onEdit(org);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Organization Metadata */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Organization Details
              </h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <Globe className="w-3.5 h-3.5" /> Timezone
                  </span>
                  <span className="font-semibold text-slate-800">{org.timezone || 'Asia/Karachi'}</span>
                </div>
                <div>
                  <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <DollarSign className="w-3.5 h-3.5" /> Currency
                  </span>
                  <span className="font-semibold text-slate-800">{org.currency || 'USD'}</span>
                </div>
                <div>
                  <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                    <Calendar className="w-3.5 h-3.5" /> Created Date
                  </span>
                  <span className="font-semibold text-slate-800">{org.createdAt || 'Jan 12, 2026'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Branding Color</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: org.brandingColor || '#0F766E' }}
                    />
                    <span className="font-mono font-semibold text-slate-800">
                      {org.brandingColor || '#0F766E'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinics Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Clinics ({clinics.length})
                </h3>
              </div>

              {clinics.length > 0 ? (
                <div className="space-y-2">
                  {clinics.map((clinic) => (
                    <div
                      key={clinic.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-800">{clinic.name}</span>
                      </div>
                      <Badge variant={clinic.status === 'active' ? 'success' : 'warning'}>
                        {clinic.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No clinics found
                </div>
              )}
            </div>

            {/* Users Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  Associated Users ({users.length})
                </h3>
              </div>

              {users.length > 0 ? (
                <div className="space-y-2">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                          {u.name ? u.name.charAt(0) : 'U'}
                        </div>
                        <span className="text-xs font-semibold text-slate-800">{u.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 capitalize">
                        {u.role ? u.role.replace('_', ' ') : 'User'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No users found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
