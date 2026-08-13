import { useState, useMemo } from 'react';
import { Search, Plus, Building2, Edit3, ChevronRight, Eye } from 'lucide-react';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';

export function OrganizationsTable({
  organizations = [],
  onOpenCreate,
  onOpenEdit,
  onSelectOrg,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrgs = useMemo(() => {
    if (!searchQuery.trim()) return organizations;
    const q = searchQuery.toLowerCase();
    return organizations.filter((org) => org.name.toLowerCase().includes(q));
  }, [organizations, searchQuery]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden space-y-0">
      {/* Section Header */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Organizations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage all organizations on the platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenCreate}
          >
            New Organization
          </Button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Organization</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Clinics</th>
              <th className="px-5 py-3.5 text-right">Users</th>
              <th className="px-5 py-3.5">Created Date</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredOrgs.map((org) => {
              const clinicsCount = org.clinics ? org.clinics.length : 0;
              const usersCount = org.users ? org.users.length : 0;

              return (
                <tr
                  key={org.id}
                  onClick={() => onSelectOrg && onSelectOrg(org)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Organization Name + Color */}
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: org.brandingColor || '#0F766E' }}
                      >
                        {org.name ? org.name.substring(0, 2).toUpperCase() : 'OG'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {org.name}
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {org.timezone || 'Asia/Karachi'} • {org.currency || 'USD'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <Badge variant={org.status === 'active' ? 'success' : 'warning'} dot>
                      {org.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>

                  {/* Clinics */}
                  <td className="px-5 py-4 text-right font-mono font-semibold text-slate-800">
                    {clinicsCount}
                  </td>

                  {/* Users */}
                  <td className="px-5 py-4 text-right font-mono font-semibold text-slate-800">
                    {usersCount}
                  </td>

                  {/* Created Date */}
                  <td className="px-5 py-4 text-slate-500 font-medium whitespace-nowrap">
                    {org.createdAt || 'Jan 12, 2026'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectOrg && onSelectOrg(org)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenEdit && onOpenEdit(org)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit Organization"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty States */}
      {organizations.length === 0 && (
        <div className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No organizations yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create your first organization to get started.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={onOpenCreate}
            className="mx-auto"
          >
            New Organization
          </Button>
        </div>
      )}

      {organizations.length > 0 && filteredOrgs.length === 0 && (
        <div className="p-10 text-center space-y-2">
          <p className="text-sm font-bold text-slate-900">No organizations found</p>
          <p className="text-xs text-slate-500">Try changing your search.</p>
        </div>
      )}
    </div>
  );
}
