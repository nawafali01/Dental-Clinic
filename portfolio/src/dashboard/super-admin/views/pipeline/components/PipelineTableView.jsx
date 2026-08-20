import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Sparkles,
  Phone,
  Mail,
  ArrowUpRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Card } from '@/dashboard/shared/components/ui/Card';
import { Badge } from '@/dashboard/shared/components/ui/Badge';
import { Button } from '@/dashboard/shared/components/ui/Button';

export const PipelineTableView = ({
  isLoading,
  leads,
  paginatedLeads,
  currentPage,
  totalPages,
  pageSize,
  setCurrentPage,
  onSelectLead,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge variant="info" dot>New</Badge>;
      case 'contacted':
        return <Badge variant="warning" dot>Contacted</Badge>;
      case 'booked':
        return <Badge variant="purple" dot>Booked</Badge>;
      case 'attended':
        return <Badge variant="purple" dot>Attended</Badge>;
      case 'converted':
        return <Badge variant="success" dot>Converted</Badge>;
      case 'lost':
        return <Badge variant="error" dot>Lost</Badge>;
      default:
        return <Badge variant="neutral" dot>{status || 'Pending'}</Badge>;
    }
  };

  const getPriorityBadge = (priority, score) => {
    if (priority === 'high' || (score && score >= 80)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Hot ({score || 88})
        </span>
      );
    }
    if (priority === 'medium' || (score && score >= 50)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Med ({score || 64})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Low ({score || 42})
      </span>
    );
  };

  return (
    <Card
      title="Lead Directory & Acquisition Records"
      subtitle="Complete CRM records with cross-clinic attribution and status progression"
      action={
        <span className="text-xs font-semibold text-slate-500">
          Showing {paginatedLeads.length} of {leads.length} Leads
        </span>
      }
    >
      {isLoading ? (
        <div className="space-y-2 py-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
          ))}
        </div>
      ) : leads.length === 0 ? (
        <div className="py-14 text-center text-slate-500 text-xs">
          <div className="text-sm font-semibold text-slate-800">No leads match the current filters</div>
          <div className="mt-1 text-slate-400">
            Try adjusting your search query, organization, clinic, status, or channel filters.
          </div>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500">
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Patient Name & Contact</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Clinic & Org</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Treatment</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Source / Channel</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Assigned Agent</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider">AI Score & Priority</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeads.map((lead) => {
                  const initials = (lead.patientName || 'Lead')
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      {/* Patient Name & Contact */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/20">
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                              {lead.patientName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal flex items-center gap-2 mt-0.5">
                              <span>{lead.phone || '+1-555-0199'}</span>
                              <span>•</span>
                              <span className="truncate max-w-[140px]">{lead.email || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Clinic & Org */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-xs text-slate-800">{lead.clinicName || 'Downtown Branch'}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{lead.orgName || 'Smile Care Group'}</div>
                      </td>

                      {/* Treatment Interest */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">
                          {lead.treatment || 'Dental Implant'}
                        </span>
                      </td>

                      {/* Attribution Source */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {lead.source || 'Google Ads'}
                        </span>
                      </td>

                      {/* Assigned Agent */}
                      <td className="py-3.5 px-4">
                        {lead.assignedAgentName ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="truncate max-w-[120px]">{lead.assignedAgentName}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <UserX className="w-3 h-3" />
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* AI Score & Priority */}
                      <td className="py-3.5 px-4 text-center">
                        {getPriorityBadge(lead.priority, lead.aiScore)}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(lead.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 border border-primary/20 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page <strong className="text-slate-800">{currentPage}</strong> of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
